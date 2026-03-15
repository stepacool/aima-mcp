import { z } from "zod/v4";
import {
	createOrgApiKey,
	listOrgApiKeys,
	revokeOrgApiKey,
	updateOrgApiKey,
} from "@/lib/python-backend";
import { createTRPCRouter, protectedOrganizationProcedure } from "@/trpc/init";

const createApiKeySchema = z.object({
	description: z.string().trim().min(1, "Description is required").max(70),
	expiresAt: z.date().optional(),
	neverExpires: z.boolean(),
});

const updateApiKeySchema = z.object({
	id: z.string().uuid(),
	description: z.string().trim().min(1, "Description is required").max(70),
	expiresAt: z.date().optional(),
	neverExpires: z.boolean(),
});

const revokeApiKeySchema = z.object({
	id: z.string().uuid(),
});

export const organizationApiKeyRouter = createTRPCRouter({
	list: protectedOrganizationProcedure.query(async ({ ctx }) => {
		const keys = await listOrgApiKeys(ctx.organization.id);
		return keys.map((k) => ({
			id: k.id,
			description: k.description,
			lastUsedAt: k.lastUsedAt ? new Date(k.lastUsedAt) : undefined,
			expiresAt: k.expiresAt ? new Date(k.expiresAt) : undefined,
		}));
	}),

	create: protectedOrganizationProcedure
		.input(createApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			const result = await createOrgApiKey({
				organizationId: ctx.organization.id,
				description: input.description,
				neverExpires: input.neverExpires,
				expiresAt: input.neverExpires ? undefined : input.expiresAt,
			});
			return { apiKey: result.apiKey };
		}),

	update: protectedOrganizationProcedure
		.input(updateApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			await updateOrgApiKey(input.id, {
				organizationId: ctx.organization.id,
				description: input.description,
				neverExpires: input.neverExpires,
				expiresAt: input.neverExpires ? undefined : input.expiresAt,
			});
		}),

	revoke: protectedOrganizationProcedure
		.input(revokeApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			await revokeOrgApiKey(input.id, ctx.organization.id);
		}),
});
