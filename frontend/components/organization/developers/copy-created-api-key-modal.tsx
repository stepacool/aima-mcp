"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { AlertCircleIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEnhancedModal } from "@/hooks/use-enhanced-modal";

export type CopyCreatedApiKeyModalProps = NiceModalHocProps & {
	apiKey: string;
};

export const CopyCreatedApiKeyModal =
	NiceModal.create<CopyCreatedApiKeyModalProps>(({ apiKey }) => {
		const modal = useEnhancedModal();

		const handleCopy = async (): Promise<void> => {
			if (!apiKey) return;
			try {
				await navigator.clipboard.writeText(apiKey);
				toast.success("Copied!");
			} catch {
				toast.error("Failed to copy");
			}
		};

		return (
			<AlertDialog open={modal.visible}>
				<AlertDialogContent
					className="max-w-sm"
					onClose={modal.handleClose}
					onAnimationEndCapture={modal.handleAnimationEndCapture}
				>
					<AlertDialogHeader>
						<AlertDialogTitle>API key created</AlertDialogTitle>
						<AlertDialogDescription className="sr-only">
							Copy the API key before closing the modal.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex flex-col items-start gap-4">
						<Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
							<AlertCircleIcon className="size-[18px] shrink-0" />
							<AlertDescription className="inline">
								<h3 className="mb-2 font-semibold">
									We&apos;ll show you this key just once
								</h3>
								Please copy your key and store it in a safe place. For security
								reasons we cannot show it again.
							</AlertDescription>
						</Alert>
						<div className="flex w-full flex-col space-y-2">
							<Label>API key</Label>
							<div className="flex gap-2">
								<Input
									readOnly
									type="text"
									value={apiKey}
									className="font-mono text-sm"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									aria-label="Copy API key"
									className="shrink-0"
									onClick={handleCopy}
								>
									<CopyIcon className="size-4 shrink-0" />
								</Button>
							</div>
						</div>
						<p className="text-sm text-muted-foreground">
							Please copy the API key before you close the dialog.
						</p>
					</div>
					<AlertDialogFooter>
						<Button type="button" variant="default" onClick={modal.handleClose}>
							Got it
						</Button>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		);
	});
