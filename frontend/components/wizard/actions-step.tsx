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
	onToolsSelected: (tools: string[]) => void;
	onRefine: (newTools: WizardTool[]) => void;
}

const MAX_FREE_TOOLS = 3;

export function ActionsStep({
	serverId,
	suggestedTools,
	onToolsSelected,
	onRefine,
}: ActionsStepProps) {
	const [selectedTools, setSelectedTools] = useState<Set<string>>(new Set());
	const [feedback, setFeedback] = useState("");
	const [isRefining, setIsRefining] = useState(false);

	const selectToolsMutation = trpc.organization.wizard.selectTools.useMutation();
	const refineActionsMutation = trpc.organization.wizard.refineActions.useMutation();

	const toggleTool = (toolName: string) => {
		const newSelected = new Set(selectedTools);
		if (newSelected.has(toolName)) {
			newSelected.delete(toolName);
		} else {
			if (newSelected.size >= MAX_FREE_TOOLS) {
				toast.error(`Maximum ${MAX_FREE_TOOLS} tools allowed`, {
					description: "Upgrade to select more tools",
				});
				return;
			}
			newSelected.add(toolName);
		}
		setSelectedTools(newSelected);
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
			});
			onRefine(result.suggestedTools);
			setFeedback("");
			setSelectedTools(new Set());
			toast.success("Tools refined based on your feedback");
		} catch (_error) {
			toast.error("Failed to refine tools");
		} finally {
			setIsRefining(false);
		}
	};

	const handleContinue = async () => {
		if (selectedTools.size === 0) {
			toast.error("Please select at least one tool");
			return;
		}

		try {
			await selectToolsMutation.mutateAsync({
				serverId,
				selectedToolNames: Array.from(selectedTools),
			});
			onToolsSelected(Array.from(selectedTools));
		} catch (_error) {
			toast.error("Failed to select tools");
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
							const isSelected = selectedTools.has(tool.name);
							return (
								<Card
									key={tool.name}
									className={cn(
										"cursor-pointer transition-all hover:shadow-md",
										isSelected && "border-primary ring-2 ring-primary/20"
									)}
									onClick={() => toggleTool(tool.name)}
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
							{selectedTools.size} / {MAX_FREE_TOOLS} tools selected
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
						loading={selectToolsMutation.isPending}
						disabled={selectedTools.size === 0}
					>
						Continue to Authentication
					</Button>
				</div>
			</div>
		</div>
	);
}
