import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { assertUserIsOrgMember, getSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const mcpCallRequestSchema = z.object({
	serverId: z.string().uuid(),
	toolName: z.string().min(1),
	arguments: z.record(z.string(), z.unknown()).default({}),
	envHeaders: z.record(z.string(), z.string()).optional(),
	sessionId: z.string().optional(),
});

export async function POST(req: Request) {
	const session = await getSession();

	if (!session) {
		return Response.json({ error: "Authentication required" }, { status: 401 });
	}

	const orgId = session.session.activeOrganizationId;
	if (!orgId) {
		return Response.json(
			{ error: "No active organization" },
			{ status: 400 },
		);
	}

	let serverId: string;
	let toolName: string;
	let args: Record<string, unknown>;
	let envHeaders: Record<string, string> | undefined;
	let sessionId: string | undefined;

	try {
		const body = await req.json();
		const parsed = mcpCallRequestSchema.parse(body);
		serverId = parsed.serverId;
		toolName = parsed.toolName;
		args = parsed.arguments;
		envHeaders = parsed.envHeaders;
		sessionId = parsed.sessionId;
	} catch (error) {
		logger.warn({ error }, "Invalid mcp-call request body");
		return Response.json({ error: "Invalid request body" }, { status: 400 });
	}

	try {
		await assertUserIsOrgMember(orgId, session.user.id);
	} catch (error) {
		if (error instanceof TRPCError) {
			return Response.json({ error: "Access denied" }, { status: 403 });
		}
		return Response.json({ error: "Access denied" }, { status: 403 });
	}

	const adminKey = env.PYTHON_BACKEND_API_KEY;

	const backendUrl =
		env.NEXT_PUBLIC_PYTHON_BACKEND_URL ?? env.PYTHON_BACKEND_URL ?? "";

	let mcpResponse: Response;
	try {
		const xEnvHeaders: Record<string, string> = {};
		if (envHeaders) {
			for (const [key, value] of Object.entries(envHeaders)) {
				xEnvHeaders[`X-Env-${key}`] = value;
			}
		}

		mcpResponse = await fetch(`${backendUrl}/mcp/${serverId}/mcp`, {
			method: "POST",
			signal: AbortSignal.timeout(30000),
			headers: {
				...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
				"Content-Type": "application/json",
				Accept: "application/json, text/event-stream",
				...(sessionId ? { "Mcp-Session-Id": sessionId } : {}),
				...xEnvHeaders,
			},
			body: JSON.stringify({
				jsonrpc: "2.0",
				method: "tools/call",
				params: { name: toolName, arguments: args },
				id: 1,
			}),
		});
	} catch (error) {
		logger.error({ error, serverId, toolName }, "MCP tool call request failed");
		return Response.json(
			{ error: "Failed to reach MCP server" },
			{ status: 502 },
		);
	}

	let responseData: { result?: { content: unknown[] }; error?: { message: string; code?: number } } =
		{} as { result?: { content: unknown[] }; error?: { message: string; code?: number } };
	try {
		const contentType = mcpResponse.headers.get("content-type") ?? "";
		if (contentType.includes("text/event-stream")) {
			const text = await mcpResponse.text();
			let parsed = false;
			for (const line of text.split("\n")) {
				if (line.startsWith("data: ")) {
					responseData = JSON.parse(line.slice(6));
					parsed = true;
					break;
				}
			}
			if (!parsed) throw new Error("No data line found in SSE response");
		} else {
			responseData = await mcpResponse.json();
		}
	} catch (error) {
		logger.error({ error }, "Failed to parse MCP server response");
		return Response.json(
			{ error: "Invalid response from MCP server" },
			{ status: 502 },
		);
	}

	if (!mcpResponse.ok) {
		const detail =
			(responseData as { detail?: string }).detail ??
			(responseData as { error?: { message?: string } }).error?.message ??
			`MCP server returned HTTP ${mcpResponse.status}`;
		return Response.json({ error: detail }, { status: 400 });
	}

	if (responseData.error) {
		return Response.json({ error: responseData.error }, { status: 400 });
	}

	const content = responseData.result?.content ?? [];
	return Response.json({ content });
}
