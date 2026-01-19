import { logger } from "@/lib/logger";
import { pythonBackendClient } from "./client";

// Types for server API responses

export interface ServerTool {
	id: string;
	name: string;
	description: string;
	parameters: Record<string, unknown>[];
	hasCode: boolean;
}

export interface ServerListItem {
	id: string;
	name: string;
	description: string | null;
	status: string;
	wizardStep: string;
	toolsCount: number;
	isDeployed: boolean;
	mcpEndpoint: string | null;
	createdAt: string;
}

export interface ServerListResponse {
	servers: ServerListItem[];
}

export interface ServerDetails {
	id: string;
	name: string;
	description: string | null;
	status: string;
	wizardStep: string;
	authType: string;
	authConfig: Record<string, unknown> | null;
	tier: string;
	isDeployed: boolean;
	mcpEndpoint: string | null;
	tools: ServerTool[];
	createdAt: string;
	updatedAt: string;
}

/**
 * Lists all MCP servers for a customer.
 */
export async function listServers(
	customerId: string
): Promise<ServerListResponse> {
	try {
		const response = await pythonBackendClient.get<ServerListResponse>(
			`/api/servers/list/${customerId}`
		);
		logger.info(
			{ customerId, count: response.data.servers.length },
			"Fetched server list from Python backend"
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ customerId, error },
			"Failed to list servers from Python backend"
		);
		throw error;
	}
}

/**
 * Gets detailed information about a specific server.
 */
export async function getServerDetails(
	serverId: string
): Promise<ServerDetails> {
	try {
		const response = await pythonBackendClient.get<ServerDetails>(
			`/api/servers/${serverId}/details`
		);
		logger.info({ serverId }, "Fetched server details from Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to get server details from Python backend"
		);
		throw error;
	}
}

/**
 * Deletes an MCP server.
 */
export async function deleteServer(
	serverId: string
): Promise<{ status: string; serverId: string }> {
	try {
		const response = await pythonBackendClient.delete<{
			status: string;
			serverId: string;
		}>(`/api/servers/${serverId}`);
		logger.info({ serverId }, "Deleted server from Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to delete server from Python backend"
		);
		throw error;
	}
}
