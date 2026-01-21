"use client";

import { CheckIcon, CopyIcon, KeyIcon, WrenchIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { WizardTool } from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

interface AuthStepProps {
	serverId: string;
	selectedToolIds: string[];
	suggestedTools: WizardTool[];
	onAuthConfigured: (bearerToken: string) => void;
}

export function AuthStep({
	serverId,
	selectedToolIds,
	suggestedTools,
	onAuthConfigured,
}: AuthStepProps) {
	const [generatedToken, setGeneratedToken] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const configureAuthMutation =
		trpc.organization.wizard.configureAuth.useMutation();

	// Get selected tools by matching IDs
	const selectedTools = suggestedTools.filter((tool) =>
		selectedToolIds.includes(tool.id),
	);

	const handleGenerateToken = async () => {
		try {
			const result = await configureAuthMutation.mutateAsync({
				serverId,
			});
			setGeneratedToken(result.bearerToken);
			toast.success("API key generated successfully");
		} catch (_error) {
			toast.error("Failed to generate API key");
		}
	};

	const handleCopyToken = async () => {
		if (!generatedToken) return;

		try {
			await navigator.clipboard.writeText(generatedToken);
			setCopied(true);
			toast.success("API key copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch (_error) {
			toast.error("Failed to copy to clipboard");
		}
	};

	const handleContinue = () => {
		if (!generatedToken) {
			toast.error("Please generate an API key first");
			return;
		}
		onAuthConfigured(generatedToken);
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-3xl space-y-6">
					{/* Header */}
					<div className="text-center">
						<h2 className="font-semibold text-2xl">Generate API Key</h2>
						<p className="mt-2 text-muted-foreground">
							Create an API key to secure access to your MCP server.
						</p>
					</div>

					{/* Selected Tools Summary */}
					<Card className="bg-muted/50">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Selected Tools
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{selectedTools.map((tool) => (
									<span
										key={tool.id}
										className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary text-sm"
									>
										<WrenchIcon className="size-3" />
										{tool.name}
									</span>
								))}
							</div>
						</CardContent>
					</Card>

					{/* API Key Generation */}
					<Card>
						<CardHeader>
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
									<KeyIcon className="size-5 text-primary" />
								</div>
								<div>
									<CardTitle className="text-lg">
										API Key Authentication
									</CardTitle>
									<CardDescription>
										Your MCP server will be secured with an API key
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							{!generatedToken ? (
								<div className="space-y-4">
									<p className="text-sm text-muted-foreground">
										Click the button below to generate a secure API key. This
										key will be used to authenticate requests to your MCP
										server.
									</p>
									<Button
										onClick={handleGenerateToken}
										loading={configureAuthMutation.isPending}
									>
										<KeyIcon className="size-4" />
										Generate API Key
									</Button>
								</div>
							) : (
								<div className="space-y-4">
									<div className="rounded-lg border bg-muted/50 p-4">
										<div className="mb-2 flex items-center justify-between">
											<span className="text-sm font-medium text-muted-foreground">
												Your API Key
											</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={handleCopyToken}
												className="h-8 px-2"
											>
												{copied ? (
													<CheckIcon className="size-4 text-green-500" />
												) : (
													<CopyIcon className="size-4" />
												)}
												<span className="ml-1">
													{copied ? "Copied" : "Copy"}
												</span>
											</Button>
										</div>
										<code className="block break-all rounded bg-background p-3 font-mono text-sm">
											{generatedToken}
										</code>
									</div>
									<div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-900 dark:bg-yellow-950">
										<p className="text-sm text-yellow-800 dark:text-yellow-200">
											<strong>Important:</strong> Save this API key now. You
											won't be able to see it again after leaving this page.
										</p>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Footer */}
			<div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
				<div className="mx-auto flex max-w-3xl justify-end">
					<Button onClick={handleContinue} disabled={!generatedToken}>
						Continue to Deploy
					</Button>
				</div>
			</div>
		</div>
	);
}
