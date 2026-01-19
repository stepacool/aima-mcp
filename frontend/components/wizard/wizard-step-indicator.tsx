"use client";

import { CheckIcon } from "lucide-react";
import { WizardStep } from "@/schemas/wizard-schemas";
import { cn } from "@/lib/utils";

interface WizardStepIndicatorProps {
	currentStep: WizardStep;
	className?: string;
	onStepClick?: (step: WizardStep) => void;
}

const STEPS = [
	{ key: WizardStep.stepZero, label: "Describe", description: "Tell us what you want to build" },
	{ key: WizardStep.actions, label: "Tools", description: "Select the tools for your server" },
	{ key: WizardStep.auth, label: "Auth", description: "Configure authentication" },
	{ key: WizardStep.deploy, label: "Deploy", description: "Review and deploy your server" },
	{ key: WizardStep.complete, label: "Complete", description: "Your server is live" },
];

function getStepIndex(step: WizardStep): number {
	// Map 'describe' (processing state) to 'stepZero' for indicator display
	// The "describe" step is a transitional processing state before tools are ready
	const normalizedStep = step === WizardStep.describe ? WizardStep.stepZero : step;
	return STEPS.findIndex((s) => s.key === normalizedStep);
}

export function WizardStepIndicator({
	currentStep,
	className,
	onStepClick,
}: WizardStepIndicatorProps) {
	const currentIndex = getStepIndex(currentStep);
	// Determine if describe step is active (processing state) - clicking should be disabled
	const isDescribeStep = currentStep === WizardStep.describe;

	return (
		<div className={cn("flex items-center justify-center gap-2", className)}>
			{STEPS.map((step, index) => {
				const isComplete = index < currentIndex;
				const isCurrent = index === currentIndex;
				const isPending = index > currentIndex;
				// Allow clicking on current step or completed steps, but not when in describe/processing state
				const isClickable = onStepClick && (isCurrent || isComplete) && !isDescribeStep;

				const handleClick = () => {
					if (isClickable) {
						onStepClick(step.key);
					}
				};

				return (
					<div key={step.key} className="flex items-center">
						{/* Step Circle */}
						<button
							type="button"
							onClick={handleClick}
							disabled={!isClickable}
							className={cn(
								"flex size-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
								isComplete && "border-primary bg-primary text-primary-foreground",
								isCurrent && "border-primary text-primary",
								isPending && "border-muted-foreground/30 text-muted-foreground/50",
								isClickable && "cursor-pointer hover:opacity-80",
								!isClickable && "cursor-default"
							)}
						>
							{isComplete ? (
								<CheckIcon className="size-4" />
							) : (
								<span>{index + 1}</span>
							)}
						</button>

						{/* Step Label (visible on larger screens) */}
						<button
							type="button"
							onClick={handleClick}
							disabled={!isClickable}
							className={cn(
								"ml-2 hidden flex-col md:flex text-left",
								isPending && "opacity-50",
								isClickable && "cursor-pointer hover:opacity-80",
								!isClickable && "cursor-default"
							)}
						>
							<span
								className={cn(
									"text-sm font-medium",
									isCurrent && "text-primary"
								)}
							>
								{step.label}
							</span>
						</button>

						{/* Connector Line */}
						{index < STEPS.length - 1 && (
							<div
								className={cn(
									"mx-3 h-0.5 w-8 transition-colors md:w-12",
									index < currentIndex ? "bg-primary" : "bg-muted-foreground/30"
								)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
