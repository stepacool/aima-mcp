/**
 * Marker to detect when the AI determines the user is ready to proceed
 */
export const READY_TO_START_MARKER = "---READY_TO_START---";
export const END_READY_MARKER = "---END_READY---";

export const TECHNICAL_DETAILS_MARKER = "---TECHNICAL_DETAILS---";
export const END_TECHNICAL_DETAILS_MARKER = "---END_TECHNICAL_DETAILS---";

/**
 * NOTE: STEP_ZERO_SYSTEM_PROMPT has been migrated to the Python backend.
 * See backend/src/core/prompts/step_0_wizard_chat.yaml
 * The markers and extraction helpers below are still needed by the frontend UI.
 */

/**
 * Extracts the description from an AI response that contains the ready markers.
 * Returns null if the markers are not found.
 */
export function extractReadyDescription(response: string): string | null {
	const startIndex = response.indexOf(READY_TO_START_MARKER);
	const endIndex = response.indexOf(END_READY_MARKER);

	if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
		return null;
	}

	const description = response
		.substring(startIndex + READY_TO_START_MARKER.length, endIndex)
		.trim();

	return description || null;
}

/**
 * Checks if an AI response contains the ready-to-start marker.
 */
export function isReadyToStart(response: string): boolean {
	return (
		response.includes(READY_TO_START_MARKER) &&
		response.includes(END_READY_MARKER)
	);
}

/**
 * Extracts the technical details from an AI response that contains the technical details markers.
 * Returns null if the markers are not found.
 */
export function extractTechnicalDetails(response: string): string | null {
	const startIndex = response.indexOf(TECHNICAL_DETAILS_MARKER);
	const endIndex = response.indexOf(END_TECHNICAL_DETAILS_MARKER);

	if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
		return null;
	}

	const technicalDetails = response
		.substring(startIndex + TECHNICAL_DETAILS_MARKER.length, endIndex)
		.trim();

	return technicalDetails || null;
}

/**
 * Checks if an AI response contains the technical details markers.
 */
export function hasTechnicalDetails(response: string): boolean {
	return (
		response.includes(TECHNICAL_DETAILS_MARKER) &&
		response.includes(END_TECHNICAL_DETAILS_MARKER)
	);
}
