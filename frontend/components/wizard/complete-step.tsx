"use client";

import {
	AlertCircleIcon,
	CheckCircleIcon,
	CheckIcon,
	CopyIcon,
	DownloadIcon,
	ExternalLinkIcon,
	EyeIcon,
	EyeOffIcon,
	KeyIcon,
	PlusIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import {
	createMcpConfig,
	generateClaudeCodeCommand,
	generateCursorDeeplink,
	generateLmStudioDeeplink,
	generateMcpJsonConfig,
	generateRaycastDeeplink,
	generateVSCodeDeeplink,
} from "@/lib/mcp/deeplinks";
import type { WizardDeployment } from "@/lib/python-backend/wizard";
import { getFullBackendUrl } from "@/lib/utils";

interface CompleteStepProps {
	serverUrl: string;
	serverName?: string;
	deployment?: WizardDeployment | null;
	bearerToken: string;
}

export function CompleteStep({
	serverUrl,
	serverName,
	deployment,
	bearerToken,
}: CompleteStepProps) {
	const router = useRouter();
	const fullUrl = getFullBackendUrl(serverUrl);
	const displayName = serverName || "MCP Server";
	const [showToken, setShowToken] = useState(false);
	const [tokenCopied, setTokenCopied] = useState(false);

	const handleCopyUrl = async () => {
		try {
			await navigator.clipboard.writeText(fullUrl);
			toast.success("Server URL copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy URL");
		}
	};

	const handleCopyToken = async () => {
		try {
			await navigator.clipboard.writeText(bearerToken);
			setTokenCopied(true);
			toast.success("API key copied to clipboard");
			setTimeout(() => setTokenCopied(false), 2000);
		} catch (_error) {
			toast.error("Failed to copy API key");
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

	const handleInstallCursor = () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const deeplink = generateCursorDeeplink(displayName, config);
			window.location.href = deeplink;
			toast.success("Opening Cursor to install MCP server...");
		} catch (_error) {
			toast.error("Failed to generate Cursor deeplink");
		}
	};

	const handleInstallLmStudio = () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const deeplink = generateLmStudioDeeplink(displayName, config);
			window.location.href = deeplink;
			toast.success("Opening LM Studio to install MCP server...");
		} catch (_error) {
			toast.error("Failed to generate LM Studio deeplink");
		}
	};

	const handleInstallVSCode = () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const deeplink = generateVSCodeDeeplink(displayName, config);
			window.location.href = deeplink;
			toast.success("Opening VS Code to install MCP server...");
		} catch (_error) {
			toast.error("Failed to generate VS Code deeplink");
		}
	};

	const handleInstallRaycast = () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const deeplink = generateRaycastDeeplink(displayName, config);
			window.location.href = deeplink;
			toast.success("Opening Raycast to install MCP server...");
			// Note: Raycast currently only supports stdio transport, not HTTP
			// This may not work until Raycast adds HTTP support
			setTimeout(() => {
				toast.info(
					"Note: Raycast currently only supports stdio transport. HTTP servers may not work yet.",
					{ duration: 5000 },
				);
			}, 1000);
		} catch (_error) {
			toast.error("Failed to generate Raycast deeplink");
		}
	};

	const handleInstallClaudeCode = async () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const command = generateClaudeCodeCommand(displayName, config);
			await navigator.clipboard.writeText(command);
			toast.success("Claude Code command copied to clipboard");
		} catch (_error) {
			toast.error("Failed to generate Claude Code command");
		}
	};

	const handleCopyWindsurfConfig = async () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const jsonConfig = generateMcpJsonConfig(displayName, config);
			await navigator.clipboard.writeText(jsonConfig);
			toast.success("Windsurf configuration copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy configuration");
		}
	};

	const handleCopyClaudeDesktopConfig = async () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const jsonConfig = generateMcpJsonConfig(displayName, config);
			await navigator.clipboard.writeText(jsonConfig);
			toast.success("Claude Desktop configuration copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy configuration");
		}
	};

	const handleCopyJsonConfig = async () => {
		try {
			const config = createMcpConfig(fullUrl, bearerToken);
			const jsonConfig = generateMcpJsonConfig(displayName, config);
			await navigator.clipboard.writeText(jsonConfig);
			toast.success("MCP configuration copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy configuration");
		}
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
					<h2 className="font-semibold text-2xl">Your MCP Server is Ready!</h2>
					<p className="mt-2 text-muted-foreground">
						{serverName
							? `${serverName.slice(0, 50)}... has been deployed and is ready to use.`
							: "Your server has been deployed and is ready to use."}
					</p>
				</div>

				{/* API Key Card */}
				<Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
					<CardHeader className="pb-2">
						<CardTitle className="flex items-center gap-2 text-base">
							<KeyIcon className="size-4" />
							API Key
						</CardTitle>
						<CardDescription>
							Save this key securely. It will not be shown again.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex gap-2">
							<Input
								readOnly
								type={showToken ? "text" : "password"}
								value={bearerToken}
								className="font-mono text-sm"
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={() => setShowToken(!showToken)}
							>
								{showToken ? (
									<EyeOffIcon className="size-4" />
								) : (
									<EyeIcon className="size-4" />
								)}
								<span className="sr-only">
									{showToken ? "Hide" : "Show"} API key
								</span>
							</Button>
							<Button
								variant="outline"
								size="icon"
								onClick={handleCopyToken}
							>
								{tokenCopied ? (
									<CheckIcon className="size-4 text-green-500" />
								) : (
									<CopyIcon className="size-4" />
								)}
								<span className="sr-only">Copy API key</span>
							</Button>
						</div>
						<p className="text-xs text-amber-700 dark:text-amber-400">
							This is the only time you'll see this API key. Make sure to copy and store it securely.
						</p>
					</CardContent>
				</Card>

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

				{/* Quick Start Guide */}
				<Card className="text-left">
					<CardHeader className="pb-2">
						<CardTitle className="text-base">Quick Start</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3 text-sm">
						<p className="text-muted-foreground">
							Connect your MCP server to AI assistants with one click:
						</p>
						<div className="flex flex-col gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={handleInstallCursor}
								className="w-full justify-start"
							>
								<DownloadIcon className="mr-2 size-4" />
								Add to Cursor
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleInstallLmStudio}
								className="w-full justify-start"
							>
								<DownloadIcon className="mr-2 size-4" />
								Add to LM Studio
							</Button>
							{/* <Button
								variant="outline"
								size="sm"
								onClick={handleInstallVSCode}
								className="w-full justify-start"
							>
								<DownloadIcon className="mr-2 size-4" />
								Add to VS Code
							</Button> */}
							<Button
								variant="outline"
								size="sm"
								onClick={handleInstallClaudeCode}
								className="w-full justify-start"
							>
								<CopyIcon className="mr-2 size-4" />
								Add to Claude Code
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleInstallRaycast}
								className="w-full justify-start"
							>
								<DownloadIcon className="mr-2 size-4" />
								Add to Raycast
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopyWindsurfConfig}
								className="w-full justify-start"
							>
								<CopyIcon className="mr-2 size-4" />
								Add to Windsurf
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopyClaudeDesktopConfig}
								className="w-full justify-start"
							>
								<CopyIcon className="mr-2 size-4" />
								Add to Claude Desktop
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={handleCopyJsonConfig}
								className="w-full justify-start"
							>
								<CopyIcon className="mr-2 size-4" />
								Copy Config for Other Tools
							</Button>
						</div>
						<div className="mt-4 pt-4 border-t">
							<p className="text-xs text-muted-foreground">
								For VS Code, Windsurf, Claude Desktop, and other tools, use the
								"Copy Config" button above and paste it into your MCP
								configuration file.
							</p>
						</div>
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
