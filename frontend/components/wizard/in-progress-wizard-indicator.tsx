"use client";

import { Loader2, ServerIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
	useWizardPolling,
	useWizardSessions,
} from "@/hooks/use-wizard-sessions";
import { cn } from "@/lib/utils";
import { WizardStep } from "@/schemas/wizard-schemas";

interface InProgressWizardIndicatorProps {
	organizationId: string;
}

/**
 * Shows in-progress wizard sessions in the sidebar.
 * Automatically polls for status updates and removes completed sessions.
 * Returns null when there are no in-progress sessions.
 */
export function InProgressWizardIndicator({
	organizationId,
}: InProgressWizardIndicatorProps) {
	const { inProgressWizards, removeWizardSession } =
		useWizardSessions(organizationId);

	if (inProgressWizards.length === 0) {
		return null;
	}

	return (
		<SidebarGroup className="pb-1">
			<SidebarGroupLabel>In Progress</SidebarGroupLabel>
			<SidebarMenu>
				{inProgressWizards.map((wizard) => (
					<WizardSessionItem
						key={wizard.serverId}
						serverId={wizard.serverId}
						onComplete={() => removeWizardSession(wizard.serverId)}
					/>
				))}
			</SidebarMenu>
		</SidebarGroup>
	);
}

/**
 * Individual wizard session item with its own polling.
 * Separated to properly use hooks and manage lifecycle.
 */
function WizardSessionItem({
	serverId,
	onComplete,
}: {
	serverId: string;
	onComplete: () => void;
}) {
	const { wizardState, isProcessing, error } = useWizardPolling(serverId, {
		enabled: true,
	});

	// Remove from list when no longer processing or on error
	useEffect(() => {
		if ((wizardState && !isProcessing) || error) {
			onComplete();
		}
	}, [wizardState, isProcessing, error, onComplete]);

	const step = wizardState?.wizardStep as WizardStep | undefined;

	return (
		<SidebarMenuItem>
			<SidebarMenuButton asChild tooltip="Continue MCP Server creation">
				<Link
					href={`/dashboard/organization/new-mcp-server?serverId=${serverId}`}
					className="relative"
				>
					<div className="relative">
						<ServerIcon
							className={cn(
								"size-4 shrink-0",
								isProcessing ? "text-amber-500" : "text-muted-foreground"
							)}
						/>
						{isProcessing && (
							<Loader2 className="absolute -right-1 -top-1 size-2.5 animate-spin text-amber-500" />
						)}
					</div>
					<span className="flex-1 truncate text-sm">
						{getStepLabel(step)}
					</span>
					<Badge
						variant="outline"
						className={cn(
							"ml-auto shrink-0 text-[10px] px-1.5 py-0",
							isProcessing
								? "border-amber-500/50 text-amber-500"
								: "border-green-500/50 text-green-500"
						)}
					>
						{isProcessing ? "In Progress" : "Ready"}
					</Badge>
				</Link>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

function getStepLabel(step: WizardStep | undefined): string {
	switch (step) {
		case WizardStep.describe:
			return "Generating tools...";
		case WizardStep.actions:
			return "Select tools";
		case WizardStep.auth:
			return "Configure auth";
		case WizardStep.deploy:
			return "Deploy server";
		case WizardStep.complete:
			return "Complete";
		default:
			return "Creating MCP Server...";
	}
}
