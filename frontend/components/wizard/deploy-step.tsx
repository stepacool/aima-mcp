"use client";

import {
	CheckIcon,
	CodeIcon,
	CopyIcon,
	KeyIcon,
	RocketIcon,
	WrenchIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { WizardTool } from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

interface DeployStepProps {
	serverId: string;
	selectedToolIds: string[];
	suggestedTools: WizardTool[];
	bearerToken: string;
	onServerActivated: (serverUrl: string) => void;
}

export function DeployStep({
	serverId,
	selectedToolIds,
	suggestedTools,
	bearerToken,
	onServerActivated,
}: DeployStepProps) {
	// Get selected tools by matching IDs
	const selectedTools = suggestedTools.filter((tool) =>
		selectedToolIds.includes(tool.id),
	);
	const [generatedCode, setGeneratedCode] = useState<string | null>(null);

	const generateCodeMutation =
		trpc.organization.wizard.generateCode.useMutation();
	const activateServerMutation =
		trpc.organization.wizard.activate.useMutation();

	// Auto-generate code on mount
	useEffect(() => {
		const generateCode = async () => {
			try {
				const result = await generateCodeMutation.mutateAsync({ serverId });
				setGeneratedCode(result.generatedCode);
			} catch (_error) {
				toast.error("Failed to generate code");
			}
		};

		generateCode();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [serverId]);

	const handleCopyCode = async () => {
		if (!generatedCode) return;

		try {
			await navigator.clipboard.writeText(generatedCode);
			toast.success("Code copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy code");
		}
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

	const [tokenCopied, setTokenCopied] = useState(false);

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
							<div className="flex items-center justify-between">
								<div>
									<CardTitle className="text-base">Generated Code</CardTitle>
									<CardDescription>
										This is the code that will power your MCP server.
									</CardDescription>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={handleCopyCode}
									disabled={!generatedCode}
								>
									<CopyIcon className="size-4" />
									Copy
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							{generateCodeMutation.isPending ? (
								<div className="space-y-2">
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-3/4" />
									<Skeleton className="h-4 w-1/2" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
								</div>
							) : generatedCode ? (
								<ScrollArea className="h-64 rounded-lg border bg-muted/50">
									<pre className="p-4 font-mono text-sm">
										<code>{generatedCode}</code>
									</pre>
								</ScrollArea>
							) : (
								<div className="flex h-32 items-center justify-center text-muted-foreground">
									Failed to generate code
								</div>
							)}
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
						disabled={!generatedCode}
					>
						<RocketIcon className="size-4" />
						Deploy Server
					</Button>
				</div>
			</div>
		</div>
	);
}
