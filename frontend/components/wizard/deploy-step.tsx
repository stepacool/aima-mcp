"use client";

import {
	CheckIcon,
	ChevronDownIcon,
	ChevronUpIcon,
	CopyIcon,
	KeyIcon,
	RocketIcon,
	WrenchIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { codeToHtml } from "shiki";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CenteredSpinner } from "@/components/ui/custom/centered-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { WizardTool } from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

type WizardToolWithCode = WizardTool & {
	code?: string;
};

// Cache for highlighted code to avoid re-processing
const highlightCache = new Map<string, string>();

interface HighlightedCodeProps {
	code: string;
	forceVisible?: boolean;
}

function HighlightedCode({ code, forceVisible = false }: HighlightedCodeProps) {
	const [highlightedCode, setHighlightedCode] = useState<string>(
		highlightCache.get(code) || "",
	);
	const [isLoading, setIsLoading] = useState(!highlightCache.has(code));

	useEffect(() => {
		// If already cached, use it immediately
		if (highlightCache.has(code)) {
			setHighlightedCode(highlightCache.get(code)!);
			setIsLoading(false);
			return;
		}

		let isMounted = true;

		async function highlight() {
			try {
				const html = await codeToHtml(code, {
					lang: "python",
					theme: "nord",
				});
				// Cache the result
				highlightCache.set(code, html);
				if (isMounted) {
					setHighlightedCode(html);
					setIsLoading(false);
				}
			} catch (error) {
				console.error("Failed to highlight code:", error);
				if (isMounted) {
					// Fallback to plain text if highlighting fails
					const fallback = `<pre><code>${escapeHtml(code)}</code></pre>`;
					highlightCache.set(code, fallback);
					setHighlightedCode(fallback);
					setIsLoading(false);
				}
			}
		}

		highlight();

		return () => {
			isMounted = false;
		};
	}, [code]);

	if (isLoading && !forceVisible) {
		return (
			<ScrollArea className="h-64 rounded-b-lg bg-muted/50">
				<div className="p-4">
					<pre className="overflow-x-auto whitespace-pre font-mono text-sm">
						<code>{code}</code>
					</pre>
				</div>
			</ScrollArea>
		);
	}

	return (
		<ScrollArea className="h-64 rounded-b-lg bg-muted/50">
			<div
				className="overflow-x-auto p-4 [&_pre]:overflow-x-auto [&_pre]:whitespace-pre [&_pre]:font-mono [&_pre]:text-sm [&_pre]:m-0"
				dangerouslySetInnerHTML={{ __html: highlightedCode }}
			/>
		</ScrollArea>
	);
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}

interface DeployStepProps {
	serverId: string;
	selectedToolIds: string[];
	suggestedTools: WizardTool[];
	toolsWithCode: WizardToolWithCode[];
	bearerToken: string;
	isProcessing: boolean;
	processingError: string | null;
	onServerActivated: (serverUrl: string) => void;
	onRetry?: () => void;
}

