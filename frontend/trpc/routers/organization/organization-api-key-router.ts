import { and, asc, eq } from "drizzle-orm";
import { startOfDay } from "date-fns";
import { z } from "zod/v4";
import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { apiKeyTable } from "@/lib/db/schema";
import { generateApiKey, hashApiKey } from "@/lib/api-keys";
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
		const keys = await db
			.select({
				id: apiKeyTable.id,
				description: apiKeyTable.description,
				lastUsedAt: apiKeyTable.lastUsedAt,
				expiresAt: apiKeyTable.expiresAt,
			})
			.from(apiKeyTable)
			.where(eq(apiKeyTable.organizationId, ctx.organization.id as string))
			.orderBy(asc(apiKeyTable.createdAt));

		return keys.map((k) => ({
			id: k.id,
			description: k.description,
			lastUsedAt: k.lastUsedAt ?? undefined,
			expiresAt: k.expiresAt ?? undefined,
		}));
	}),

	create: protectedOrganizationProcedure
		.input(createApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			const apiKey = generateApiKey();
			const hashedKey = hashApiKey(apiKey);

			await db.insert(apiKeyTable).values({
				organizationId: ctx.organization.id as string,
				description: input.description,
				hashedKey,
				expiresAt: input.neverExpires
					? null
					: startOfDay(input.expiresAt ?? new Date()),
			});

			return { apiKey };
		}),

	update: protectedOrganizationProcedure
		.input(updateApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			const [key] = await db
				.select()
				.from(apiKeyTable)
				.where(
					and(
						eq(apiKeyTable.id, input.id),
						eq(apiKeyTable.organizationId, ctx.organization.id as string),
					),
				);

			if (!key) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "API key not found",
				});
			}

			await db
				.update(apiKeyTable)
				.set({
					description: input.description,
					expiresAt: input.neverExpires
						? null
						: startOfDay(input.expiresAt ?? new Date()),
				})
				.where(eq(apiKeyTable.id, input.id));
		}),

	revoke: protectedOrganizationProcedure
		.input(revokeApiKeySchema)
		.mutation(async ({ ctx, input }) => {
			const [key] = await db
				.select()
				.from(apiKeyTable)
				.where(
					and(
						eq(apiKeyTable.id, input.id),
						eq(apiKeyTable.organizationId, ctx.organization.id as string),
					),
				);

			if (!key) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "API key not found",
				});
			}

			await db.delete(apiKeyTable).where(eq(apiKeyTable.id, input.id));
		}),
});
