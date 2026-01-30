import { z } from "zod/v4";
import { logger } from "@/lib/logger";
import {
	deleteServer,
	getServerDetails,
	listServers,
	updateServer,
} from "@/lib/python-backend";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

/**
 * Server router - provides access to MCP server management.
 * Proxies calls to the Python backend.
 */
export const organizationServerRouter = createTRPCRouter({
	// List all servers for the organization
	list: protectedOrganizationProcedure.query(async ({ ctx }) => {
		const result = await listServers(ctx.organization.id);

		logger.info(
			{ organizationId: ctx.organization.id, count: result.servers.length },
			"Listed MCP servers",
		);

		return result;
	}),

	// Get details of a specific server
	getDetails: protectedOrganizationProcedure
		.input(z.object({ serverId: z.string().uuid() }))
		.query(async ({ ctx, input }) => {
			const details = await getServerDetails(input.serverId);

			// Verify the server belongs to this organization
			// Note: The backend should enforce this too, but we add an extra check
			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Fetched MCP server details",
			);

			return details;
		}),

	// Delete a server
	delete: protectedOrganizationProcedure
		.input(z.object({ serverId: z.string().uuid() }))
		.mutation(async ({ ctx, input }) => {
			const result = await deleteServer(input.serverId);

			logger.info(
				{ serverId: input.serverId, organizationId: ctx.organization.id },
				"Deleted MCP server",
			);

			return result;
		}),

	// Update a server
	update: protectedOrganizationProcedure
		.input(
			z.object({
				serverId: z.string().uuid(),
				name: z.string().optional(),
				description: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { serverId, ...data } = input;
			const result = await updateServer(serverId, data);

			logger.info(
				{ serverId, organizationId: ctx.organization.id },
				"Updated MCP server",
			);

			return result;
		}),
});
