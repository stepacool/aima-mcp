"use client";

import { RefreshCwIcon, SettingsIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CenteredSpinner } from "@/components/ui/custom/centered-spinner";
import type { WizardEnvVar } from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

interface EnvVarsStepProps {
	serverId: string;
	suggestedEnvVars: WizardEnvVar[];
	isProcessing: boolean;
	processingError?: string | null;
	onEnvVarsSubmitted: () => void;
	onRefine: (newEnvVars: WizardEnvVar[]) => void;
	onRetry?: () => void;
	onRefetchState?: () => void;
}

export function EnvVarsStep({
	serverId,
	suggestedEnvVars,
	isProcessing,
	processingError = null,
	onEnvVarsSubmitted,
	onRefine,
	onRetry,
	onRefetchState,
}: EnvVarsStepProps) {
	// Track env var values by their UUID
	const [envVarValues, setEnvVarValues] = useState<Record<string, string>>({});
	const [feedback, setFeedback] = useState("");
	const [isRefining, setIsRefining] = useState(false);

	const submitEnvVarsMutation = trpc.organization.wizard.submitEnvVars.useMutation();
	const refineEnvVarsMutation = trpc.organization.wizard.refineEnvVars.useMutation();

	const handleValueChange = (envVarId: string, value: string) => {
		setEnvVarValues((prev) => ({
			...prev,
			[envVarId]: value,
		}));
	};

	const handleRefine = async () => {
		if (!feedback.trim()) {
			toast.error("Please provide feedback for refinement");
			return;
		}

		setIsRefining(true);
		try {
			const result = await refineEnvVarsMutation.mutateAsync({
				serverId,
				feedback: feedback.trim(),
			});
			onRefine(result.envVars);
			setFeedback("");
			setEnvVarValues({});
			// Refetch wizard state to pick up any async processing status
			// This ensures polling continues if backend started async refinement
			onRefetchState?.();
			toast.success("Environment variables refined based on your feedback");
		} catch (_error) {
			toast.error("Failed to refine environment variables");
		} finally {
			setIsRefining(false);
		}
	};

	const handleContinue = async () => {
		// Build values map with all env vars (use empty string if not filled)
		const values: Record<string, string> = {};
		for (const envVar of suggestedEnvVars) {
			values[envVar.id] = envVarValues[envVar.id] || envVar.value || "";
		}

		try {
			await submitEnvVarsMutation.mutateAsync({
				serverId,
				values,
			});
			onEnvVarsSubmitted();
		} catch (_error) {
			toast.error("Failed to submit environment variables");
		}
	};

	// Show loading state while processing
	if (isProcessing) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
				<CenteredSpinner />
				<div className="max-w-md space-y-2">
					<p className="animate-pulse text-muted-foreground">
						Analyzing required environment variables...
					</p>
					<p className="text-sm text-muted-foreground/70">
						This may take a moment.
					</p>
				</div>
			</div>
		);
	}

	// Show error state if processing failed
	if (processingError) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
				<div className="max-w-md space-y-4">
					<div className="text-destructive">
						<p className="font-medium">Environment variable generation failed</p>
						<p className="mt-2 text-sm text-muted-foreground">
							{processingError}
						</p>
					</div>
					{onRetry && (
						<button
							type="button"
							onClick={onRetry}
							className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
						>
							Try Again
						</button>
					)}
				</div>
			</div>
		);
	}

	// If no env vars are needed, show a simple message and continue button
	if (suggestedEnvVars.length === 0) {
		return (
			<div className="flex h-full flex-col">
				<div className="flex flex-1 items-center justify-center p-6">
					<div className="mx-auto max-w-md space-y-6 text-center">
						<div className="flex justify-center">
							<div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
								<SettingsIcon className="size-8 text-primary" />
							</div>
						</div>
						<div>
							<h2 className="font-semibold text-2xl">No Configuration Required</h2>
							<p className="mt-2 text-muted-foreground">
								Your MCP server doesn't require any environment variables.
								You can proceed to the next step.
							</p>
						</div>
					</div>
				</div>

				<div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
					<div className="mx-auto flex max-w-4xl justify-end">
						<Button onClick={handleContinue} loading={submitEnvVarsMutation.isPending}>
							Continue to Authentication
						</Button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-3xl space-y-6">
					{/* Header */}
					<div className="text-center">
						<h2 className="font-semibold text-2xl">Configure Environment Variables</h2>
						<p className="mt-2 text-muted-foreground">
							Set the values for the environment variables your MCP server needs.
						</p>
					</div>

					{/* Env Var Cards */}
					<div className="space-y-4">
						{suggestedEnvVars.map((envVar) => (
							<Card key={envVar.id}>
								<CardHeader className="pb-2">
									<div className="flex items-center gap-2">
										<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
											<SettingsIcon className="size-4 text-primary" />
										</div>
										<CardTitle className="font-mono text-base">{envVar.name}</CardTitle>
									</div>
								</CardHeader>
								<CardContent className="space-y-3">
									<CardDescription>{envVar.description}</CardDescription>
									<div className="space-y-2">
										<Label htmlFor={`env-${envVar.id}`}>Value</Label>
										<Input
											id={`env-${envVar.id}`}
											type="password"
											placeholder={`Enter ${envVar.name}`}
											value={envVarValues[envVar.id] ?? envVar.value ?? ""}
											onChange={(e) => handleValueChange(envVar.id, e.target.value)}
										/>
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Refine Section */}
					<Card className="bg-muted/50">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">
								Missing something?
							</CardTitle>
							<CardDescription>
								Tell us what's missing and we'll update the configuration.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="feedback">Your feedback</Label>
								<Input
									id="feedback"
									placeholder="e.g., I also need a database connection string"
									value={feedback}
									onChange={(e) => setFeedback(e.target.value)}
								/>
							</div>
							<Button
								variant="outline"
								size="sm"
								onClick={handleRefine}
								loading={isRefining}
								disabled={!feedback.trim()}
							>
								<RefreshCwIcon className="size-4" />
								Refine configuration
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Footer */}
			<div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
				<div className="mx-auto flex max-w-3xl justify-end">
					<Button
						onClick={handleContinue}
						loading={submitEnvVarsMutation.isPending}
					>
						Continue to Authentication
					</Button>
				</div>
			</div>
		</div>
	);
}
