import { logger } from "@/lib/logger";
import { pythonBackendClient } from "./client";

interface CreateCustomerParams {
	id: string;
	name: string;
	email?: string | null;
	meta?: Record<string, unknown> | null;
}

/**
 * Creates a customer in the Python backend.
 * Called when a new organization is created.
 */
export async function createCustomer(params: CreateCustomerParams): Promise<void> {
	try {
		await pythonBackendClient.post("/api/customers/", {
			id: params.id,
			name: params.name,
			email: params.email ?? null,
			meta: params.meta ?? null,
		});
		logger.info({ customerId: params.id }, "Customer created in Python backend");
	} catch (error) {
		logger.error(
			{ customerId: params.id, error },
			"Failed to create customer in Python backend"
		);
	}
}