export function DeployStep({
	serverId,
	selectedToolIds,
	suggestedTools,
	toolsWithCode,
	bearerToken,
	isProcessing,
	processingError,
	onServerActivated,
	onRetry,
}: DeployStepProps) {
	// All hooks must be called before any early returns
	const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
	const [tokenCopied, setTokenCopied] = useState(false);
	const activateServerMutation =
		trpc.organization.wizard.activate.useMutation();

	// Get selected tools by matching IDs
	const selectedTools = suggestedTools.filter((tool) =>
		selectedToolIds.includes(tool.id),
	);

	// Show loading state when backend is generating code
	if (isProcessing) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
				<CenteredSpinner />
				<div className="max-w-md space-y-2">
					<p className="text-muted-foreground animate-pulse">
						Generating code for your MCP server tools...
					</p>
					<p className="text-sm text-muted-foreground/70">
						This may take a moment. Feel free to navigate away - you can return
						to this page anytime.
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
						<p className="font-medium">Code generation failed</p>
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

	const handleCopyCode = async (code: string, toolName: string) => {
		try {
			await navigator.clipboard.writeText(code);
			toast.success(`Code for ${toolName} copied to clipboard`);
		} catch (_error) {
			toast.error("Failed to copy code");
		}
	};

	const toggleTool = (toolId: string) => {
		setExpandedTools((prev) => {
			const next = new Set(prev);
			if (next.has(toolId)) {
				next.delete(toolId);
			} else {
				next.add(toolId);
			}
			return next;
		});
	};

	const handleDeploy = async () => {
		try {
			const result = await activateServerMutation.mutateAsync({ serverId });
			onServerActivated(result.serverUrl);
			toast.success("Server deployed successfully");
		} catch (_error) {
			toast.error("Failed to deploy server");
		}
	};

	const handleCopyToken = async () => {
		try {
			await navigator.clipboard.writeText(bearerToken);
			setTokenCopied(true);
			toast.success("API key copied to clipboard");
			setTimeout(() => setTokenCopied(false), 2000);
		} catch (_error) {
			toast.error("Failed to copy to clipboard");
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-4xl space-y-6">
					{/* Header */}
					<div className="text-center">
						<h2 className="font-semibold text-2xl">Review & Deploy</h2>
						<p className="mt-2 text-muted-foreground">
							Review your MCP server configuration and deploy when ready.
						</p>
					</div>

					{/* Configuration Summary */}
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-base">
									<WrenchIcon className="size-4" />
									Tools
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex flex-wrap gap-2">
									{selectedTools.map((tool) => (
										<span
											key={tool.id}
											className="rounded-full bg-primary/10 px-3 py-1 text-primary text-sm"
										>
											{tool.name}
										</span>
									))}
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-base">
									<KeyIcon className="size-4" />
									Authentication
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">API Key</span>
									<Button
										variant="ghost"
										size="sm"
										onClick={handleCopyToken}
										className="h-7 px-2"
									>
										{tokenCopied ? (
											<CheckIcon className="size-3 text-green-500" />
										) : (
											<CopyIcon className="size-3" />
										)}
										<span className="ml-1 text-xs">
											{tokenCopied ? "Copied" : "Copy Key"}
										</span>
									</Button>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Generated Code Preview */}
					<Card>
						<CardHeader>
							<div>
								<CardTitle className="text-base">Generated Code</CardTitle>
								<CardDescription>
									Review the generated code for each tool.
								</CardDescription>
							</div>
						</CardHeader>
						<CardContent>
							<div className="space-y-2">
								{toolsWithCode.map((tool: WizardToolWithCode) => {
									const isExpanded = expandedTools.has(tool.id);
									const hasCode = Boolean(tool.code);

									return (
										<Collapsible
											key={tool.id}
											open={isExpanded}
											onOpenChange={() => toggleTool(tool.id)}
										>
											<div className="rounded-lg border">
												<CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/50">
													<span className="font-medium">{tool.name}</span>
													<div className="flex items-center gap-2">
														{hasCode && (
															<span
																role="button"
																tabIndex={0}
																className="inline-flex items-center justify-center rounded-md px-2 h-7 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
																onClick={(e) => {
																	e.stopPropagation();
																	if (tool.code) {
																		handleCopyCode(tool.code, tool.name);
																	}
																}}
																onKeyDown={(e) => {
																	if (e.key === "Enter" || e.key === " ") {
																		e.preventDefault();
																		e.stopPropagation();
																		if (tool.code) {
																			handleCopyCode(tool.code, tool.name);
																		}
																	}
																}}
															>
																<CopyIcon className="size-3" />
															</span>
														)}
														{isExpanded ? (
															<ChevronUpIcon className="size-4" />
														) : (
															<ChevronDownIcon className="size-4" />
														)}
													</div>
												</CollapsibleTrigger>
												{hasCode && (
													<>
														{/* Always render (hidden) to pre-process highlighting even when collapsed */}
														<div className="hidden" aria-hidden="true">
															<HighlightedCode code={tool.code || ""} />
														</div>
														<CollapsibleContent>
															<div className="border-t">
																<HighlightedCode
																	code={tool.code || ""}
																	forceVisible
																/>
															</div>
														</CollapsibleContent>
													</>
												)}
											</div>
										</Collapsible>
									);
								})}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Footer */}
			<div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
				<div className="mx-auto flex max-w-4xl items-center justify-between">
					<p className="text-muted-foreground text-sm">
						Deploying will make your MCP server live and accessible.
					</p>
					<Button
						onClick={handleDeploy}
						loading={activateServerMutation.isPending}
						disabled={toolsWithCode.length === 0}
					>
						<RocketIcon className="size-4" />
						Deploy Server
					</Button>
				</div>
			</div>
		</div>
	);
}
