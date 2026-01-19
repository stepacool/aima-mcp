import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod/v4";
import { assertUserIsOrgMember, getSession } from "@/lib/auth/server";
import { logger } from "@/lib/logger";
import { STEP_ZERO_SYSTEM_PROMPT } from "@/lib/wizard/prompts";

export const maxDuration = 30;

// Input validation schema
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

/**
 * Streaming chat endpoint for the MCP Server Creation Wizard (Step 0).
 * This endpoint handles the initial onboarding conversation where the AI helps
 * users describe what kind of MCP server they want to build.
 *
 * Step 0 is client-side only - messages are not persisted to database.
 * All wizard state after Step 0 is managed by the Python backend.
 */
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

		organizationId = parsed.organizationId;

		// Normalize messages to ensure proper content string
		messages = parsed.messages.map((msg) => {
			let content = msg.content ?? "";

			// If content is missing, try to extract from parts
			if (!content) {
				const msgAny = msg as unknown as {
					parts?: { type: string; text?: string }[];
				};
				if (Array.isArray(msgAny.parts)) {
					const textPart = msgAny.parts.find((p) => p.type === "text");
					if (textPart?.text) {
						content = textPart.text;
					}
				}
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
		model: openai("gpt-4o-mini"),
		messages: messagesWithSystem,
	});

	return result.toTextStreamResponse();
}
