import { logger } from "@/lib/logger";
import { pythonBackendClient } from "./client";

// Types for wizard API responses

export interface WizardTool {
	name: string;
	description: string;
	inputSchema?: Record<string, unknown>;
}

export interface WizardState {
	id: string;
	customerId: string;
	step: "ACTIONS" | "AUTH" | "DEPLOY" | "COMPLETE";
	description: string;
	suggestedTools: WizardTool[];
	selectedTools: string[];
	authType: "none" | "api_key" | "oauth" | null;
	authConfig: Record<string, unknown> | null;
	generatedCode: string | null;
	serverUrl: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface StartWizardParams {
	customerId: string;
	description: string;
	openapiSchema?: string | null;
}

export interface StartWizardResponse {
	id: string;
	suggestedTools: WizardTool[];
	step: "ACTIONS";
}

export interface RefineWizardActionsParams {
	serverId: string;
	feedback: string;
	description?: string | null;
}

export interface RefineWizardActionsResponse {
	suggestedTools: WizardTool[];
}

export interface SelectWizardToolsParams {
	serverId: string;
	selectedToolNames: string[];
}

export interface SelectWizardToolsResponse {
	selectedTools: string[];
	step: "AUTH";
}

export interface ConfigureWizardAuthParams {
	serverId: string;
	authType: "none" | "api_key" | "oauth";
	authConfig?: Record<string, unknown> | null;
}

export interface ConfigureWizardAuthResponse {
	authType: "none" | "api_key" | "oauth";
	step: "DEPLOY";
}

export interface GenerateWizardCodeResponse {
	generatedCode: string;
}

export interface ActivateServerResponse {
	serverUrl: string;
	step: "COMPLETE";
}

/**
 * Starts a new wizard session in the Python backend.
 * This initiates the MCP server creation process and returns suggested tools.
 */
export async function startWizard(
	params: StartWizardParams
): Promise<StartWizardResponse> {
	try {
		const response = await pythonBackendClient.post<StartWizardResponse>(
			"/api/wizard/start",
			{
				customerId: params.customerId,
				description: params.description,
				openapiSchema: params.openapiSchema ?? null,
			}
		);
		logger.info(
			{ customerId: params.customerId, wizardId: response.data.id },
			"Wizard started in Python backend"
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ customerId: params.customerId, error },
			"Failed to start wizard in Python backend"
		);
		throw error;
	}
}

/**
 * Refines the suggested tools based on user feedback.
 */
export async function refineWizardActions(
	params: RefineWizardActionsParams
): Promise<RefineWizardActionsResponse> {
	try {
		const response = await pythonBackendClient.post<RefineWizardActionsResponse>(
			`/api/wizard/${params.serverId}/refine`,
			{
				feedback: params.feedback,
				description: params.description ?? null,
			}
		);
		logger.info(
			{ serverId: params.serverId },
			"Wizard actions refined in Python backend"
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to refine wizard actions in Python backend"
		);
		throw error;
	}
}

/**
 * Selects the tools to include in the MCP server.
 * Free tier is limited to max 3 tools.
 */
export async function selectWizardTools(
	params: SelectWizardToolsParams
): Promise<SelectWizardToolsResponse> {
	try {
		const response = await pythonBackendClient.post<SelectWizardToolsResponse>(
			`/api/wizard/${params.serverId}/tools/select`,
			{
				selectedToolNames: params.selectedToolNames,
			}
		);
		logger.info(
			{ serverId: params.serverId, selectedTools: params.selectedToolNames },
			"Wizard tools selected in Python backend"
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to select wizard tools in Python backend"
		);
		throw error;
	}
}

/**
 * Configures the authentication type for the MCP server.
 */
export async function configureWizardAuth(
	params: ConfigureWizardAuthParams
): Promise<ConfigureWizardAuthResponse> {
	try {
		const response = await pythonBackendClient.post<ConfigureWizardAuthResponse>(
			`/api/wizard/${params.serverId}/auth`,
			{
				authType: params.authType,
				authConfig: params.authConfig ?? null,
			}
		);
		logger.info(
			{ serverId: params.serverId, authType: params.authType },
			"Wizard auth configured in Python backend"
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to configure wizard auth in Python backend"
		);
		throw error;
	}
}

/**
 * Generates the code for the selected tools.
 */
export async function generateWizardCode(
	serverId: string
): Promise<GenerateWizardCodeResponse> {
	try {
		const response = await pythonBackendClient.post<GenerateWizardCodeResponse>(
			`/api/wizard/${serverId}/generate-code`
		);
		logger.info({ serverId }, "Wizard code generated in Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to generate wizard code in Python backend"
		);
		throw error;
	}
}

/**
 * Gets the current state of a wizard session.
 */
export async function getWizardState(serverId: string): Promise<WizardState> {
	try {
		const response = await pythonBackendClient.get<WizardState>(
			`/api/wizard/${serverId}`
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to get wizard state from Python backend"
		);
		throw error;
	}
}

/**
 * Activates the server, deploying it and making it live.
 */
export async function activateServer(
	serverId: string
): Promise<ActivateServerResponse> {
	try {
		const response = await pythonBackendClient.post<ActivateServerResponse>(
			`/api/servers/${serverId}/activate`
		);
		logger.info({ serverId }, "Server activated in Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to activate server in Python backend"
		);
		throw error;
	}
}
