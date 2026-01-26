import { z } from "zod/v4";
import { getSession } from "@/lib/auth/server";
import { logger } from "@/lib/logger";
import { pythonBackendClient } from "@/lib/python-backend/client";

// Input validation schema
const createCodeRequestSchema = z.object({
	clientId: z.string().min(1),
	userId: z.string().min(1),
	redirectUri: z.string().url(),
	scope: z.string().min(1),
	codeChallenge: z.string().min(1),
	codeChallengeMethod: z.string().min(1),
	state: z.string().optional(),
	serverId: z.string().uuid(),
});

// Error response helper
function errorResponse(
	error: string,
	description: string,
	status: number,
): Response {
	return Response.json({ error, error_description: description }, { status });
}

/**
 * POST /api/oauth/authorize/create-code
 *
 * Internal API route that proxies authorization code creation to the backend.
 * Verifies the user's session and ensures the userId matches the authenticated user.
 */
export async function POST(req: Request): Promise<Response> {
	// Verify user session
	const session = await getSession();

	if (!session) {
		return errorResponse("unauthorized", "Authentication required", 401);
	}

	// Parse and validate request body
	let body: z.infer<typeof createCodeRequestSchema>;
	try {
		const rawBody = await req.json();
		body = createCodeRequestSchema.parse(rawBody);
	} catch (error) {
		logger.warn({ error }, "Invalid create-code request body");
		return errorResponse("invalid_request", "Invalid request body", 400);
	}

	// Verify the userId matches the authenticated user
	if (body.userId !== session.user.id) {
		logger.warn(
			{ requestedUserId: body.userId, actualUserId: session.user.id },
			"User ID mismatch in OAuth create-code request",
		);
		return errorResponse(
			"invalid_request",
			"User ID does not match authenticated user",
			400,
		);
	}

	try {
		// Forward request to backend (per-MCP-server OAuth endpoint)
		const response = await pythonBackendClient.post(
			`/mcp/${body.serverId}/oauth/authorize/create-code`,
			{
				clientId: body.clientId,
				userId: body.userId,
				redirectUri: body.redirectUri,
				scope: body.scope,
				codeChallenge: body.codeChallenge,
				codeChallengeMethod: body.codeChallengeMethod,
				state: body.state,
				serverId: body.serverId,
			},
		);

		return Response.json(response.data);
	} catch (error) {
		// Handle axios errors
		if (error && typeof error === "object" && "response" in error) {
			const axiosError = error as {
				response?: {
					status: number;
					data?: { error?: string; error_description?: string };
				};
			};
			const status = axiosError.response?.status ?? 500;
			const errorCode = axiosError.response?.data?.error ?? "server_error";
			const errorDesc =
				axiosError.response?.data?.error_description ??
				"Failed to create authorization code";

			logger.error(
				{ error: errorCode, status },
				"Backend OAuth create-code failed",
			);
			return errorResponse(errorCode, errorDesc, status);
		}

		logger.error({ error }, "Unexpected error in OAuth create-code");
		return errorResponse("server_error", "An unexpected error occurred", 500);
	}
}
