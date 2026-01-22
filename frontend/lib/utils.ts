import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { env } from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function capitalize(str: string): string {
	if (!str) {
		return str;
	}

	if (str.length === 1) {
		return str.charAt(0).toUpperCase();
	}

	return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getInitials(name: string): string {
	if (!name) {
		return "";
	}
	return name
		.trim()
		.replace(/\s+/g, " ")
		.split(" ")
		.slice(0, 2)
		.map((v) => v?.[0]?.toUpperCase())
		.join("");
}

/**
 * Returns the base URL for the app, in order of precedence:
 * 1. Vercel Preview Deployments (uses branch URL)
 * 2. NEXT_PUBLIC_SITE_URL (custom site URL)
 * 3. Vercel Production/Other Deployments (uses Vercel URL)
 * 4. Localhost (fallback)
 */
export function getBaseUrl(): string {
	// 1. Preview deployments on Vercel (branch URL)
	if (
		env.NEXT_PUBLIC_VERCEL_ENV === "preview" &&
		env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF !== "staging" &&
		env.NEXT_PUBLIC_VERCEL_BRANCH_URL
	) {
		return `https://${env.NEXT_PUBLIC_VERCEL_BRANCH_URL}`;
	}

	// 2. Custom site URL (overrides Vercel URL)
	if (env.NEXT_PUBLIC_SITE_URL) {
		return env.NEXT_PUBLIC_SITE_URL;
	}

	// 3. Vercel production/other deployments
	if (env.NEXT_PUBLIC_VERCEL_URL) {
		return `https://${env.NEXT_PUBLIC_VERCEL_URL}`;
	}

	// 4. Local development fallback
	return `http://localhost:3000`;
}

/**
 * Builds a full URL from an endpoint path using the Python backend base URL.
 * If the endpoint path is already a full URL, it returns it as-is.
 * If NEXT_PUBLIC_PYTHON_BACKEND_URL is not set, falls back to window.location.origin.
 */
export function getFullBackendUrl(
	endpointPath: string | null | undefined,
): string {
	if (!endpointPath) return "";

	// If it's already a full URL, return as-is
	if (
		endpointPath.startsWith("http://") ||
		endpointPath.startsWith("https://")
	) {
		return endpointPath;
	}

	// Get backend base URL from environment (client-side accessible)
	// Access directly from process.env since NEXT_PUBLIC_ vars are available client-side
	let backendUrl: string | undefined;

	// In client-side code, NEXT_PUBLIC_ vars are available directly
	if (typeof window !== "undefined") {
		backendUrl = process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
	} else {
		// Server-side: try env object first, then process.env
		backendUrl =
			env.NEXT_PUBLIC_PYTHON_BACKEND_URL ||
			process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL;
	}

	if (backendUrl) {
		// Remove trailing slash from base URL and leading slash from endpoint
		const base = backendUrl.replace(/\/$/, "");
		const path = endpointPath.startsWith("/")
			? endpointPath
			: `/${endpointPath}`;
		return `${base}${path}`;
	}

	// Log warning in development if backend URL is not configured
	if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
		console.warn(
			"NEXT_PUBLIC_PYTHON_BACKEND_URL is not set. Falling back to window.location.origin.",
			"Set NEXT_PUBLIC_PYTHON_BACKEND_URL in your .env file to use the correct backend URL.",
		);
	}

	// Fallback to window.location.origin (client-side only)
	if (typeof window !== "undefined") {
		return `${window.location.origin}${endpointPath.startsWith("/") ? endpointPath : `/${endpointPath}`}`;
	}

	// Server-side fallback
	return endpointPath;
}

export function downloadCsv(content: string, filename: string) {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

export function downloadExcel(base64Content: string, filename: string) {
	const byteCharacters = atob(base64Content);
	const byteNumbers = new Array(byteCharacters.length);
	for (let i = 0; i < byteCharacters.length; i++) {
		byteNumbers[i] = byteCharacters.charCodeAt(i);
	}
	const byteArray = new Uint8Array(byteNumbers);
	const blob = new Blob([byteArray], {
		type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	});
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === "string") {
		return error;
	}
	return "Unknown error";
}

export type CsvDelimiterType = "comma" | "semicolon" | "tab";

export function getCsvDelimiterChar(delimiterType: CsvDelimiterType): string {
	switch (delimiterType) {
		case "comma":
			return ",";
		case "semicolon":
			return ";";
		case "tab":
			return "\t";
		default:
			return ",";
	}
}
