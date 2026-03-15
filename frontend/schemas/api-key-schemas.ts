import { z } from "zod/v4";

export const createApiKeySchema = z.object({
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(70, "Maximum 70 characters allowed"),
	expiresAt: z.date().optional(),
	neverExpires: z.boolean(),
});

export type CreateApiKeySchema = z.infer<typeof createApiKeySchema>;

export const updateApiKeySchema = z.object({
	id: z.string().uuid("Id is invalid"),
	description: z
		.string()
		.trim()
		.min(1, "Description is required")
		.max(70, "Maximum 70 characters allowed"),
	expiresAt: z.date().optional(),
	neverExpires: z.boolean(),
});

export type UpdateApiKeySchema = z.infer<typeof updateApiKeySchema>;

export const revokeApiKeySchema = z.object({
	id: z.string().uuid("Id is invalid"),
});

export type RevokeApiKeySchema = z.infer<typeof revokeApiKeySchema>;
