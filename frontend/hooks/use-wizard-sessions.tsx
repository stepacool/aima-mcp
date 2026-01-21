"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProcessingStatus, WizardStep } from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

const STORAGE_KEY = "mcp-wizard-in-progress";

interface InProgressWizard {
	serverId: string;
	organizationId: string;
	startedAt: string;
	description?: string;
}

interface StoredWizards {
	[organizationId: string]: InProgressWizard[];
}

/**
 * Hook to manage in-progress wizard sessions with auto-polling.
 * Sessions are stored in localStorage per organization.
 * Uses TanStack Query's refetchInterval for automatic status updates.
 */
export function useWizardSessions(organizationId: string) {
	const [inProgressWizards, setInProgressWizards] = useState<
		InProgressWizard[]
	>([]);

	// Load from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			try {
				const parsed: StoredWizards = JSON.parse(stored);
				setInProgressWizards(parsed[organizationId] || []);
			} catch {
				setInProgressWizards([]);
			}
		}
	}, [organizationId]);

	// Save to localStorage whenever inProgressWizards changes
	const saveToStorage = useCallback(
		(wizards: InProgressWizard[]) => {
			const stored = localStorage.getItem(STORAGE_KEY);
			let allWizards: StoredWizards = {};
			if (stored) {
				try {
					allWizards = JSON.parse(stored);
				} catch {
					// ignore
				}
			}
			allWizards[organizationId] = wizards;
			localStorage.setItem(STORAGE_KEY, JSON.stringify(allWizards));
		},
		[organizationId],
	);

	// Add a new in-progress wizard session
	const addWizardSession = useCallback(
		(serverId: string, description?: string) => {
			const newWizard: InProgressWizard = {
				serverId,
				organizationId,
				startedAt: new Date().toISOString(),
				description,
			};
			setInProgressWizards((prev) => {
				// Avoid duplicates
				if (prev.some((w) => w.serverId === serverId)) {
					return prev;
				}
				const updated = [...prev, newWizard];
				saveToStorage(updated);
				return updated;
			});
		},
		[organizationId, saveToStorage],
	);

	// Remove a wizard session (when completed or error)
	const removeWizardSession = useCallback(
		(serverId: string) => {
			setInProgressWizards((prev) => {
				const updated = prev.filter((w) => w.serverId !== serverId);
				saveToStorage(updated);
				return updated;
			});
		},
		[saveToStorage],
	);

	// Clear all wizard sessions for this organization
	const clearAllSessions = useCallback(() => {
		setInProgressWizards([]);
		saveToStorage([]);
	}, [saveToStorage]);

	return {
		inProgressWizards,
		addWizardSession,
		removeWizardSession,
		clearAllSessions,
	};
}

// Helper to check if processing is in progress (based on processing_status, not wizard_step)
function isProcessingStatus(processingStatus: string | undefined): boolean {
	return processingStatus === ProcessingStatus.processing;
}

// Helper to check if processing has failed
function hasFailedStatus(processingStatus: string | undefined): boolean {
	return processingStatus === ProcessingStatus.failed;
}

/**
 * Hook to poll a single wizard session's state.
 * Automatically stops polling when processing is complete or has failed.
 */
export function useWizardPolling(
	serverId: string | null,
	options?: {
		onComplete?: (step: WizardStep) => void;
		onToolsReady?: () => void;
		onEnvVarsReady?: () => void;
		onError?: (error: string) => void;
		onNetworkError?: (error: unknown) => void;
		enabled?: boolean;
	},
) {
	const { enabled = true } = options || {};

	// Use refs to store callbacks to avoid infinite loops
	const onCompleteRef = useRef(options?.onComplete);
	const onToolsReadyRef = useRef(options?.onToolsReady);
	const onEnvVarsReadyRef = useRef(options?.onEnvVarsReady);
	const onErrorRef = useRef(options?.onError);
	const onNetworkErrorRef = useRef(options?.onNetworkError);

	// Track what we've already notified to prevent duplicate calls
	const notifiedRef = useRef<{
		toolsReady: boolean;
		envVarsReady: boolean;
		error: string | null;
		completedStep: string | null;
	}>({
		toolsReady: false,
		envVarsReady: false,
		error: null,
		completedStep: null,
	});

	// Update refs when callbacks change
	useEffect(() => {
		onCompleteRef.current = options?.onComplete;
		onToolsReadyRef.current = options?.onToolsReady;
		onEnvVarsReadyRef.current = options?.onEnvVarsReady;
		onErrorRef.current = options?.onError;
		onNetworkErrorRef.current = options?.onNetworkError;
	});

	const { data, isLoading, error, refetch } =
		trpc.organization.wizard.getState.useQuery(
			{ serverId: serverId! },
			{
				enabled: enabled && !!serverId,
				retry: 2,
				// Auto-polling: refetch every 3 seconds while processing
				// Stop polling once processing is complete or has failed
				refetchInterval: (query) => {
					const state = query.state.data;
					if (!state) return 3000; // Keep polling if no data yet
					// Continue polling only while processing
					return isProcessingStatus(state.processingStatus) ? 3000 : false;
				},
				refetchIntervalInBackground: true, // Continue polling even when tab is inactive
			},
		);

	// Reset notification tracking when serverId changes
	useEffect(() => {
		notifiedRef.current = {
			toolsReady: false,
			envVarsReady: false,
			error: null,
			completedStep: null,
		};
	}, [serverId]);

	// Handle all notifications in a single effect based on data changes
	useEffect(() => {
		if (!data) return;

		const {
			wizardStep: wizard_step,
			processingStatus: processing_status,
			processingError: processing_error,
		} = data;

		// Notify when tools are ready (only once)
		if (
			wizard_step === WizardStep.actions &&
			processing_status === ProcessingStatus.idle &&
			!notifiedRef.current.toolsReady
		) {
			notifiedRef.current.toolsReady = true;
			onToolsReadyRef.current?.();
		}

		// Notify when env vars are ready (only once)
		if (
			wizard_step === WizardStep.envVars &&
			processing_status === ProcessingStatus.idle &&
			!notifiedRef.current.envVarsReady
		) {
			notifiedRef.current.envVarsReady = true;
			onEnvVarsReadyRef.current?.();
		}

		// Notify when processing fails (only once per error)
		if (
			hasFailedStatus(processing_status) &&
			processing_error &&
			notifiedRef.current.error !== processing_error
		) {
			notifiedRef.current.error = processing_error;
			onErrorRef.current?.(processing_error);
		}

		// Notify when step completes (only once per step change, when not processing)
		if (
			!isProcessingStatus(processing_status) &&
			notifiedRef.current.completedStep !== wizard_step
		) {
			notifiedRef.current.completedStep = wizard_step;
			onCompleteRef.current?.(wizard_step as WizardStep);
		}
	}, [data]);

	// Notify on network error
	useEffect(() => {
		if (error) {
			onNetworkErrorRef.current?.(error);
		}
	}, [error]);

	return {
		wizardState: data,
		isLoading,
		error,
		refetch,
		isProcessing: data ? isProcessingStatus(data.processingStatus) : true,
		hasFailed: data ? hasFailedStatus(data.processingStatus) : false,
		processingError: data?.processingError ?? null,
	};
}
