"use client";

import {
	CheckCircleIcon,
	CopyIcon,
	ExternalLinkIcon,
	PlusIcon,
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

interface CompleteStepProps {
	serverUrl: string;
	serverName?: string;
}

export function CompleteStep({ serverUrl, serverName }: CompleteStepProps) {
	const router = useRouter();

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(serverUrl);
			toast.success("Server URL copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy URL");
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
					<h2 className="font-semibold text-2xl">
						Your MCP Server is Live!
					</h2>
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
							<Input
								readOnly
								value={serverUrl}
								className="font-mono text-sm"
							/>
							<Button variant="outline" size="icon" onClick={handleCopyUrl}>
								<CopyIcon className="size-4" />
								<span className="sr-only">Copy URL</span>
							</Button>
							<Button
								variant="outline"
								size="icon"
								asChild
							>
								<a href={serverUrl} target="_blank" rel="noopener noreferrer">
									<ExternalLinkIcon className="size-4" />
									<span className="sr-only">Open in new tab</span>
								</a>
							</Button>
						</div>
					</CardContent>
				</Card>

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
