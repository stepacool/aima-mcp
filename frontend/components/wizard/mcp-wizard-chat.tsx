"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CenteredSpinner } from "@/components/ui/custom/centered-spinner";
import { DeployStep } from "@/components/wizard/deploy-step";
import { EnvVarsStep } from "@/components/wizard/env-vars-step";
import { StepZeroChat } from "@/components/wizard/step-zero-chat";
import { ToolsStep } from "@/components/wizard/tools-step";
import { WizardStepIndicator } from "@/components/wizard/wizard-step-indicator";
import {
	useWizardPolling,
	useWizardSessions,
} from "@/hooks/use-wizard-sessions";
import {
	type WizardEnvVar,
	type WizardMessage,
	WizardStep,
	type WizardTool,
} from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

interface McpWizardChatProps {
	organizationId: string;
}

export function McpWizardChat({ organizationId }: McpWizardChatProps) {
	const router = useRouter();
	const searchParams = useSearchParams();

	// Check for existing serverId in URL (must be declared before state that uses it)
	const urlServerId = searchParams.get("serverId");

	// True if serverId was already in the URL at mount time (resuming an existing session)
	const [isResume] = useState(() => !!searchParams.get("serverId"));

	// Wizard state - Step 0 chat session ID (created on mount, persisted in URL)
	const [chatServerId, setChatServerId] = useState<string | null>(urlServerId);
	// Active server ID for steps 1+ (same server, set after startWizard confirms)
	const [currentStep, setCurrentStep] = useState<WizardStep>(
		WizardStep.stepZero,
	);
	const [serverId, setServerId] = useState<string | null>(null);
	const [preWizardMessages, setPreWizardMessages] = useState<WizardMessage[]>(
		[],
	);
	const [suggestedTools, setSuggestedTools] = useState<WizardTool[]>([]);
	const [selectedToolIds, setSelectedToolIds] = useState<string[]>([]);
	const [suggestedEnvVars, setSuggestedEnvVars] = useState<WizardEnvVar[]>([]);
	const [isStarting, setIsStarting] = useState(false);

	// Wizard session management for async processing
	const { addWizardSession, removeWizardSession } =
		useWizardSessions(organizationId);

	// Mutations
	const createSessionMutation =
		trpc.organization.wizard.createSession.useMutation();
	const startWizardMutation = trpc.organization.wizard.start.useMutation();
	const retryMutation = trpc.organization.wizard.retry.useMutation();

	const generateCodeMutation =
		trpc.organization.wizard.generateCode.useMutation();

	// Guard against StrictMode double-invocation and "Create New" spam
	const sessionCreatingRef = useRef(false);

	// Use the polling hook for auto-refreshing wizard state
	const {
		wizardState,
		isLoading: isLoadingState,
		isProcessing,
		hasFailed,
		processingError,
		refetch,
		error: queryError,
	} = useWizardPolling(urlServerId, {
		enabled: !!urlServerId,
		onComplete: (step) => {
			// When wizard finishes processing, remove from in-progress list
			// This triggers when any step completes and is no longer processing
			if (urlServerId && step !== WizardStep.stepZero) {
				removeWizardSession(urlServerId);
			}
		},
		onToolsReady: () => {
			// Tools are ready, update suggested tools from server state
			if (wizardState?.tools) {
				setSuggestedTools(wizardState.tools);
			}
		},
		onEnvVarsReady: () => {
			// Env vars are ready, update suggested env vars from server state
			if (wizardState?.envVars) {
				setSuggestedEnvVars(wizardState.envVars);
			}
		},
	});

	// Create a chat session when there's no serverId in the URL, or sync from URL on resume.
	// Runs whenever urlServerId changes (covers "Create New" navigations).
	// The ref guard prevents StrictMode's double-invocation from creating two sessions.
	useEffect(() => {
		if (urlServerId) {
			// Resume: sync chatServerId from URL and reset the guard for future "Create New"
			setChatServerId(urlServerId);
			sessionCreatingRef.current = false;
			return;
		}

		// Fresh wizard: guard against duplicate calls
		if (sessionCreatingRef.current) return;
		sessionCreatingRef.current = true;
		setChatServerId(null); // show spinner while creating

		createSessionMutation.mutateAsync().then((result) => {
			setChatServerId(result.serverId);
			router.replace(
				`/dashboard/organization/new-mcp-server?serverId=${result.serverId}`,
			);
		}).catch(() => {
			sessionCreatingRef.current = false; // allow retry on failure
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [urlServerId]);

	// Reset UI state when navigating to a new chat (no serverId in URL)
	useEffect(() => {
		if (!urlServerId) {
			setServerId(null);
			setCurrentStep(WizardStep.stepZero);
			setPreWizardMessages([]);
			setSuggestedTools([]);
			setSelectedToolIds([]);
			setSuggestedEnvVars([]);
			setIsStarting(false);
		}
	}, [urlServerId]);

	// Initialize from URL params or Python backend state
	useEffect(() => {
		if (!urlServerId) return;
		if (!wizardState) return;
		setServerId(wizardState.serverId);
		setCurrentStep(wizardState.wizardStep as WizardStep);
		setSuggestedTools(wizardState.tools);
		if (wizardState.selectedToolIds && wizardState.selectedToolIds.length > 0) {
			setSelectedToolIds(wizardState.selectedToolIds);
		}
		if (wizardState.envVars) {
			setSuggestedEnvVars(wizardState.envVars);
		}
	}, [urlServerId, wizardState]);

	// Handle Step 0 readiness - transition the existing session to tool generation
	const handleStepZeroReady = useCallback(
		async (description: string, technicalDetails: string[]) => {
			setIsStarting(true);
			try {
				const result = await startWizardMutation.mutateAsync({
					serverId: chatServerId ?? undefined,
					description,
					technicalDetails:
						technicalDetails.length > 0 ? technicalDetails : undefined,
				});

				setServerId(result.serverId);

				// Go to actions step (backend processes in background, component handles loading state)
				setCurrentStep(WizardStep.tools);

				// Add to in-progress sessions for async tracking
				addWizardSession(result.serverId, description);

				// Restart polling - it was idle during step 0, now backend is generating tools
				refetch();
			} catch (_error) {
				toast.error("Failed to start wizard");
			} finally {
				setIsStarting(false);
			}
		},
		[startWizardMutation, chatServerId, addWizardSession, refetch],
	);

	// Handle messages update in Step 0 (client-side only, not persisted)
	const handleMessagesUpdate = useCallback((messages: WizardMessage[]) => {
		setPreWizardMessages(messages);
	}, []);

	// Handle tools submitted - transition to ENV_VARS
	const handleToolsSubmitted = useCallback((toolIds: string[]) => {
		setSelectedToolIds(toolIds);
		refetch().then(() => {
			setCurrentStep(WizardStep.envVars);
		});
	}, []);

	// Handle env vars submitted - skip auth and trigger code generation
	const handleEnvVarsSubmitted = useCallback(() => {
		if (!serverId || generateCodeMutation.isPending) {
			return;
		}
		// Skip auth step - directly generate code and transition to deploy
		generateCodeMutation.mutateAsync({ serverId }).then(() => {
			refetch().then(() => {
				setCurrentStep(WizardStep.deploy);
			});
		});
	}, [serverId, generateCodeMutation, refetch]);

	// Handle server activated - show toast and redirect to server detail
	const handleServerActivated = useCallback(
		(_url: string, _token: string) => {
			refetch();
			toast.success("Your MCP server is live!");
			router.push(`/dashboard/organization/mcp-servers/${serverId}`);
		},
		[refetch, serverId, router],
	);

	// Handle retry after failure
	const handleRetry = useCallback(async () => {
		if (!serverId) return;
		try {
			await retryMutation.mutateAsync({ serverId });
			// Refetch state to start polling again
			refetch();
			toast.success("Retrying tool generation...");
		} catch (_error) {
			toast.error("Failed to retry. Please try again.");
		}
	}, [serverId, refetch, retryMutation]);

	// Only block render waiting for wizardState when resuming an existing session.
	// For fresh starts (isResume=false), the chat UI renders immediately; wizardState
	// loads in the background and only matters if/when the user is past step 0.
	if (isResume && urlServerId && isLoadingState && !wizardState) {
		return <CenteredSpinner />;
	}

	// Handle error state when wizard state fetch fails
	if (urlServerId && !isLoadingState && !wizardState) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
				<p className="text-destructive">Failed to load wizard state</p>
				{queryError && (
					<p className="text-sm text-muted-foreground">{queryError.message}</p>
				)}
				<div className="flex gap-2">
					<button
						type="button"
						onClick={() => refetch()}
						className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
					>
						Retry
					</button>
					<button
						type="button"
						onClick={() =>
							router.push("/dashboard/organization/new-mcp-server")
						}
						className="inline-flex items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
					>
						Start New Wizard
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			{/* Step Indicator */}
			<div className="shrink-0 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
				<WizardStepIndicator
					currentStep={currentStep}
					isProcessing={isProcessing}
				/>
			</div>

			{/* Step Content */}
			<div className="min-h-0 flex-1">
				{currentStep === WizardStep.stepZero && (
					<>
						{isStarting || !chatServerId ? (
							<div className="flex h-full items-center justify-center">
								<CenteredSpinner />
							</div>
						) : (
							<StepZeroChat
								serverId={chatServerId}
								organizationId={organizationId}
								initialMessages={preWizardMessages}
								onReady={handleStepZeroReady}
								onMessagesUpdate={handleMessagesUpdate}
							/>
						)}
					</>
				)}

				{currentStep === WizardStep.tools && serverId && (
					<ToolsStep
						serverId={serverId}
						suggestedTools={suggestedTools}
						isProcessing={isProcessing}
						processingError={hasFailed ? processingError : null}
						onToolsSubmitted={handleToolsSubmitted}
						onRetry={handleRetry}
						onRefetchState={refetch}
					/>
				)}

				{currentStep === WizardStep.envVars && serverId && (
					<EnvVarsStep
						serverId={serverId}
						suggestedEnvVars={suggestedEnvVars}
						isProcessing={isProcessing}
						processingError={hasFailed ? processingError : null}
						onEnvVarsSubmitted={handleEnvVarsSubmitted}
						onRetry={handleRetry}
						onRefetchState={refetch}
					/>
				)}

				{currentStep === WizardStep.deploy &&
					serverId &&
					wizardState?.tools && (
						<DeployStep
							serverId={serverId}
							selectedToolIds={selectedToolIds}
							suggestedTools={suggestedTools}
							toolsWithCode={wizardState.tools}
							isProcessing={isProcessing}
							processingError={hasFailed ? processingError : null}
							deployment={wizardState.deployment ?? null}
							onServerActivated={handleServerActivated}
							onRetry={handleRetry}
						/>
					)}

				</div>
		</div>
	);
}
