"use client";

import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import {
	CheckCircle2Icon,
	CircleDotIcon,
	ClockIcon,
	ExternalLinkIcon,
	MoreVerticalIcon,
	ServerIcon,
	Trash2Icon,
	WrenchIcon,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { toast } from "sonner";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { CenteredSpinner } from "@/components/ui/custom/centered-spinner";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";

interface StatusConfigItem {
	label: string;
	color: string;
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

const setupStatusLabels: Record<string, string> = {
	tools_generating: "Generating Tools",
	tools_selection: "Selecting Tools",
	env_vars_generating: "Generating Env Vars",
	env_vars_setup: "Setting Up Env Vars",
	auth_selection: "Configuring Auth",
	code_generating: "Generating Code",
	code_gen: "Reviewing Code",
	deployment_selection: "Deploying",
	ready: "Ready",
};

export function McpServersGrid(): React.JSX.Element {
	const utils = trpc.useUtils();

	const { data, isPending, error } = trpc.organization.server.list.useQuery();

	const deleteServerMutation = trpc.organization.server.delete.useMutation({
		onSuccess: () => {
			toast.success("Server deleted successfully");
			utils.organization.server.list.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete server");
		},
	});

	const handleDeleteServer = (serverId: string, serverName: string) => {
		NiceModal.show(ConfirmationModal, {
			title: "Delete server?",
			message: `Are you sure you want to delete "${serverName}"? This action cannot be undone and will remove all associated tools and deployments.`,
			confirmLabel: "Delete",
			destructive: true,
			onConfirm: () => deleteServerMutation.mutate({ serverId }),
		});
	};

	if (isPending) {
		return <CenteredSpinner />;
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<p className="text-destructive">Failed to load servers</p>
				<p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
			</div>
		);
	}

	const servers = data?.servers ?? [];

	if (servers.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-12 text-center">
				<ServerIcon className="size-12 text-muted-foreground/50" />
				<h3 className="mt-4 font-semibold text-lg">No MCP servers yet</h3>
				<p className="mt-2 max-w-sm text-sm text-muted-foreground">
					Create your first MCP server to get started with AI-powered tool
					integrations.
				</p>
				<Button asChild className="mt-4">
					<Link href="/dashboard/organization/new-mcp-server">
						Create MCP Server
					</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{servers.map((server) => {
				const status = statusConfig[server.setupStatus] ?? defaultStatus;
				const StatusIcon = status.icon;
				const createdAt = server.createdAt ? new Date(server.createdAt) : null;
				const isValidDate = createdAt && !Number.isNaN(createdAt.getTime());

				return (
					<Card
						key={server.id}
						className="group relative transition-shadow hover:shadow-md"
					>
						<CardHeader className="pb-3">
							<div className="flex items-start justify-between">
								<div className="min-w-0 flex-1">
									<CardTitle className="truncate text-base">
										{server.name}
									</CardTitle>
									{server.description && (
										<CardDescription className="mt-1 line-clamp-2">
											{server.description}
										</CardDescription>
									)}
								</div>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="ghost"
											size="icon"
											className="size-8 shrink-0 opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100"
										>
											<MoreVerticalIcon className="size-4" />
											<span className="sr-only">Open menu</span>
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										{server.mcpEndpoint && (
											<DropdownMenuItem
												onClick={() => {
													navigator.clipboard.writeText(
														window.location.origin + server.mcpEndpoint,
													);
													toast.success("Endpoint URL copied to clipboard");
												}}
											>
												Copy Endpoint URL
											</DropdownMenuItem>
										)}
										{server.mcpEndpoint && <DropdownMenuSeparator />}
										<DropdownMenuItem
											variant="destructive"
											onClick={() => handleDeleteServer(server.id, server.name)}
										>
											<Trash2Icon className="mr-2 size-4" />
											Delete
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						</CardHeader>

						<CardContent className="space-y-3 pb-3">
							<div className="flex flex-wrap gap-2">
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

							<div className="grid grid-cols-2 gap-3 text-sm">
								<div>
									<p className="text-muted-foreground">Tools</p>
									<p className="flex items-center font-medium">
										<WrenchIcon className="mr-1.5 size-3.5 text-muted-foreground" />
										{server.toolsCount}
									</p>
								</div>
								<div>
									<p className="text-muted-foreground">Step</p>
									<p className="font-medium">
										{setupStatusLabels[server.setupStatus] ||
											server.setupStatus}
									</p>
								</div>
							</div>

							{server.mcpEndpoint && (
								<div className="text-sm">
									<p className="text-muted-foreground">Endpoint</p>
									<p
										className="truncate font-mono text-xs"
										title={server.mcpEndpoint}
									>
										{server.mcpEndpoint}
									</p>
								</div>
							)}
						</CardContent>

						<CardFooter className="border-t pt-3">
							<div className="flex w-full items-center justify-between">
								<p className="text-xs text-muted-foreground">
									{isValidDate
										? `Created ${format(createdAt, "MMM d, yyyy")}`
										: "Created date unavailable"}
								</p>
								<div className="flex gap-2">
									{server.setupStatus !== "ready" && (
										<Button variant="default" size="sm" asChild>
											<Link
												href={`/dashboard/organization/new-mcp-server?serverId=${server.id}`}
											>
												Continue Setup
											</Link>
										</Button>
									)}
									<Button variant="outline" size="sm" asChild>
										<Link
											href={`/dashboard/organization/mcp-servers/${server.id}`}
										>
											View Details
										</Link>
									</Button>
								</div>
							</div>
						</CardFooter>
					</Card>
				);
			})}
		</div>
	);
}
