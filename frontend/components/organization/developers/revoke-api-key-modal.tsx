"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import type { SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEnhancedModal } from "@/hooks/use-enhanced-modal";
import { useZodForm } from "@/hooks/use-zod-form";
import {
	revokeApiKeySchema,
	type RevokeApiKeySchema,
} from "@/schemas/api-key-schemas";
import { trpc } from "@/trpc/client";
import type { ApiKeyDto } from "./api-key-list";

export type RevokeApiKeyModalProps = NiceModalHocProps & {
	apiKey: ApiKeyDto;
};

export const RevokeApiKeyModal = NiceModal.create<RevokeApiKeyModalProps>(
	({ apiKey }) => {
		const modal = useEnhancedModal();
		const utils = trpc.useUtils();
		const mdUp = useMediaQuery("(min-width: 768px)", { ssr: false });

		const revokeMutation = trpc.organization.apiKey.revoke.useMutation({
			onSuccess: () => {
				toast.success("API key revoked");
				utils.organization.apiKey.list.invalidate();
				modal.handleClose();
			},
			onError: (error) => {
				toast.error(error.message || "Couldn't revoke API key");
			},
		});

		const methods = useZodForm({
			schema: revokeApiKeySchema,
			defaultValues: { id: apiKey.id },
		});

		const title = "Revoke this API key?";
		const canSubmit =
			!methods.formState.isSubmitting && methods.formState.isValid;

		const onSubmit: SubmitHandler<RevokeApiKeySchema> = (values) => {
			if (!canSubmit) return;
			revokeMutation.mutate({ id: values.id });
		};

		const renderDescription = (
			<>
				The API key{" "}
				<strong className="font-medium text-foreground">
					{apiKey.description}
				</strong>{" "}
				will be permanently deleted. Are you sure you want to continue?
			</>
		);

		const renderForm = (
			<form className="hidden" onSubmit={methods.handleSubmit(onSubmit)}>
				<input
					type="hidden"
					className="hidden"
					{...methods.register("id")}
				/>
			</form>
		);

		const renderButtons = (
			<>
				<Button type="button" variant="outline" onClick={modal.handleClose}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="destructive"
					disabled={!canSubmit}
					loading={revokeMutation.isPending}
					onClick={methods.handleSubmit(onSubmit)}
				>
					Yes, revoke
				</Button>
			</>
		);

		return (
			<Form {...methods}>
				{mdUp ? (
					<AlertDialog open={modal.visible}>
						<AlertDialogContent
							className="max-w-sm"
							onClose={modal.handleClose}
							onAnimationEndCapture={modal.handleAnimationEndCapture}
						>
							<AlertDialogHeader>
								<AlertDialogTitle>{title}</AlertDialogTitle>
								<AlertDialogDescription>
									{renderDescription}
								</AlertDialogDescription>
							</AlertDialogHeader>
							{renderForm}
							<AlertDialogFooter>{renderButtons}</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				) : (
					<Drawer open={modal.visible} onOpenChange={modal.handleOpenChange}>
						<DrawerContent>
							<DrawerHeader className="text-left">
								<DrawerTitle>{title}</DrawerTitle>
								<DrawerDescription>{renderDescription}</DrawerDescription>
							</DrawerHeader>
							{renderForm}
							<DrawerFooter className="flex-col-reverse pt-4">
								{renderButtons}
							</DrawerFooter>
						</DrawerContent>
					</Drawer>
				)}
			</Form>
		);
	},
);
