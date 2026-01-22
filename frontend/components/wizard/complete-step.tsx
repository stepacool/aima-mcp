"use client";

import {
	CheckCircleIcon,
	CopyIcon,
	ExternalLinkIcon,
	PlusIcon,
	AlertCircleIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { getFullBackendUrl } from "@/lib/utils";
import type { WizardDeployment } from "@/lib/python-backend/wizard";

interface CompleteStepProps {
	serverUrl: string;
	serverName?: string;
	deployment?: WizardDeployment | null;
}

export function CompleteStep({
	serverUrl,
	serverName,
	deployment,
}: CompleteStepProps) {
	const router = useRouter();
	const fullUrl = getFullBackendUrl(serverUrl);

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			toast.success("Server URL copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy URL");
		}
	};

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return null;
		try {
			return new Date(dateString).toLocaleString();
		} catch {
			return dateString;
		}
	};

	const handleCreateAnother = () => {
		// Navigate to create a new wizard session
		router.push("/dashboard/organization/new-mcp-server?new=true");
	};

	const handleViewServers = () => {
		// Navigate to servers list
		router.push("/dashboard/organization/mcp-servers");
	};

	return (
		<div className="flex h-full flex-col items-center justify-center p-6">
			<div className="w-full max-w-lg space-y-6 text-center">
				{/* Success Icon */}
				<div className="flex justify-center">
					<div className="flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
						<CheckCircleIcon className="size-10 text-green-600 dark:text-green-400" />
					</div>
				</div>

				{/* Success Message */}
				<div>
					<h2 className="font-semibold text-2xl">Your MCP Server is Live!</h2>
					<p className="mt-2 text-muted-foreground">
						{serverName
							? `${serverName} has been deployed and is ready to use.`
							: "Your server has been deployed and is ready to use."}
					</p>
				</div>

				{/* Server URL Card */}
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Server URL</CardTitle>
						<CardDescription>
							Use this URL to connect AI applications to your MCP server.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex gap-2">
							<Input readOnly value={fullUrl} className="font-mono text-sm" />
							<Button variant="outline" size="icon" onClick={handleCopyUrl}>
								<CopyIcon className="size-4" />
								<span className="sr-only">Copy URL</span>
							</Button>
							<Button variant="outline" size="icon" asChild>
								<a href={fullUrl} target="_blank" rel="noopener noreferrer">
									<ExternalLinkIcon className="size-4" />
									<span className="sr-only">Open in new tab</span>
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Deployment Info Card */}
				{deployment && (
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-base">
								Deployment Information
							</CardTitle>
							<CardDescription>
								Details about your server deployment.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{deployment.target && (
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Target:</span>
									<span className="font-medium capitalize">
										{deployment.target}
									</span>
								</div>
							)}
							{deployment.status && (
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Status:</span>
									<span
										className={`font-medium capitalize ${
											deployment.status === "active"
												? "text-green-600 dark:text-green-400"
												: deployment.status === "failed"
													? "text-destructive"
													: "text-muted-foreground"
										}`}
									>
										{deployment.status}
									</span>
								</div>
							)}
							{deployment.deployedAt && (
								<div className="flex items-center justify-between text-sm">
									<span className="text-muted-foreground">Deployed At:</span>
									<span className="font-medium">
										{formatDate(deployment.deployedAt)}
									</span>
								</div>
							)}
							{deployment.errorMessage && (
								<div className="rounded-lg bg-destructive/10 p-3 text-sm">
									<div className="flex items-start gap-2">
										<AlertCircleIcon className="size-4 shrink-0 text-destructive mt-0.5" />
										<div>
											<p className="font-medium text-destructive">
												Deployment Error
											</p>
											<p className="mt-1 text-destructive/80">
												{deployment.errorMessage}
											</p>
										</div>
									</div>
								</div>
							)}
						</CardContent>
					</Card>
				)}

				{/* Quick Start Guide */}
				<Card className="text-left">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Quick Start</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<p className="text-muted-foreground">
							To connect your MCP server to Claude or other AI assistants:
						</p>
						<ol className="list-inside list-decimal space-y-2 text-muted-foreground">
							<li>Copy the server URL above</li>
							<li>Open your AI application's MCP settings</li>
							<li>Add a new MCP server with the URL</li>
							<li>Start using your tools in conversations!</li>
						</ol>
					</CardContent>
				</Card>

				{/* Action Buttons */}
				<div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Button variant="outline" onClick={handleViewServers}>
						View All Servers
					</Button>
					<Button onClick={handleCreateAnother}>
						<PlusIcon className="size-4" />
						Create Another Server
					</Button>
				</div>
			</div>
		</div>
	);
}
