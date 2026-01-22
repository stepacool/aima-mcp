/**
 * Utilities for generating MCP server installation deeplinks and configurations
 * for various MCP clients (Cursor, LM Studio, VS Code, etc.)
 */

export interface McpServerConfig {
	url: string;
	headers?: Record<string, string>;
}

/**
 * Generates a Cursor deeplink for installing an MCP server.
 * Format: cursor://anysphere.cursor-deeplink/mcp/install?name=$NAME&config=$BASE64_ENCODED_CONFIG
 */
export function generateCursorDeeplink(
	serverName: string,
	config: McpServerConfig,
): string {
	const configJson = JSON.stringify(config);
	const base64Config = btoa(configJson);
	const encodedConfig = encodeURIComponent(base64Config);
	const encodedName = encodeURIComponent(serverName);

	return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodedName}&config=${encodedConfig}`;
}

/**
 * Generates an LM Studio deeplink for installing an MCP server.
 * Format: lmstudio://add_mcp?name=$NAME&config=$BASE64_ENCODED_CONFIG
 */
export function generateLmStudioDeeplink(
	serverName: string,
	config: McpServerConfig,
): string {
	const configJson = JSON.stringify(config);
	const base64Config = btoa(configJson);
	const encodedConfig = encodeURIComponent(base64Config);
	const encodedName = encodeURIComponent(serverName);

	return `lmstudio://add_mcp?name=${encodedName}&config=${encodedConfig}`;
}

/**
 * Generates a VS Code deeplink for installing an MCP server.
 * Format: vscode://mcp/install?config=<base64-encoded-json>
 *
 * VS Code supports HTTP transport for MCP servers.
 */
export function generateVSCodeDeeplink(
	serverName: string,
	config: McpServerConfig,
): string {
	// VS Code expects the full mcpServers configuration structure
	const vscodeConfig = {
		mcpServers: {
			[serverName]: {
				url: config.url,
				...(config.headers && { headers: config.headers }),
			},
		},
	};

	const configJson = JSON.stringify(vscodeConfig);
	const base64Config = btoa(configJson);
	const encodedConfig = encodeURIComponent(base64Config);

	return `vscode://mcp/install?config=${encodedConfig}`;
}

/**
 * Generates a Raycast deeplink for installing an MCP server.
 * Format: raycast://mcp/install?<configuration-json-percent-encoded>
 *
 * Note: Raycast currently only supports stdio transport, not HTTP.
 * This function generates a deeplink, but HTTP-based servers won't work
 * until Raycast adds HTTP transport support.
 */
export function generateRaycastDeeplink(
	serverName: string,
	config: McpServerConfig,
): string {
	// Raycast expects a different format - stdio-based configuration
	// Since our servers are HTTP-based, we'll create a config that won't work
	// but provides the structure. Users will need to wait for HTTP support.
	const raycastConfig = {
		name: serverName,
		type: "http", // Note: not officially supported yet
		url: config.url,
		...(config.headers && { headers: config.headers }),
	};

	const configJson = JSON.stringify(raycastConfig);
	const encodedConfig = encodeURIComponent(configJson);

	return `raycast://mcp/install?${encodedConfig}`;
}

/**
 * Generates a Claude Code CLI command for installing an MCP server.
 * Format: claude mcp add --transport http <name> <url> [--header "Authorization: Bearer <token>"]
 *
 * Claude Code uses CLI commands, not deeplinks.
 */
export function generateClaudeCodeCommand(
	serverName: string,
	config: McpServerConfig,
): string {
	let command = `claude mcp add --transport http ${serverName} ${config.url}`;

	if (config.headers?.Authorization) {
		command += ` --header "${config.headers.Authorization}"`;
	}

	return command;
}

/**
 * Generates MCP server JSON configuration for manual setup
 * (Windsurf, Claude Desktop, etc.)
 */
export function generateMcpJsonConfig(
	serverName: string,
	config: McpServerConfig,
): string {
	const mcpConfig = {
		mcpServers: {
			[serverName]: {
				url: config.url,
				...(config.headers && { headers: config.headers }),
			},
		},
	};

	return JSON.stringify(mcpConfig, null, 2);
}

/**
 * Creates MCP server configuration from server details
 */
export function createMcpConfig(
	endpointUrl: string,
	bearerToken?: string | null,
): McpServerConfig {
	const config: McpServerConfig = {
		url: endpointUrl,
	};

	if (bearerToken) {
		config.headers = {
			Authorization: `Bearer ${bearerToken}`,
		};
	}

	return config;
}
