"use client";

import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import {
	CheckCircle2Icon,
	CircleDotIcon,
	ClipboardCopyIcon,
	ClockIcon,
	ExternalLinkIcon,
	KeyIcon,
	ServerIcon,
	ShieldIcon,
	Trash2Icon,
	WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
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
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
								<CardDescription className="mt-2">
									{server.description}
								</CardDescription>
							)}
						</div>
						<div className="flex gap-2">
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
					<CardContent>
						<div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
							<code className="flex-1 truncate font-mono text-sm">
								{window.location.origin}
								{server.mcpEndpoint}
							</code>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									copyToClipboard(
										window.location.origin + server.mcpEndpoint,
										"Endpoint URL",
									)
								}
							>
								<ClipboardCopyIcon className="mr-2 size-4" />
								Copy
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

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
										{tool.parametersSchema && tool.parametersSchema.length > 0 && (
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
