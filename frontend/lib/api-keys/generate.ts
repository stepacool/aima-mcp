import { randomBytes } from "node:crypto";

const API_KEY_PREFIX = "api_";
const API_KEY_RANDOM_SIZE = 16;

export function generateApiKey(): string {
	return `${API_KEY_PREFIX}${randomBytes(API_KEY_RANDOM_SIZE).toString("hex")}`;
}
