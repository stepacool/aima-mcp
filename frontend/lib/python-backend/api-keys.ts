import { logger } from "@/lib/logger";
import { pythonBackendClient } from "./client";

export interface OrgApiKeyItem {
	id: string;
	description: string;
	lastUsedAt?: string | null;
	expiresAt?: string | null;
}

export interface ListOrgApiKeysResponse {
	apiKeys: OrgApiKeyItem[];
}

export interface CreateOrgApiKeyParams {
	organizationId: string;
	description: string;
	neverExpires: boolean;
	expiresAt?: Date;
}

export interface CreateOrgApiKeyResponse {
	apiKey: string;
}

export interface UpdateOrgApiKeyParams {
	organizationId: string;
	description: string;
	neverExpires: boolean;
	expiresAt?: Date;
}

/**
 * Lists organization API keys from the backend.
 */
export async function listOrgApiKeys(
	organizationId: string,
): Promise<OrgApiKeyItem[]> {
	try {
		const response = await pythonBackendClient.get<ListOrgApiKeysResponse>(
			"/api/api-keys/",
			{ params: { organization_id: organizationId } },
		);
		logger.info(
			{ organizationId, count: response.data.apiKeys.length },
			"Fetched org API keys from Python backend",
		);
		return response.data.apiKeys;
	} catch (error) {
		logger.error(
			{ organizationId, error },
			"Failed to list org API keys from Python backend",
		);
		throw error;
	}
}

/**
 * Creates a new organization API key. Returns the plain key (shown only once).
 */
export async function createOrgApiKey(
	params: CreateOrgApiKeyParams,
): Promise<CreateOrgApiKeyResponse> {
	try {
		const response = await pythonBackendClient.post<CreateOrgApiKeyResponse>(
			"/api/api-keys/",
			{
				organizationId: params.organizationId,
				description: params.description,
				neverExpires: params.neverExpires,
				expiresAt: params.expiresAt?.toISOString() ?? null,
			},
		);
		logger.info({ organizationId: params.organizationId }, "Created org API key");
		return response.data;
	} catch (error) {
		logger.error(
			{ organizationId: params.organizationId, error },
			"Failed to create org API key",
		);
		throw error;
	}
}

/**
 * Updates an organization API key.
 */
export async function updateOrgApiKey(
	id: string,
	params: UpdateOrgApiKeyParams,
): Promise<void> {
	try {
		await pythonBackendClient.patch(`/api/api-keys/${id}`, {
			organizationId: params.organizationId,
			description: params.description,
			neverExpires: params.neverExpires,
			expiresAt: params.expiresAt?.toISOString() ?? null,
		});
		logger.info({ id, organizationId: params.organizationId }, "Updated org API key");
	} catch (error) {
		logger.error(
			{ id, organizationId: params.organizationId, error },
			"Failed to update org API key",
		);
		throw error;
	}
}

/**
 * Revokes (deletes) an organization API key.
 */
export async function revokeOrgApiKey(
	id: string,
	organizationId: string,
): Promise<void> {
	try {
		await pythonBackendClient.delete(`/api/api-keys/${id}`, {
			params: { organization_id: organizationId },
		});
		logger.info({ id, organizationId }, "Revoked org API key");
	} catch (error) {
		logger.error(
			{ id, organizationId, error },
			"Failed to revoke org API key",
		);
		throw error;
	}
}
