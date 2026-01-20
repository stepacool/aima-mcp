"use client";

import { CheckIcon, RefreshCwIcon, WrenchIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { WizardTool } from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

interface ActionsStepProps {
	serverId: string;
	suggestedTools: WizardTool[];
	onToolsSubmitted: (toolIds: string[]) => void;
	onRefine: (newTools: WizardTool[]) => void;
}

const MAX_FREE_TOOLS = 3;

export function ActionsStep({
	serverId,
	suggestedTools,
	onToolsSubmitted,
	onRefine,
}: ActionsStepProps) {
	// Track selected tools by their UUID
	const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(new Set());
	const [feedback, setFeedback] = useState("");
	const [isRefining, setIsRefining] = useState(false);

	const submitToolsMutation = trpc.organization.wizard.submitTools.useMutation();
	const refineActionsMutation = trpc.organization.wizard.refineActions.useMutation();

	const toggleTool = (toolId: string) => {
		const newSelected = new Set(selectedToolIds);
		if (newSelected.has(toolId)) {
			newSelected.delete(toolId);
		} else {
			if (newSelected.size >= MAX_FREE_TOOLS) {
				toast.error(`Maximum ${MAX_FREE_TOOLS} tools allowed`, {
					description: "Upgrade to select more tools",
				});
				return;
			}
			newSelected.add(toolId);
		}
		setSelectedToolIds(newSelected);
	};

	const handleRefine = async () => {
		if (!feedback.trim()) {
			toast.error("Please provide feedback for refinement");
			return;
		}

		setIsRefining(true);
		try {
			const result = await refineActionsMutation.mutateAsync({
				serverId,
				feedback: feedback.trim(),
				toolIds: selectedToolIds.size > 0 ? Array.from(selectedToolIds) : undefined,
			});
			onRefine(result.suggestedTools);
			setFeedback("");
			setSelectedToolIds(new Set());
			toast.success("Tools refined based on your feedback");
		} catch (_error) {
			toast.error("Failed to refine tools");
		} finally {
			setIsRefining(false);
		}
	};

	const handleContinue = async () => {
		if (selectedToolIds.size === 0) {
			toast.error("Please select at least one tool");
			return;
		}

		try {
			await submitToolsMutation.mutateAsync({
				serverId,
				selectedToolIds: Array.from(selectedToolIds),
			});
			onToolsSubmitted(Array.from(selectedToolIds));
		} catch (_error) {
			toast.error("Failed to submit tools");
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Header */}
					<div className="text-center">
						<h2 className="font-semibold text-2xl">Select Your Tools</h2>
						<p className="mt-2 text-muted-foreground">
							Choose up to {MAX_FREE_TOOLS} tools for your MCP server. These
							define what actions AI models can perform.
						</p>
					</div>

					{/* Tool Cards */}
					<div className="grid gap-4 md:grid-cols-2">
						{suggestedTools.map((tool) => {
							const isSelected = selectedToolIds.has(tool.id);
							return (
								<Card
									key={tool.id}
									className={cn(
										"cursor-pointer transition-all hover:shadow-md",
										isSelected && "border-primary ring-2 ring-primary/20"
									)}
									onClick={() => toggleTool(tool.id)}
								>
									<CardHeader className="pb-2">
										<div className="flex items-start justify-between">
											<div className="flex items-center gap-2">
												<div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
													<WrenchIcon className="size-4 text-primary" />
												</div>
												<CardTitle className="text-base">{tool.name}</CardTitle>
											</div>
											<div
												className={cn(
													"flex size-6 items-center justify-center rounded-full border-2 transition-colors",
													isSelected
														? "border-primary bg-primary text-primary-foreground"
														: "border-muted-foreground/30"
												)}
											>
												{isSelected && <CheckIcon className="size-4" />}
											</div>
										</div>
									</CardHeader>
									<CardContent>
										<CardDescription className="text-sm">
											{tool.description}
										</CardDescription>
									</CardContent>
								</Card>
							);
						})}
					</div>

					{/* Selection Counter */}
					<div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
						<span>
							{selectedToolIds.size} / {MAX_FREE_TOOLS} tools selected
						</span>
					</div>

					{/* Refine Section */}
					<Card className="bg-muted/50">
						<CardHeader className="pb-2">
							<CardTitle className="text-base">
								Not seeing what you need?
							</CardTitle>
							<CardDescription>
								Tell us what's missing and we'll suggest different tools.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="space-y-2">
								<Label htmlFor="feedback">Your feedback</Label>
								<Input
									id="feedback"
									placeholder="e.g., I need a tool to update records, not just read them"
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
								Refine suggestions
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Footer */}
			<div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
				<div className="mx-auto flex max-w-4xl justify-end">
					<Button
						onClick={handleContinue}
						loading={submitToolsMutation.isPending}
						disabled={selectedToolIds.size === 0}
					>
						Continue to Environment Variables
					</Button>
				</div>
			</div>
		</div>
	);
}
