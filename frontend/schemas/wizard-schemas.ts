import { z } from "zod/v4";

// Wizard step enum (managed by Python backend)
export const WizardStep = {
	stepZero: "STEP_ZERO", // AI onboarding chat (frontend only)
	actions: "ACTIONS", // Select tools
	auth: "AUTH", // Configure authentication
	deploy: "DEPLOY", // Review and deploy
	complete: "COMPLETE", // Server is live
} as const;
export type WizardStep = (typeof WizardStep)[keyof typeof WizardStep];

// Auth type enum for wizard
export const WizardAuthType = z.enum(["none", "api_key", "oauth"]);
export type WizardAuthType = z.infer<typeof WizardAuthType>;

// Tool schema
export const wizardToolSchema = z.object({
	name: z.string(),
	description: z.string(),
	inputSchema: z.record(z.string(), z.unknown()).optional(),
});
export type WizardTool = z.infer<typeof wizardToolSchema>;

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
});
export type StartWizardInput = z.infer<typeof startWizardSchema>;

// Refine wizard actions (calls Python backend /api/wizard/{id}/refine)
export const refineWizardActionsSchema = z.object({
	serverId: z.string(),
	feedback: z.string().min(1, "Feedback is required"),
	description: z.string().optional().nullable(),
});
export type RefineWizardActionsInput = z.infer<typeof refineWizardActionsSchema>;

// Select wizard tools (calls Python backend /api/wizard/{id}/tools/select)
export const selectWizardToolsSchema = z.object({
	serverId: z.string(),
	selectedToolNames: z
		.array(z.string())
		.min(1, "At least one tool must be selected")
		.max(3, "Maximum 3 tools allowed for free tier"),
});
export type SelectWizardToolsInput = z.infer<typeof selectWizardToolsSchema>;

// Configure wizard auth (calls Python backend /api/wizard/{id}/auth)
export const configureWizardAuthSchema = z.object({
	serverId: z.string(),
	authType: WizardAuthType,
	authConfig: z.record(z.string(), z.unknown()).optional().nullable(),
});
export type ConfigureWizardAuthInput = z.infer<typeof configureWizardAuthSchema>;

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
