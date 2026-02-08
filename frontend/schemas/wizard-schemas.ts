import { z } from "zod/v4";

// Wizard step enum (managed by Python backend)
export const WizardStep = {
	stepZero: "step_zero", // AI onboarding chat (frontend only)
	describe: "describe", // Processing initial description
	tools: "tools", // Select tools
	envVars: "env_vars", // Configure environment variables
	auth: "auth", // Configure authentication
	deploy: "deploy", // Review and deploy
	complete: "complete", // Server is live
} as const;
export type WizardStep = (typeof WizardStep)[keyof typeof WizardStep];

// Processing status enum (tracks background task state)
export const ProcessingStatus = {
	idle: "idle", // No background work in progress
	processing: "processing", // Background task running
	failed: "failed", // Background task failed
} as const;
export type ProcessingStatus =
	(typeof ProcessingStatus)[keyof typeof ProcessingStatus];

// Auth type enum for wizard
export const WizardAuthType = z.enum(["none", "api_key", "oauth"]);
export type WizardAuthType = z.infer<typeof WizardAuthType>;

// Tool schema with UUID
export const wizardToolSchema = z.object({
	id: z.string(), // UUID from backend
	name: z.string(),
	description: z.string(),
	parameters: z.array(z.record(z.string(), z.unknown())).optional(),
});
export type WizardTool = z.infer<typeof wizardToolSchema>;

// Environment variable schema
export const wizardEnvVarSchema = z.object({
	id: z.string(), // UUID from backend
	name: z.string(),
	description: z.string(),
	value: z.string().optional(),
});
export type WizardEnvVar = z.infer<typeof wizardEnvVarSchema>;

// Message schema for pre-wizard chat (Step 0 - frontend only)
export const wizardMessageSchema = z.object({
	id: z.string(),
	role: z.enum(["user", "assistant"]),
	content: z.string(),
	createdAt: z.string().optional(),
});
export type WizardMessage = z.infer<typeof wizardMessageSchema>;

// Start wizard (calls Python backend /api/wizard/start)
export const startWizardSchema = z.object({
	description: z.string().min(1, "Description is required"),
	openapiSchema: z.string().optional().nullable(),
	technicalDetails: z.array(z.string()).optional(),
});
export type StartWizardInput = z.infer<typeof startWizardSchema>;

// Refine wizard tools (calls Python backend /api/wizard/{id}/tools/refine)
export const refineWizardToolsSchema = z.object({
	serverId: z.string(),
	feedback: z.string().min(1, "Feedback is required"),
	toolIds: z.array(z.string()).optional(), // Optional list of tool UUIDs
});
export type RefineWizardToolsInput = z.infer<typeof refineWizardToolsSchema>;

// Get wizard tools (calls Python backend /api/wizard/{id}/tools)
export const getWizardToolsSchema = z.object({
	serverId: z.string(),
});
export type GetWizardToolsInput = z.infer<typeof getWizardToolsSchema>;

// Submit wizard tools (calls Python backend /api/wizard/{id}/tools/submit)
export const submitWizardToolsSchema = z.object({
	serverId: z.string(),
	selectedToolIds: z
		.array(z.string())
		.min(1, "At least one tool must be selected")
		.max(5, "Maximum 3 tools allowed for free tier"),
});
export type SubmitWizardToolsInput = z.infer<typeof submitWizardToolsSchema>;

// Suggest env vars (calls Python backend /api/wizard/{id}/env-vars/suggest)
export const suggestEnvVarsSchema = z.object({
	serverId: z.string(),
});
export type SuggestEnvVarsInput = z.infer<typeof suggestEnvVarsSchema>;

// Get env vars (calls Python backend /api/wizard/{id}/env-vars)
export const getEnvVarsSchema = z.object({
	serverId: z.string(),
});
export type GetEnvVarsInput = z.infer<typeof getEnvVarsSchema>;

// Refine env vars (calls Python backend /api/wizard/{id}/env-vars/refine)
export const refineEnvVarsSchema = z.object({
	serverId: z.string(),
	feedback: z.string().min(1, "Feedback is required"),
});
export type RefineEnvVarsInput = z.infer<typeof refineEnvVarsSchema>;

// Submit env vars (calls Python backend /api/wizard/{id}/env-vars/submit)
export const submitEnvVarsSchema = z.object({
	serverId: z.string(),
	values: z.record(z.string(), z.string()), // Map of UUID to value
});
export type SubmitEnvVarsInput = z.infer<typeof submitEnvVarsSchema>;

// Configure wizard auth (calls Python backend /api/wizard/{id}/auth)
// Backend generates API key and returns bearer token
export const configureWizardAuthSchema = z.object({
	serverId: z.string(),
});
export type ConfigureWizardAuthInput = z.infer<
	typeof configureWizardAuthSchema
>;

// Generate wizard code (calls Python backend /api/wizard/{id}/generate-code)
export const generateWizardCodeSchema = z.object({
	serverId: z.string(),
});
export type GenerateWizardCodeInput = z.infer<typeof generateWizardCodeSchema>;

// Get wizard state (calls Python backend /api/wizard/{id})
export const getWizardStateSchema = z.object({
	serverId: z.string(),
});
export type GetWizardStateInput = z.infer<typeof getWizardStateSchema>;

// Activate server (calls Python backend /api/servers/{id}/activate)
export const activateServerSchema = z.object({
	serverId: z.string(),
});
export type ActivateServerInput = z.infer<typeof activateServerSchema>;

// Retry wizard tool generation (calls Python backend /api/wizard/{id}/retry)
export const retryWizardSchema = z.object({
	serverId: z.string(),
});
export type RetryWizardInput = z.infer<typeof retryWizardSchema>;
