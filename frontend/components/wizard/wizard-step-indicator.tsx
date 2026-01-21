"use client";

import { CheckIcon, LoaderCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStep } from "@/schemas/wizard-schemas";

interface WizardStepIndicatorProps {
	currentStep: WizardStep;
	isProcessing?: boolean;
	className?: string;
}

const STEPS = [
	{
		key: WizardStep.stepZero,
		label: "Describe",
		description: "Tell us what you want to build",
	},
	{
		key: WizardStep.tools,
		label: "Tools",
		description: "Select the tools for your server",
	},
	{
		key: WizardStep.envVars,
		label: "Environment Variables",
		description: "Configure environment variables",
	},
	{
		key: WizardStep.auth,
		label: "Authentication",
		description: "Generate API key",
	},
	{
		key: WizardStep.deploy,
		label: "Deploy",
		description: "Review and deploy your server",
	},
	{
		key: WizardStep.complete,
		label: "Complete",
		description: "Your server is live",
	},
];

function getStepIndex(step: WizardStep): number {
	return STEPS.findIndex((s) => s.key === step);
}

export function WizardStepIndicator({
	currentStep,
	isProcessing = false,
	className,
}: WizardStepIndicatorProps) {
	const currentIndex = getStepIndex(currentStep);

	return (
		<div className={cn("flex items-center justify-center gap-2", className)}>
			{STEPS.map((step, index) => {
				const isComplete = index < currentIndex;
				const isCurrent = index === currentIndex;
				const isPending = index > currentIndex;

				return (
					<div key={step.key} className="flex items-center">
						{/* Step Circle */}
						<div
							className={cn(
								"flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
								isComplete &&
									"border-primary bg-primary text-primary-foreground",
								isCurrent && "border-primary text-primary",
								isPending &&
									"border-muted-foreground/30 text-muted-foreground/50",
							)}
						>
							{isComplete ? (
								<CheckIcon className="size-4" />
							) : isCurrent && isProcessing ? (
								<LoaderCircleIcon className="size-4 animate-spin" />
							) : (
								<span>{index + 1}</span>
							)}
						</div>

						{/* Step Label (visible on larger screens) */}
						<div
							className={cn(
								"ml-2 hidden flex-col md:flex",
								isPending && "opacity-50",
							)}
						>
							<span
								className={cn(
									"text-sm font-medium",
									isCurrent && "text-primary",
								)}
							>
								{step.label}
							</span>
						</div>

						{/* Connector Line */}
						{index < STEPS.length - 1 && (
							<div
								className={cn(
									"mx-3 h-0.5 w-8 transition-colors md:w-12",
									index < currentIndex
										? "bg-primary"
										: "bg-muted-foreground/30",
								)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
