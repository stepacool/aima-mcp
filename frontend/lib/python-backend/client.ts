import axios, { type AxiosError, type AxiosInstance } from "axios";
import { camelCase, snakeCase } from "lodash";
import qs from "qs";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue };

/**
 * Generic key conversion utility that recursively transforms all object keys
 * using the provided conversion function.
 */
function keysToAnyCase(
	data: JsonValue,
	convertFn: (key: string) => string
): JsonValue {
	if (Array.isArray(data)) {
		return data.map((item) => keysToAnyCase(item, convertFn));
	}

	if (data !== null && typeof data === "object") {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => [
				convertFn(key),
				keysToAnyCase(value, convertFn),
			])
		);
	}

	return data;
}

/**
 * Converts all keys in an object from snake_case to camelCase recursively.
 */
export function keysToCamelCase<T>(data: T): T {
	return keysToAnyCase(data as JsonValue, camelCase) as T;
}

/**
 * Converts all keys in an object from camelCase to snake_case recursively.
 */
export function keysToSnakeCase<T>(data: T): T {
	return keysToAnyCase(data as JsonValue, snakeCase) as T;
}

/**
 * Creates the axios instance for communicating with the Python backend.
 * Features:
 * - Base URL from PYTHON_BACKEND_URL environment variable
 * - Auth header with Bearer token from PYTHON_BACKEND_API_KEY
 * - 15 second timeout
 * - Automatic snake_case conversion for request bodies
 * - Automatic camelCase conversion for response data
 * - Query string serialization with array format: repeat
 * - Error logging using the application logger
 */
function createPythonBackendClient(): AxiosInstance {
	const client = axios.create({
		baseURL: env.PYTHON_BACKEND_URL,
		timeout: 15000,
		headers: {
			"Content-Type": "application/json",
			...(env.PYTHON_BACKEND_API_KEY && {
				Authorization: `Bearer ${env.PYTHON_BACKEND_API_KEY}`,
			}),
		},
		paramsSerializer: (params) =>
			qs.stringify(params, { arrayFormat: "repeat" }),
	});

	// Request interceptor: Convert request body keys to snake_case
	client.interceptors.request.use(
		(config) => {
			if (config.data && typeof config.data === "object") {
				config.data = keysToSnakeCase(config.data);
			}
			return config;
		},
		(error: AxiosError) => {
			logger.error(
				{ error: error.message },
				"Python backend request interceptor error"
			);
			return Promise.reject(error);
		}
	);

	// Response interceptor: Convert response data keys to camelCase
	client.interceptors.response.use(
		(response) => {
			if (response.data && typeof response.data === "object") {
				response.data = keysToCamelCase(response.data);
			}
			return response;
		},
		(error: AxiosError) => {
			const status = error.response?.status;
			const url = error.config?.url;
			const method = error.config?.method?.toUpperCase();

			logger.error(
				{
					status,
					url,
					method,
					message: error.message,
				},
				"Python backend request failed"
			);

			return Promise.reject(error);
		}
	);

	return client;
}

export const pythonBackendClient = createPythonBackendClient();
