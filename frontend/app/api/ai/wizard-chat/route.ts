import { createOpenAI } from "@ai-sdk/openai"; // Changed import
import { streamText } from "ai";
import { z } from "zod"; // Assuming standard zod or zod/v4
import { assertUserIsOrgMember, getSession } from "@/lib/auth/server";
import { logger } from "@/lib/logger";
import { STEP_ZERO_SYSTEM_PROMPT } from "@/lib/wizard/prompts";

export const maxDuration = 30;

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  // Optional: OpenRouter recommends these headers for rankings/analytics
  headers: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "MCP Wizard",
  },
});

const wizardChatRequestSchema = z.object({
  messages: z.array(
    z
      .object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().optional(),
      })
      .passthrough()
  ),
  organizationId: z.string().uuid(),
});

// Standard error response helper
function errorResponse(
  error: string,
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return Response.json(
    { error, message, ...(details && { details }) },
    { status }
  );
}

export async function POST(req: Request) {
  const session = await getSession();

  if (!session) {
    return errorResponse("unauthorized", "Authentication required", 401);
  }

  // Validate request body
  let messages: { role: "user" | "assistant" | "system"; content: string }[];
  let organizationId: string;

  try {
    const body = await req.json();
    const parsed = wizardChatRequestSchema.parse(body);

    logger.debug({ messages: parsed.messages }, "Received wizard chat messages");

    organizationId = parsed.organizationId;

    // Normalize messages to ensure proper content string
    // useChat sends messages with parts array, but OpenRouter expects content string
    messages = parsed.messages.map((msg) => {
      let content = "";

      // First try to extract from parts (preferred format from useChat)
      const msgAny = msg as unknown as {
        parts?: { type: string; text?: string }[];
        content?: string;
      };

      if (Array.isArray(msgAny.parts)) {
        const textPart = msgAny.parts.find((p) => p.type === "text");
        if (textPart?.text) {
          content = textPart.text;
        }
      }

      // Fall back to content string if no parts found
      if (!content && typeof msgAny.content === "string") {
        content = msgAny.content;
      }

      return {
        role: msg.role,
        content,
      };
    });
  } catch (error) {
    logger.warn({ error }, "Invalid wizard chat request body");
    return errorResponse("invalid_request", "Invalid request body", 400);
  }

  // Verify user is a member of the organization
  try {
    await assertUserIsOrgMember(organizationId, session.user.id);
  } catch (error) {
    logger.debug(
      { error, organizationId, userId: session.user.id },
      "Wizard chat access denied - user not member of organization"
    );
    return errorResponse("forbidden", "Access denied", 403);
  }

  // Prepend system message
  const messagesWithSystem = [
    { role: "system" as const, content: STEP_ZERO_SYSTEM_PROMPT },
    ...messages,
  ];

  const result = streamText({
    // Use .chat() to force Chat Completions API instead of Responses API
    // (OpenRouter doesn't support the Responses API)
    model: openrouter.chat("google/gemini-3-flash-preview"),
    messages: messagesWithSystem,
  });

  return result.toTextStreamResponse();
}
