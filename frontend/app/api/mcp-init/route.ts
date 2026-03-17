import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { assertUserIsOrgMember, getSession } from "@/lib/auth/server";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

const mcpInitRequestSchema = z.object({
	serverId: z.string().uuid(),
	envHeaders: z.record(z.string(), z.string()).optional(),
});

export async function POST(req: Request) {
	const session = await getSession();

	if (!session) {
		return Response.json({ error: "Authentication required" }, { status: 401 });
	}

	const orgId = session.session.activeOrganizationId;
	if (!orgId) {
		return Response.json({ error: "No active organization" }, { status: 400 });
	}

	let serverId: string;
	let envHeaders: Record<string, string> | undefined;

	try {
		const body = await req.json();
		const parsed = mcpInitRequestSchema.parse(body);
		serverId = parsed.serverId;
		envHeaders = parsed.envHeaders;
	} catch (error) {
		logger.warn({ error }, "Invalid mcp-init request body");
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
	const backendUrl = env.NEXT_PUBLIC_PYTHON_BACKEND_URL ?? env.PYTHON_BACKEND_URL ?? "";

	const xEnvHeaders: Record<string, string> = {};
	if (envHeaders) {
		for (const [key, value] of Object.entries(envHeaders)) {
			xEnvHeaders[`X-Env-${key}`] = value;
		}
	}

	const mcpUrl = `${backendUrl}/mcp/${serverId}/mcp`;
	const baseHeaders: Record<string, string> = {
		...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
		"Content-Type": "application/json",
		Accept: "application/json, text/event-stream",
		...xEnvHeaders,
	};

	// Step 1: initialize
	let initResponse: Response;
	try {
		initResponse = await fetch(mcpUrl, {
			method: "POST",
			signal: AbortSignal.timeout(30000),
			headers: baseHeaders,
			body: JSON.stringify({
				jsonrpc: "2.0",
				method: "initialize",
				params: {
					protocolVersion: "2024-11-05",
					capabilities: {},
					clientInfo: { name: "AutoMCP Tool Tester", version: "1.0" },
				},
				id: 1,
			}),
		});
	} catch (error) {
		logger.error({ error, serverId }, "MCP initialize request failed");
		return Response.json({ error: "Failed to reach MCP server" }, { status: 502 });
	}

	if (!initResponse.ok) {
		const text = await initResponse.text().catch(() => "");
		logger.error({ status: initResponse.status, body: text, serverId }, "MCP initialize returned error");
		return Response.json(
			{ error: `MCP server returned HTTP ${initResponse.status} during initialize` },
			{ status: 502 },
		);
	}

	const sessionId = initResponse.headers.get("mcp-session-id");
	if (!sessionId) {
		logger.error({ serverId }, "MCP initialize response missing Mcp-Session-Id header");
		return Response.json({ error: "MCP server did not return a session ID" }, { status: 502 });
	}

	// Step 2: notifications/initialized
	try {
		await fetch(mcpUrl, {
			method: "POST",
			signal: AbortSignal.timeout(10000),
			headers: {
				...baseHeaders,
				"Mcp-Session-Id": sessionId,
			},
			body: JSON.stringify({
				jsonrpc: "2.0",
				method: "notifications/initialized",
				params: {},
			}),
		});
	} catch (error) {
		// Non-fatal: log but continue — session may still be valid
		logger.warn({ error, serverId }, "MCP notifications/initialized request failed");
	}

	return Response.json({ sessionId });
}
