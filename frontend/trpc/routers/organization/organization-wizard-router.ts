import { logger } from "@/lib/logger";
import {
	activateServer,
	configureWizardAuth,
	generateWizardCode,
	getWizardState,
	refineWizardActions,
	retryToolGeneration,
	selectWizardTools,
	startWizard,
} from "@/lib/python-backend";
import {
	activateServerSchema,
	configureWizardAuthSchema,
	generateWizardCodeSchema,
	getWizardStateSchema,
	refineWizardActionsSchema,
	retryWizardSchema,
	selectWizardToolsSchema,
	startWizardSchema,
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
				"Wizard started via Python backend"
			);

			return result;
		}),

	// Get wizard state from Python backend
	getState: protectedOrganizationProcedure
		.input(getWizardStateSchema)
		.query(async ({ ctx, input }) => {
			const state = await getWizardState(input.serverId);

			// Verify the wizard belongs to this organization
			if (state.customerId !== ctx.organization.id) {
				logger.warn(
					{ serverId: input.serverId, organizationId: ctx.organization.id },
					"Unauthorized wizard access attempt"
				);
				throw new Error("Unauthorized");
			}

			return state;
		}),

	// Refine suggested tools based on feedback
	refineActions: protectedOrganizationProcedure
		.input(refineWizardActionsSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await refineWizardActions({
				serverId: input.serverId,
				feedback: input.feedback,
				description: input.description,
			});

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Wizard actions refined"
			);

			return result;
		}),

	// Select tools (transitions wizard from ACTIONS to AUTH)
	selectTools: protectedOrganizationProcedure
		.input(selectWizardToolsSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await selectWizardTools({
				serverId: input.serverId,
				selectedToolNames: input.selectedToolNames,
			});

			logger.info(
				{ serverId: input.serverId, tools: input.selectedToolNames, organizationId: ctx.organization.id },
				"Wizard tools selected"
			);

			return result;
		}),

	// Configure auth (transitions wizard from AUTH to DEPLOY)
	configureAuth: protectedOrganizationProcedure
		.input(configureWizardAuthSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await configureWizardAuth({
				serverId: input.serverId,
				authType: input.authType,
				authConfig: input.authConfig,
			});

			logger.info(
				{ serverId: input.serverId, authType: input.authType, organizationId: ctx.organization.id },
				"Wizard auth configured"
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
				"Wizard code generated"
			);

			return result;
		}),

	// Activate server (transitions wizard from DEPLOY to COMPLETE)
	activate: protectedOrganizationProcedure
		.input(activateServerSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await activateServer(input.serverId);

			logger.info(
				{ serverId: input.serverId, serverUrl: result.serverUrl, organizationId: ctx.organization.id },
				"Server activated"
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
				"Wizard tool generation retried"
			);

			return result;
		}),
});
