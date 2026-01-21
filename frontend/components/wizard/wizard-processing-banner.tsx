"use client";

import { AlertCircle, Loader2, RefreshCw, ServerIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface WizardProcessingBannerProps {
	serverId: string;
	isProcessing: boolean;
	hasFailed?: boolean;
	processingError?: string | null;
	onRetry?: () => void;
}

/**
 * Non-blocking banner that shows during async wizard processing.
 * Displays at the top of the wizard page without blocking the UI.
 * Shows error state with retry option when processing fails.
 */
export function WizardProcessingBanner({
	serverId,
	isProcessing,
	hasFailed = false,
	processingError,
	onRetry,
}: WizardProcessingBannerProps) {
	// Show error state when processing has failed
	if (hasFailed) {
		return (
			<Alert className="mx-4 mt-4 border-destructive/50 bg-destructive/10">
				<div className="flex items-center gap-2">
					<AlertCircle className="h-4 w-4 text-destructive" />
				</div>
				<AlertTitle className="text-destructive">Generation failed</AlertTitle>
				<AlertDescription className="text-destructive/80">
					{processingError ||
						"An error occurred while generating your MCP server tools."}
					<span className="block text-xs text-destructive/60 mt-1">
						Server ID: {serverId}
					</span>
				</AlertDescription>
				{onRetry && (
					<Button
						variant="outline"
						size="sm"
						className="mt-3 border-destructive/50 text-destructive hover:bg-destructive/10"
						onClick={onRetry}
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Retry
					</Button>
				)}
			</Alert>
		);
	}

	// Show nothing if not processing
	if (!isProcessing) {
		return null;
	}

	// Show processing state
	return (
		<Alert className="mx-4 mt-4 border-amber-500/50 bg-amber-500/10">
			<div className="flex items-center gap-2">
				<ServerIcon className="h-4 w-4 text-amber-500" />
				<Loader2 className="h-4 w-4 animate-spin text-amber-500" />
			</div>
			<AlertTitle className="text-amber-500">
				Processing your request
			</AlertTitle>
			<AlertDescription className="text-amber-500/80">
				Your MCP server is being created. Auto-refreshing every 3 seconds.
				<span className="block text-xs text-amber-500/60 mt-1">
					Server ID: {serverId}
				</span>
			</AlertDescription>
		</Alert>
	);
}
