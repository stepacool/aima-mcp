"use client";

import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import {
	BracesIcon,
	CheckCircle2Icon,
	CheckIcon,
	CircleDotIcon,
	ClipboardCopyIcon,
	ClockIcon,
	CopyIcon,
	DownloadIcon,
	ExternalLinkIcon,
	KeyIcon,
	PencilIcon,
	ServerIcon,
	ShieldIcon,
	Trash2Icon,
	VariableIcon,
	WrenchIcon,
	XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { EditMcpServerModal } from "@/components/organization/edit-mcp-server-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CenteredSpinner } from "@/components/ui/custom/centered-spinner";
import { InputPassword } from "@/components/ui/custom/input-password";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
	createMcpConfig,
	generateClaudeCodeCommand,
	generateCursorDeeplink,
	generateLmStudioDeeplink,
	generateMcpJsonConfig,
	generateRaycastDeeplink,
	generateVSCodeDeeplink,
} from "@/lib/mcp/deeplinks";
import { cn, getFullBackendUrl } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface McpServerDetailProps {
	serverId: string;
}

interface StatusConfigItem {
	label: string;
	color: string;
	icon: React.ComponentType<{ className?: string }>;
}

interface AuthConfigItem {
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}

const defaultStatus: StatusConfigItem = {
	label: "Draft",
	color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
	icon: ClockIcon,
};

// Map setup_status values to display status
const statusConfig: Record<string, StatusConfigItem> = {
	// Tools step
	tools_generating: {
		label: "Generating Tools",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
		icon: CircleDotIcon,
	},
	tools_selection: defaultStatus,
	// Env vars step
	env_vars_generating: {
		label: "Generating Env Vars",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
		icon: CircleDotIcon,
	},
	env_vars_setup: defaultStatus,
	// Auth step
	auth_selection: defaultStatus,
	// Code generation step
	code_generating: {
		label: "Generating Code",
		color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
		icon: CircleDotIcon,
	},
	code_gen: defaultStatus,
	// Deployment step
	deployment_selection: defaultStatus,
	// Ready
	ready: {
		label: "Ready",
		color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
		icon: CheckCircle2Icon,
	},
};

const defaultAuthConfig: AuthConfigItem = {
	label: "No Authentication",
	icon: ShieldIcon,
};

const authTypeLabels: Record<string, AuthConfigItem> = {
	none: defaultAuthConfig,
	api_key: { label: "API Key", icon: KeyIcon },
	oauth: { label: "OAuth 2.0", icon: ShieldIcon },
};

interface EnvVarRowProps {
	envVar: {
		id: string;
		name: string;
		description: string;
		value: string | null;
	};
	serverId: string;
	onUpdate: (varId: string, value: string) => void;
	isUpdating: boolean;
}

