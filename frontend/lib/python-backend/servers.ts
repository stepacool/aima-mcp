import { logger } from "@/lib/logger";
import { pythonBackendClient } from "./client";

// Types for server API responses

export interface ServerTool {
	id: string;
	name: string;
	description: string;
	parametersSchema: Record<string, unknown>[];
	code: string;
	serverId: string;
}

export interface ServerEnvironmentVariable {
	id: string;
	name: string;
	description: string;
	value: string | null;
	serverId: string;
}

export interface ServerDeployment {
	id: string;
	serverId: string;
	target: string;
	status: string;
	endpointUrl: string | null;
	targetConfig: Record<string, unknown> | null;
	errorMessage: string | null;
	deployedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ServerListItem {
	id: string;
	name: string;
	description: string | null;
	setupStatus: string;
	authType: string;
	authConfig: Record<string, unknown> | null;
	tools: ServerTool[];
	environmentVariables: ServerEnvironmentVariable[];
	deployment: ServerDeployment | null;
	toolsCount: number;
	isDeployed: boolean;
	mcpEndpoint: string | null;
	tier: string;
	createdAt: string;
	updatedAt: string;
}

export interface ServerListResponse {
	servers: ServerListItem[];
}

// ServerDetails is the same as ServerListItem (backend returns same model)
export type ServerDetails = ServerListItem;

/**
 * Lists all MCP servers for a customer.
 */
export async function listServers(
	customerId: string,
): Promise<ServerListResponse> {
	try {
		const response = await pythonBackendClient.get<ServerListResponse>(
			`/api/servers/list/${customerId}`,
		);
		logger.info(
			{ customerId, count: response.data.servers.length },
			"Fetched server list from Python backend",
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ customerId, error },
			"Failed to list servers from Python backend",
		);
		throw error;
	}
}

/**
 * Gets detailed information about a specific server.
 */
export async function getServerDetails(
	serverId: string,
): Promise<ServerDetails> {
	try {
		const response = await pythonBackendClient.get<ServerDetails>(
			`/api/servers/${serverId}/details`,
		);
		logger.info({ serverId }, "Fetched server details from Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to get server details from Python backend",
		);
		throw error;
	}
}

/**
 * Deletes an MCP server.
 */
export async function deleteServer(
	serverId: string,
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
			"Failed to delete server from Python backend",
		);
		throw error;
	}
}
