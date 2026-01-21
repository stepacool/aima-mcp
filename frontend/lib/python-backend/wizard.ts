import { logger } from "@/lib/logger";
import { pythonBackendClient } from "./client";
import type {
	ProcessingStatus,
	WizardAuthType,
	WizardStep,
} from "@/schemas/wizard-schemas";

export interface WizardTool {
	id: string; // UUID from backend
	name: string;
	description: string;
	parameters?: Record<string, unknown>[];
}

export interface WizardEnvVar {
	id: string; // UUID from backend
	name: string;
	description: string;
	value?: string;
}

export interface WizardMeta {
	userPrompt: string;
	wizardStep: WizardStep;
	processingStatus: ProcessingStatus;
	processingError: string | null;
	openapiSchema?: string | null;
}

export interface WizardState {
	serverId: string;
	customerId: string;
	wizardStep: WizardStep;
	processingStatus: ProcessingStatus;
	processingError: string | null;
	description: string;
	tools: WizardTool[];
	selectedToolIds: string[]; // UUIDs of selected tools
	envVars: WizardEnvVar[];
	authType: WizardAuthType;
	authConfig: Record<string, unknown> | null;
	bearerToken: string | null;
	generatedCode: string | null;
	serverUrl: string | null;
	meta: WizardMeta;
	createdAt: string;
	updatedAt: string;
}

export interface StartWizardParams {
	customerId: string;
	description: string;
	openapiSchema?: string | null;
}

export interface StartWizardResponse {
	serverId: string;
	status: "processing" | "idle";
}

export interface RefineWizardActionsParams {
	serverId: string;
	feedback: string;
	toolIds?: string[]; // Optional list of tool UUIDs to refine
}

export interface RefineWizardActionsResponse {
	suggestedTools: WizardTool[];
}

export interface SubmitWizardToolsParams {
	serverId: string;
	selectedToolIds: string[]; // UUIDs
}

export interface SubmitWizardToolsResponse {
	selectedToolIds: string[];
}

export interface GetWizardToolsResponse {
	tools: WizardTool[];
}

export interface ConfigureWizardAuthParams {
	serverId: string;
}

export interface ConfigureWizardAuthResponse {
	serverId: string;
	bearerToken: string;
}

// Env vars interfaces
export interface SuggestEnvVarsResponse {
	status: "processing" | "idle";
}

export interface GetEnvVarsResponse {
	envVars: WizardEnvVar[];
}

export interface RefineEnvVarsParams {
	serverId: string;
	feedback: string;
}

export interface RefineEnvVarsResponse {
	envVars: WizardEnvVar[];
}

export interface SubmitEnvVarsParams {
	serverId: string;
	values: Record<string, string>; // Map of UUID to value
}

export interface SubmitEnvVarsResponse {
	values: Record<string, string>;
}

export interface GenerateWizardCodeResponse {
	generatedCode: string;
}

export interface ActivateServerResponse {
	serverUrl: string;
	step: "complete";
}

export interface RetryToolGenerationResponse {
	serverId: string;
	status: "retrying";
}

/**
 * Starts a new wizard session in the Python backend.
 * This initiates the MCP server creation process and returns suggested tools.
 */
export async function startWizard(
	params: StartWizardParams,
): Promise<StartWizardResponse> {
	try {
		const response = await pythonBackendClient.post<any>("/api/wizard/start", {
			customerId: params.customerId,
			description: params.description,
			openapiSchema: params.openapiSchema ?? null,
		});
		logger.info(
			{ customerId: params.customerId, wizardId: response.data.serverId },
			"Wizard started in Python backend",
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ customerId: params.customerId, error },
			"Failed to start wizard in Python backend",
		);
		throw error;
	}
}

/**
 * Refines the suggested tools based on user feedback.
 */
export async function refineWizardActions(
	params: RefineWizardActionsParams,
): Promise<RefineWizardActionsResponse> {
	try {
		const response =
			await pythonBackendClient.post<RefineWizardActionsResponse>(
				`/api/wizard/${params.serverId}/tools/refine`,
				{
					feedback: params.feedback,
					tool_ids: params.toolIds ?? null,
				},
			);
		logger.info(
			{ serverId: params.serverId },
			"Wizard actions refined in Python backend",
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to refine wizard actions in Python backend",
		);
		throw error;
	}
}

/**
 * Gets the list of suggested tools for a wizard session.
 */
export async function getWizardTools(
	serverId: string,
): Promise<GetWizardToolsResponse> {
	try {
		const response = await pythonBackendClient.get<GetWizardToolsResponse>(
			`/api/wizard/${serverId}/tools`,
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to get wizard tools from Python backend",
		);
		throw error;
	}
}

