import { logger } from "@/lib/logger";
import {
	activateServer,
	configureWizardAuth,
	generateWizardCode,
	getEnvVars,
	getWizardState,
	getWizardTools,
	refineEnvVars,
	refineWizardTools,
	retryToolGeneration,
	startWizard,
	submitEnvVars,
	submitWizardTools,
	suggestEnvVars,
} from "@/lib/python-backend";
import {
	activateServerSchema,
	configureWizardAuthSchema,
	generateWizardCodeSchema,
	getEnvVarsSchema,
	getWizardStateSchema,
	getWizardToolsSchema,
	refineEnvVarsSchema,
	refineWizardToolsSchema,
	retryWizardSchema,
	startWizardSchema,
	submitEnvVarsSchema,
	submitWizardToolsSchema,
	suggestEnvVarsSchema,
} from "@/schemas/wizard-schemas";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

/**
 * Wizard router - proxies all calls to the Python backend.
 * The wizard state is fully managed by the Python backend.
 * Step 0 (onboarding chat) is handled client-side before calling startWizard.
 */
export const organizationWizardRouter = createTRPCRouter({
	// Start wizard - creates a new wizard in Python backend
	// Called after Step 0 chat when user provides a valid description
	start: protectedOrganizationProcedure
		.input(startWizardSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await startWizard({
				customerId: ctx.organization.id,
				description: input.description,
				openapiSchema: input.openapiSchema,
			});

			logger.info(
				{ serverId: result.serverId, organizationId: ctx.organization.id },
				"Wizard started via Python backend",
			);

			return result;
		}),

	// Get wizard state from Python backend
	getState: protectedOrganizationProcedure
		.input(getWizardStateSchema)
		.query(async ({ input }) => {
			const state = await getWizardState(input.serverId);

			return state;
		}),

	// Get wizard tools
	getTools: protectedOrganizationProcedure
		.input(getWizardToolsSchema)
		.query(async ({ ctx, input }) => {
			const result = await getWizardTools(input.serverId);

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Wizard tools fetched",
			);

			return result;
		}),

	// Refine suggested tools based on feedback
	refineTools: protectedOrganizationProcedure
		.input(refineWizardToolsSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await refineWizardTools({
				serverId: input.serverId,
				feedback: input.feedback,
				toolIds: input.toolIds,
			});

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Wizard tools refined",
			);

			return result;
		}),

	// Submit selected tools (transitions wizard from TOOLS to ENV_VARS)
	submitTools: protectedOrganizationProcedure
		.input(submitWizardToolsSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await submitWizardTools({
				serverId: input.serverId,
				selectedToolIds: input.selectedToolIds,
			});

			logger.info(
				{
					serverId: input.serverId,
					toolIds: input.selectedToolIds,
					organizationId: ctx.organization.id,
				},
				"Wizard tools submitted",
			);

			return result;
		}),

	// Suggest environment variables
	suggestEnvVars: protectedOrganizationProcedure
		.input(suggestEnvVarsSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await suggestEnvVars(input.serverId);

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Env vars suggestion triggered",
			);

			return result;
		}),

	// Get environment variables
	getEnvVars: protectedOrganizationProcedure
		.input(getEnvVarsSchema)
		.query(async ({ ctx, input }) => {
			const result = await getEnvVars(input.serverId);

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Env vars fetched",
			);

			return result;
		}),

	// Refine environment variables based on feedback
	refineEnvVars: protectedOrganizationProcedure
		.input(refineEnvVarsSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await refineEnvVars({
				serverId: input.serverId,
				feedback: input.feedback,
			});

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Env vars refined",
			);

			return result;
		}),

	// Submit environment variable values
	submitEnvVars: protectedOrganizationProcedure
		.input(submitEnvVarsSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await submitEnvVars({
				serverId: input.serverId,
				values: input.values,
			});

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Env vars submitted",
			);

			return result;
		}),

	// Configure auth (transitions wizard from AUTH to DEPLOY)
	// Returns bearer token for API access
	configureAuth: protectedOrganizationProcedure
		.input(configureWizardAuthSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await configureWizardAuth({
				serverId: input.serverId,
			});

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Wizard auth configured",
			);

			return result;
		}),

	// Generate code for the wizard
	generateCode: protectedOrganizationProcedure
		.input(generateWizardCodeSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await generateWizardCode(input.serverId);

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Wizard code generated",
			);

			return result;
		}),

	// Activate server (transitions wizard from DEPLOY to COMPLETE)
	activate: protectedOrganizationProcedure
		.input(activateServerSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await activateServer(input.serverId);

			logger.info(
				{
					serverId: input.serverId,
					serverUrl: result.serverUrl,
					organizationId: ctx.organization.id,
				},
				"Server activated",
			);

			return result;
		}),

	// Retry tool generation after failure
	retry: protectedOrganizationProcedure
		.input(retryWizardSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await retryToolGeneration(input.serverId);

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Wizard tool generation retried",
			);

			return result;
		}),
});