function EnvVarRow({ envVar, onUpdate, isUpdating }: EnvVarRowProps) {
	const [isEditing, setIsEditing] = React.useState(false);
	const [editValue, setEditValue] = React.useState(envVar.value ?? "");

	const handleSave = () => {
		onUpdate(envVar.id, editValue);
		setIsEditing(false);
	};

	const handleCancel = () => {
		setEditValue(envVar.value ?? "");
		setIsEditing(false);
	};

	return (
		<div className="py-2">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0 flex-1">
					<p className="font-mono text-sm font-bold">{envVar.name}</p>
					{envVar.description && (
						<p className="mt-0.5 text-xs text-muted-foreground">
							{envVar.description}
						</p>
					)}
				</div>
				{!isEditing && (
					<Button
						variant="ghost"
						size="icon"
						className="shrink-0"
						onClick={() => setIsEditing(true)}
					>
						<PencilIcon className="size-4" />
					</Button>
				)}
			</div>
			<div className="mt-2">
				{isEditing ? (
					<div className="flex items-center gap-2">
						<Input
							value={editValue}
							onChange={(e) => setEditValue(e.target.value)}
							className="flex-1 font-mono text-sm"
							autoFocus
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSave();
								if (e.key === "Escape") handleCancel();
							}}
						/>
						<Button
							variant="ghost"
							size="icon"
							onClick={handleSave}
							disabled={isUpdating}
						>
							<CheckIcon className="size-4" />
						</Button>
						<Button variant="ghost" size="icon" onClick={handleCancel}>
							<XIcon className="size-4" />
						</Button>
					</div>
				) : (
					<div className="flex items-center gap-2">
						<InputPassword
							readOnly
							value={envVar.value ?? ""}
							className="flex-1 font-mono text-sm"
						/>
						<Button
							variant="ghost"
							size="icon"
							className="shrink-0"
							onClick={() => {
								navigator.clipboard.writeText(envVar.value ?? "");
								toast.success(`${envVar.name} copied to clipboard`);
							}}
						>
							<CopyIcon className="size-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}

export function McpServerDetail({
	serverId,
}: McpServerDetailProps): React.JSX.Element {
	const router = useRouter();
	const utils = trpc.useUtils();

	const {
		data: server,
		isPending,
		error,
	} = trpc.organization.server.getDetails.useQuery(
		{ serverId },
		{ enabled: !!serverId },
	);

	const { data: apiKeyData } = trpc.organization.server.getApiKey.useQuery(
		{ serverId },
		{ enabled: !!serverId && !!server && server.authType !== "none" },
	);

	const deleteServerMutation = trpc.organization.server.delete.useMutation({
		onSuccess: () => {
			toast.success("Server deleted successfully");
			utils.organization.server.list.invalidate();
			router.push("/dashboard/organization/mcp-servers");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete server");
		},
	});

	const updateEnvVarMutation =
		trpc.organization.server.updateEnvVar.useMutation({
			onSuccess: () => {
				toast.success("Environment variable updated");
				utils.organization.server.getDetails.invalidate({ serverId });
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update environment variable");
			},
		});

	const handleDeleteServer = () => {
		if (!server) return;
		NiceModal.show(ConfirmationModal, {
			title: "Delete server?",
			message: `Are you sure you want to delete "${server.name}"? This action cannot be undone and will remove all associated tools and deployments.`,
			confirmLabel: "Delete",
			destructive: true,
			onConfirm: () => deleteServerMutation.mutate({ serverId }),
		});
	};

	const copyToClipboard = (text: string, label: string) => {
		navigator.clipboard.writeText(text);
		toast.success(`${label} copied to clipboard`);
	};

	const handleInstallCursor = () => {
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const deeplink = generateCursorDeeplink(server.name, config);
			window.location.href = deeplink;
			toast.success("Opening Cursor to install MCP server...");
		} catch (_error) {
			toast.error("Failed to generate Cursor deeplink");
		}
	};

	const handleInstallLmStudio = () => {
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const deeplink = generateLmStudioDeeplink(server.name, config);
			window.location.href = deeplink;
			toast.success("Opening LM Studio to install MCP server...");
		} catch (_error) {
			toast.error("Failed to generate LM Studio deeplink");
		}
	};

	const handleInstallVSCode = () => {
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const deeplink = generateVSCodeDeeplink(server.name, config);
			window.location.href = deeplink;
			toast.success("Opening VS Code to install MCP server...");
		} catch (_error) {
			toast.error("Failed to generate VS Code deeplink");
		}
	};

	const handleInstallRaycast = () => {
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const deeplink = generateRaycastDeeplink(server.name, config);
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
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const command = generateClaudeCodeCommand(server.name, config);
			await navigator.clipboard.writeText(command);
			toast.success("Claude Code command copied to clipboard");
		} catch (_error) {
			toast.error("Failed to generate Claude Code command");
		}
	};

	const handleCopyWindsurfConfig = async () => {
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const jsonConfig = generateMcpJsonConfig(server.name, config);
			await navigator.clipboard.writeText(jsonConfig);
			toast.success("Windsurf configuration copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy configuration");
		}
	};

	const handleCopyClaudeDesktopConfig = async () => {
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const jsonConfig = generateMcpJsonConfig(server.name, config);
			await navigator.clipboard.writeText(jsonConfig);
			toast.success("Claude Desktop configuration copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy configuration");
		}
	};

	const handleCopyJsonConfig = async () => {
		if (!server?.mcpEndpoint) {
			toast.error("Server endpoint not available");
			return;
		}
		try {
			const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
			const config = createMcpConfig(endpointUrl, apiKeyData?.apiKey ?? null);
			const jsonConfig = generateMcpJsonConfig(server.name, config);
			await navigator.clipboard.writeText(jsonConfig);
			toast.success("MCP configuration copied to clipboard");
		} catch (_error) {
			toast.error("Failed to copy configuration");
		}
	};

	if (isPending) {
		return <CenteredSpinner />;
	}

	if (error || !server) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<ServerIcon className="size-12 text-muted-foreground/50" />
				<h3 className="mt-4 font-semibold text-lg">Server not found</h3>
				<p className="mt-2 text-sm text-muted-foreground">
					{error?.message || "The server you're looking for doesn't exist."}
				</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => router.push("/dashboard/organization/mcp-servers")}
				>
					Back to Servers
				</Button>
			</div>
		);
	}

	const status = statusConfig[server.setupStatus] ?? defaultStatus;
	const StatusIcon = status.icon;
	const authConfig = authTypeLabels[server.authType] ?? defaultAuthConfig;
	const AuthIcon = authConfig.icon;
	const createdAt = server.createdAt ? new Date(server.createdAt) : null;
	const updatedAt = server.updatedAt ? new Date(server.updatedAt) : null;
	const isValidCreatedDate = createdAt && !Number.isNaN(createdAt.getTime());
	const isValidUpdatedDate = updatedAt && !Number.isNaN(updatedAt.getTime());

	return (
		<div className="space-y-6">
			{/* Header Card */}
			<Card>
				<CardHeader>
					<div className="flex items-start justify-between">
						<div>
							<CardTitle className="text-xl">{server.name}</CardTitle>
							{server.description && (
								<div className="mt-2 prose prose-sm dark:prose-invert max-w-none">
									<ReactMarkdown>{server.description}</ReactMarkdown>
								</div>
							)}
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									NiceModal.show(EditMcpServerModal, {
										serverId: server.id,
										initialName: server.name,
										initialDescription: server.description || undefined,
									})
								}
							>
								Edit
							</Button>
							<Badge
								variant="outline"
								className={cn("border-none", status.color)}
							>
								<StatusIcon className="mr-1 size-3" />
								{status.label}
							</Badge>
							{server.isDeployed && (
								<Badge
									variant="outline"
									className="border-none bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
								>
									<ExternalLinkIcon className="mr-1 size-3" />
									Deployed
								</Badge>
							)}
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						<div>
							<p className="text-sm text-muted-foreground">Tier</p>
							<p className="font-medium capitalize">{server.tier}</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Authentication</p>
							<p className="flex items-center font-medium">
								<AuthIcon className="mr-1.5 size-4 text-muted-foreground" />
								{authConfig.label}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Created</p>
							<p className="font-medium">
								{isValidCreatedDate
									? format(createdAt, "MMM d, yyyy 'at' h:mm a")
									: "Date unavailable"}
							</p>
						</div>
						<div>
							<p className="text-sm text-muted-foreground">Last Updated</p>
							<p className="font-medium">
								{isValidUpdatedDate
									? format(updatedAt, "MMM d, yyyy 'at' h:mm a")
									: "Date unavailable"}
							</p>
						</div>
					</div>
					{server.setupStatus !== "ready" && (
						<div className="mt-4 pt-4 border-t">
							<Button asChild className="w-full sm:w-auto">
								<Link
									href={`/dashboard/organization/new-mcp-server?serverId=${server.id}`}
								>
									Continue Setup
								</Link>
							</Button>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Endpoint Card - Only show if deployed */}
			{server.mcpEndpoint && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center text-base">
							<ExternalLinkIcon className="mr-2 size-4" />
							MCP Endpoint
						</CardTitle>
						<CardDescription>
							Use this endpoint to connect your AI client to this MCP server.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
							<code className="flex-1 truncate font-mono text-sm">
								{getFullBackendUrl(server.mcpEndpoint)}
							</code>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									copyToClipboard(
										getFullBackendUrl(server.mcpEndpoint),
										"Endpoint URL",
									)
								}
							>
								<ClipboardCopyIcon className="mr-2 size-4" />
								Copy
							</Button>
						</div>

						{/* One-Click Installation Buttons */}
						<div className="space-y-2">
							<p className="text-sm font-medium">One-Click Installation</p>
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
							{server.authType !== "none" && !apiKeyData?.apiKey && (
								<p className="text-xs text-muted-foreground">
									Note: If your server requires authentication, you may need to
									configure it manually in your MCP client settings.
								</p>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Connection Definition Card - Only show if deployed */}
			{server.mcpEndpoint && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center text-base">
							<BracesIcon className="mr-2 size-4" />
							Connection Definition
						</CardTitle>
						<CardDescription>
							Connection details and JSON configuration for this MCP server.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Connection sub-section */}
						<div className="space-y-3">
							<p className="text-sm font-medium">Connection</p>
							<div className="space-y-2">
								<div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/50 px-3 py-2">
									<div className="min-w-0 flex-1">
										<p className="text-xs text-muted-foreground">Endpoint</p>
										<code className="block truncate font-mono text-sm">
											{getFullBackendUrl(server.mcpEndpoint)}
										</code>
									</div>
									<Button
										variant="ghost"
										size="icon"
										className="shrink-0"
										onClick={() =>
											copyToClipboard(
												getFullBackendUrl(server.mcpEndpoint),
												"Endpoint URL",
											)
										}
									>
										<CopyIcon className="size-4" />
									</Button>
								</div>
								{server.authType !== "none" && (
									<div className="flex items-center justify-between gap-2 rounded-lg border bg-muted/50 px-3 py-2">
										<div className="min-w-0 flex-1">
											<p className="text-xs text-muted-foreground">API Key</p>
											<InputPassword
												readOnly
												value={apiKeyData?.apiKey ?? ""}
												className="mt-1 border-none bg-transparent p-0 shadow-none"
											/>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="shrink-0"
											onClick={() =>
												copyToClipboard(apiKeyData?.apiKey ?? "", "API Key")
											}
										>
											<CopyIcon className="size-4" />
										</Button>
									</div>
								)}
							</div>
						</div>

						<Separator />

						{/* Raw JSON config */}
						<div className="space-y-3">
							<p className="text-sm font-medium">Raw JSON Config</p>
							<div className="relative rounded-lg border bg-muted/50 p-4">
								<Button
									variant="outline"
									size="sm"
									className="absolute top-3 right-3"
									onClick={() => {
										const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
										const config = createMcpConfig(
											endpointUrl,
											apiKeyData?.apiKey ?? null,
										);
										const jsonConfig = generateMcpJsonConfig(
											server.name,
											config,
										);
										copyToClipboard(jsonConfig, "Connection definition");
									}}
								>
									<CopyIcon className="mr-2 size-4" />
									Copy
								</Button>
								<pre className="overflow-x-auto">
									<code className="font-mono text-sm">
										{(() => {
											const endpointUrl = getFullBackendUrl(server.mcpEndpoint);
											const config = createMcpConfig(
												endpointUrl,
												apiKeyData?.apiKey ?? null,
											);
											return generateMcpJsonConfig(server.name, config);
										})()}
									</code>
								</pre>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Environment Variables Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center text-base">
						<VariableIcon className="mr-2 size-4" />
						Environment Variables ({server.environmentVariables.length})
					</CardTitle>
					<CardDescription>
						Environment variables configured for this MCP server.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{server.environmentVariables.length === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							No environment variables configured.
						</p>
					) : (
						<div className="space-y-3">
							{server.environmentVariables.map((envVar, index) => (
								<React.Fragment key={envVar.id}>
									{index > 0 && <Separator />}
									<EnvVarRow
										envVar={envVar}
										serverId={serverId}
										onUpdate={(varId, value) =>
											updateEnvVarMutation.mutate({
												serverId,
												varId,
												value,
											})
										}
										isUpdating={updateEnvVarMutation.isPending}
									/>
								</React.Fragment>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Tools Card */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center text-base">
						<WrenchIcon className="mr-2 size-4" />
						Tools ({server.toolsCount})
					</CardTitle>
					<CardDescription>
						The tools available on this MCP server.
					</CardDescription>
				</CardHeader>
				<CardContent>
					{server.toolsCount === 0 ? (
						<p className="py-4 text-center text-sm text-muted-foreground">
							No tools configured yet.
						</p>
					) : (
						<div className="space-y-3">
							{server.tools.map((tool, index) => (
								<React.Fragment key={tool.id}>
									{index > 0 && <Separator />}
									<div className="py-2">
										<div className="flex items-start justify-between">
											<div>
												<p className="font-medium">{tool.name}</p>
												<p className="mt-1 text-sm text-muted-foreground">
													{tool.description}
												</p>
											</div>
											<div className="flex gap-2">
												{tool.code && tool.code.trim().length > 0 ? (
													<Badge
														variant="outline"
														className="border-none bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
													>
														Code Ready
													</Badge>
												) : (
													<Badge
														variant="outline"
														className="border-none bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
													>
														Pending Code
													</Badge>
												)}
											</div>
										</div>
										{tool.parametersSchema &&
											tool.parametersSchema.length > 0 && (
												<div className="mt-2">
													<p className="text-xs text-muted-foreground">
														Parameters: {tool.parametersSchema.length}
													</p>
												</div>
											)}
									</div>
								</React.Fragment>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Danger Zone */}
			<Card className="border-destructive/50">
				<CardHeader>
					<CardTitle className="text-base text-destructive">
						Danger Zone
					</CardTitle>
					<CardDescription>
						Irreversible actions that will permanently affect this server.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between rounded-lg border border-destructive/30 p-4">
						<div>
							<p className="font-medium">Delete this server</p>
							<p className="text-sm text-muted-foreground">
								Once deleted, this server and all its tools will be permanently
								removed.
							</p>
						</div>
						<Button
							variant="destructive"
							onClick={handleDeleteServer}
							disabled={deleteServerMutation.isPending}
						>
							<Trash2Icon className="mr-2 size-4" />
							Delete Server
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