/**
 * Submits the selected tools to include in the MCP server.
 * Free tier is limited to max 3 tools.
 */
export async function submitWizardTools(
	params: SubmitWizardToolsParams,
): Promise<SubmitWizardToolsResponse> {
	try {
		const response = await pythonBackendClient.post<SubmitWizardToolsResponse>(
			`/api/wizard/${params.serverId}/tools/submit`,
			{
				selected_tool_ids: params.selectedToolIds,
			},
		);
		logger.info(
			{ serverId: params.serverId, selectedToolIds: params.selectedToolIds },
			"Wizard tools submitted in Python backend",
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to submit wizard tools in Python backend",
		);
		throw error;
	}
}

/**
 * Configures the authentication for the MCP server.
 * Backend generates API key and returns bearer token.
 */
export async function configureWizardAuth(
	params: ConfigureWizardAuthParams,
): Promise<ConfigureWizardAuthResponse> {
	try {
		const response =
			await pythonBackendClient.post<ConfigureWizardAuthResponse>(
				`/api/wizard/${params.serverId}/auth`,
			);
		logger.info(
			{ serverId: params.serverId },
			"Wizard auth configured in Python backend",
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to configure wizard auth in Python backend",
		);
		throw error;
	}
}

/**
 * Triggers environment variable suggestion for the wizard.
 */
export async function suggestEnvVars(
	serverId: string,
): Promise<SuggestEnvVarsResponse> {
	try {
		const response = await pythonBackendClient.post<SuggestEnvVarsResponse>(
			`/api/wizard/${serverId}/env-vars/suggest`,
		);
		logger.info({ serverId }, "Env var suggestion triggered in Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to suggest env vars in Python backend",
		);
		throw error;
	}
}

/**
 * Gets the list of suggested environment variables for a wizard session.
 */
export async function getEnvVars(
	serverId: string,
): Promise<GetEnvVarsResponse> {
	try {
		const response = await pythonBackendClient.get<GetEnvVarsResponse>(
			`/api/wizard/${serverId}/env-vars`,
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to get env vars from Python backend",
		);
		throw error;
	}
}

/**
 * Refines the suggested environment variables based on user feedback.
 */
export async function refineEnvVars(
	params: RefineEnvVarsParams,
): Promise<RefineEnvVarsResponse> {
	try {
		const response = await pythonBackendClient.post<RefineEnvVarsResponse>(
			`/api/wizard/${params.serverId}/env-vars/refine`,
			{
				feedback: params.feedback,
			},
		);
		logger.info(
			{ serverId: params.serverId },
			"Env vars refined in Python backend",
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to refine env vars in Python backend",
		);
		throw error;
	}
}

/**
 * Submits the environment variable values.
 */
export async function submitEnvVars(
	params: SubmitEnvVarsParams,
): Promise<SubmitEnvVarsResponse> {
	try {
		const response = await pythonBackendClient.post<SubmitEnvVarsResponse>(
			`/api/wizard/${params.serverId}/env-vars/submit`,
			{
				values: params.values,
			},
		);
		logger.info(
			{ serverId: params.serverId },
			"Env vars submitted in Python backend",
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId: params.serverId, error },
			"Failed to submit env vars in Python backend",
		);
		throw error;
	}
}

/**
 * Generates the code for the selected tools.
 */
export async function generateWizardCode(
	serverId: string,
): Promise<GenerateWizardCodeResponse> {
	try {
		const response = await pythonBackendClient.post<GenerateWizardCodeResponse>(
			`/api/wizard/${serverId}/generate-code`,
		);
		logger.info({ serverId }, "Wizard code generated in Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to generate wizard code in Python backend",
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
			`/api/wizard/${serverId}/state`,
		);
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to get wizard state from Python backend",
		);
		throw error;
	}
}

/**
 * Activates the server, deploying it and making it live.
 */
export async function activateServer(
	serverId: string,
): Promise<ActivateServerResponse> {
	try {
		const response = await pythonBackendClient.post<ActivateServerResponse>(
			`/api/servers/${serverId}/activate`,
		);
		logger.info({ serverId }, "Server activated in Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to activate server in Python backend",
		);
		throw error;
	}
}

/**
 * Retries tool generation after a failure.
 * Only works if the server is in a FAILED processing state.
 */
export async function retryToolGeneration(
	serverId: string,
): Promise<RetryToolGenerationResponse> {
	try {
		const response =
			await pythonBackendClient.post<RetryToolGenerationResponse>(
				`/api/wizard/${serverId}/retry`,
			);
		logger.info({ serverId }, "Retrying tool generation in Python backend");
		return response.data;
	} catch (error) {
		logger.error(
			{ serverId, error },
			"Failed to retry tool generation in Python backend",
		);
		throw error;
	}
}
