"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionsStep } from "@/components/wizard/actions-step";
import { AuthStep } from "@/components/wizard/auth-step";
import { CompleteStep } from "@/components/wizard/complete-step";
import { DeployStep } from "@/components/wizard/deploy-step";
import { StepZeroChat } from "@/components/wizard/step-zero-chat";
import { WizardStepIndicator } from "@/components/wizard/wizard-step-indicator";
import { CenteredSpinner } from "@/components/ui/custom/centered-spinner";
import {
	WizardStep,
	type WizardAuthType,
	type WizardMessage,
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
	const [currentStep, setCurrentStep] = useState<WizardStep>(WizardStep.stepZero);
	const [serverId, setServerId] = useState<string | null>(null);
	const [preWizardMessages, setPreWizardMessages] = useState<WizardMessage[]>([]);
	const [suggestedTools, setSuggestedTools] = useState<WizardTool[]>([]);
	const [selectedTools, setSelectedTools] = useState<string[]>([]);
	const [authType, setAuthType] = useState<WizardAuthType | null>(null);
	const [serverUrl, setServerUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	// Mutations
	const startWizardMutation = trpc.organization.wizard.start.useMutation();

	// Check for existing serverId in URL and restore state from Python backend
	const urlServerId = searchParams.get("serverId");

	const { data: wizardState, isLoading: isLoadingState } =
		trpc.organization.wizard.getState.useQuery(
			{ serverId: urlServerId! },
			{
				enabled: !!urlServerId,
				retry: false,
			}
		);

	// Initialize from URL params or Python backend state
	useEffect(() => {
		if (urlServerId && wizardState) {
			setServerId(wizardState.id);
			setCurrentStep(wizardState.step as WizardStep);
			setSuggestedTools(wizardState.suggestedTools);
			setSelectedTools(wizardState.selectedTools);
			setAuthType(
				wizardState.authType === "none" ||
				wizardState.authType === "api_key" ||
				wizardState.authType === "oauth"
					? wizardState.authType
					: null
			);
			setServerUrl(wizardState.serverUrl);
		}
	}, [urlServerId, wizardState]);

	// Handle Step 0 readiness - start the Python backend wizard
	const handleStepZeroReady = useCallback(
		async (description: string) => {
			setIsLoading(true);
			try {
				const result = await startWizardMutation.mutateAsync({
					description,
				});

				setServerId(result.id);
				setSuggestedTools(result.suggestedTools);
				setCurrentStep(WizardStep.actions);

				// Update URL with server ID for resumability
				router.replace(`/dashboard/organization/new-mcp-server?serverId=${result.id}`);
			} catch (_error) {
				toast.error("Failed to start wizard");
			} finally {
				setIsLoading(false);
			}
		},
		[startWizardMutation, router]
	);

	// Handle messages update in Step 0 (client-side only, not persisted)
	const handleMessagesUpdate = useCallback((messages: WizardMessage[]) => {
		setPreWizardMessages(messages);
	}, []);

	// Handle tools selected - transition to AUTH
	const handleToolsSelected = useCallback((tools: string[]) => {
		setSelectedTools(tools);
		setCurrentStep(WizardStep.auth);
	}, []);

	// Handle tools refined
	const handleToolsRefined = useCallback((newTools: WizardTool[]) => {
		setSuggestedTools(newTools);
	}, []);

	// Handle auth configured - transition to DEPLOY
	const handleAuthConfigured = useCallback((type: WizardAuthType) => {
		setAuthType(type);
		setCurrentStep(WizardStep.deploy);
	}, []);

	// Handle server activated - transition to COMPLETE
	const handleServerActivated = useCallback((url: string) => {
		setServerUrl(url);
		setCurrentStep(WizardStep.complete);
	}, []);

	// Show loading state when restoring from URL
	if (urlServerId && isLoadingState) {
		return <CenteredSpinner />;
	}

	return (
		<div className="flex h-full flex-col">
			{/* Step Indicator */}
			<div className="shrink-0 border-b bg-background/80 px-4 py-3 backdrop-blur-sm">
				<WizardStepIndicator currentStep={currentStep} />
			</div>

			{/* Step Content */}
			<div className="min-h-0 flex-1">
				{currentStep === WizardStep.stepZero && (
					<>
						{isLoading ? (
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

				{currentStep === WizardStep.actions && serverId && (
					<ActionsStep
						serverId={serverId}
						suggestedTools={suggestedTools}
						onToolsSelected={handleToolsSelected}
						onRefine={handleToolsRefined}
					/>
				)}

				{currentStep === WizardStep.auth && serverId && (
					<AuthStep
						serverId={serverId}
						selectedTools={selectedTools}
						onAuthConfigured={handleAuthConfigured}
					/>
				)}

				{currentStep === WizardStep.deploy && serverId && authType && (
					<DeployStep
						serverId={serverId}
						selectedTools={selectedTools}
						authType={authType}
						onServerActivated={handleServerActivated}
					/>
				)}

				{currentStep === WizardStep.complete && serverUrl && (
					<CompleteStep serverUrl={serverUrl} />
				)}
			</div>
		</div>
	);
}
