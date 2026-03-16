import { z } from "zod";
import { assertUserIsOrgMember, getSession } from "@/lib/auth/server";
import { logger } from "@/lib/logger";
import { pythonBackendClient } from "@/lib/python-backend/client";

export const maxDuration = 60;

const wizardChatRequestSchema = z.object({
	messages: z.array(
		z
			.object({
				role: z.enum(["user", "assistant", "system"]),
				content: z.string().optional(),
			})
			.passthrough(),
	),
	organizationId: z.string().uuid(),
	serverId: z.string().uuid().optional(),
});

// Standard error response helper
function errorResponse(
	error: string,
	message: string,
	status: number,
	details?: Record<string, unknown>,
) {
	return Response.json(
		{ error, message, ...(details && { details }) },
		{ status },
	);
}

export async function POST(req: Request) {
	const session = await getSession();

	if (!session) {
		return errorResponse("unauthorized", "Authentication required", 401);
	}

	// Validate request body
	let lastUserMessage: string;
	let organizationId: string;
	let serverId: string | undefined;

	try {
		const body = await req.json();
		const parsed = wizardChatRequestSchema.parse(body);

		organizationId = parsed.organizationId;
		serverId = parsed.serverId;

		// Extract just the last user message – the backend manages full history
		const userMessages = parsed.messages
			.filter((m) => m.role === "user")
			.map((msg) => {
				const msgAny = msg as unknown as {
					parts?: { type: string; text?: string }[];
					content?: string;
				};
				if (Array.isArray(msgAny.parts)) {
					const textPart = msgAny.parts.find((p) => p.type === "text");
					if (textPart?.text) return textPart.text;
				}
				return typeof msgAny.content === "string" ? msgAny.content : "";
			});

		const last = userMessages[userMessages.length - 1];
		if (!last) {
			return errorResponse("invalid_request", "No user message found", 400);
		}
		lastUserMessage = last;
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
			"Wizard chat access denied - user not member of organization",
		);
		return errorResponse("forbidden", "Access denied", 403);
	}

	try {
		// If no serverId, create a session first
		if (!serverId) {
			const sessionResponse = await pythonBackendClient.post<{
				serverId: string;
			}>("/api/wizard/sessions", {
				customerId: organizationId,
			});
			serverId = sessionResponse.data.serverId;
		}

		// Proxy to the Python backend chat endpoint with streaming
		const backendResponse = await pythonBackendClient.post(
			`/api/wizard/${serverId}/chat`,
			{
				message: lastUserMessage,
				stream: true,
			},
			{
				responseType: "stream",
				headers: {
					Accept: "text/plain; charset=utf-8",
				},
			},
		);

		// Pass the stream through to the frontend
		const stream = backendResponse.data as ReadableStream;
		return new Response(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
				"X-Server-Id": serverId,
			},
		});
	} catch (error) {
		logger.error({ error, serverId }, "Wizard chat proxy error");
		return errorResponse(
			"internal_error",
			"Failed to process wizard chat",
			500,
		);
	}
}
