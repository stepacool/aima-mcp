"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { CenteredSpinner } from "@/components/ui/custom/centered-spinner";
import { CompleteStep } from "@/components/wizard/complete-step";
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

	// Wizard state - Step 0 is client-side, rest is managed by Python backend
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
	const [bearerToken, setBearerToken] = useState<string | null>(null);
	const [serverUrl, setServerUrl] = useState<string | null>(null);
	const [isStarting, setIsStarting] = useState(false);

	// Wizard session management for async processing
	const { addWizardSession, removeWizardSession } =
		useWizardSessions(organizationId);

	// Mutations
	const startWizardMutation = trpc.organization.wizard.start.useMutation();
	const retryMutation = trpc.organization.wizard.retry.useMutation();

	const generateCodeMutation =
		trpc.organization.wizard.generateCode.useMutation();

	// Check for existing serverId in URL
	const urlServerId = searchParams.get("serverId");

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

	// Reset state when navigating to a new chat (no serverId in URL)
	useEffect(() => {
		if (!urlServerId) {
			// Reset all state to initial values for new chat
			setServerId(null);
			setCurrentStep(WizardStep.stepZero);
			setPreWizardMessages([]);
			setSuggestedTools([]);
			setSelectedToolIds([]);
			setSuggestedEnvVars([]);
			setBearerToken(null);
			setServerUrl(null);
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
		if (wizardState.bearerToken) {
			setBearerToken(wizardState.bearerToken);
		}
		setServerUrl(wizardState.serverUrl);
	}, [urlServerId, wizardState]);

	// Handle Step 0 readiness - start the Python backend wizard
	const handleStepZeroReady = useCallback(
		async (description: string, technicalDetails: string[]) => {
			setIsStarting(true);
			try {
				const result = await startWizardMutation.mutateAsync({
					description,
					technicalDetails:
						technicalDetails.length > 0 ? technicalDetails : undefined,
				});

				setServerId(result.serverId);

				// Go to actions step (backend processes in background, component handles loading state)
				setCurrentStep(WizardStep.tools);

				// Add to in-progress sessions for async tracking
				// User can navigate away and return later
				addWizardSession(result.serverId, description);

				// Update URL with server ID for resumability
				router.replace(
					`/dashboard/organization/new-mcp-server?serverId=${result.serverId}`,
				);
			} catch (_error) {
				toast.error("Failed to start wizard");
			} finally {
				setIsStarting(false);
			}
		},
		[startWizardMutation, router, addWizardSession],
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
		if (!serverId) {
			return;
		}
		// Skip auth step - directly generate code and transition to deploy
		generateCodeMutation.mutateAsync({ serverId }).then(() => {
			refetch().then(() => {
				setCurrentStep(WizardStep.deploy);
			});
		});
	}, [serverId, generateCodeMutation, refetch]);

	// Handle server activated - transition to COMPLETE
	// Now receives bearer token from deploy step
	const handleServerActivated = useCallback((url: string, token: string) => {
		setServerUrl(url);
		setBearerToken(token);
		refetch();
		setCurrentStep(WizardStep.complete);
	}, [refetch]);

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

	// Show loading state when restoring from URL (brief initial load)
	if (urlServerId && isLoadingState && !wizardState) {
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
						{isStarting ? (
							<div className="flex h-full items-center justify-center">
								<CenteredSpinner />
							</div>
						) : (
							<StepZeroChat
								sessionId="step-zero"
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

				{currentStep === WizardStep.complete && serverUrl && bearerToken && (
					<CompleteStep
						serverUrl={serverUrl}
						deployment={wizardState?.deployment ?? null}
						bearerToken={bearerToken}
						serverName={wizardState?.description ?? undefined}
					/>
				)}
			</div>
		</div>
	);
}
