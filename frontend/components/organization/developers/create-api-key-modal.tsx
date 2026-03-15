"use client";

import NiceModal, { type NiceModalHocProps } from "@ebay/nice-modal-react";
import { addYears, format, isBefore, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { SubmitHandler } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from "@/components/ui/drawer";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useEnhancedModal } from "@/hooks/use-enhanced-modal";
import { useZodForm } from "@/hooks/use-zod-form";
import {
	createApiKeySchema,
	type CreateApiKeySchema,
} from "@/schemas/api-key-schemas";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";

export type CreateApiKeyModalProps = NiceModalHocProps;

export const CreateApiKeyModal = NiceModal.create<CreateApiKeyModalProps>(
	() => {
		const modal = useEnhancedModal();
		const utils = trpc.useUtils();
		const mdUp = useMediaQuery("(min-width: 768px)", { ssr: false });

		const createMutation = trpc.organization.apiKey.create.useMutation({
			onSuccess: async (data) => {
				toast.success("API key added");
				await utils.organization.apiKey.list.invalidate();
				modal.resolve(data.apiKey);
				modal.handleClose();
			},
			onError: (error) => {
				toast.error(error.message || "Couldn't add API key");
			},
		});

		const methods = useZodForm({
			schema: createApiKeySchema,
			defaultValues: {
				description: "",
				neverExpires: true,
				expiresAt: addYears(startOfDay(new Date()), 1),
			},
		});

		const title = "Create API key";
		const description =
			"Create a new API key by filling out the form below.";
		const neverExpires = methods.watch("neverExpires");
		const canSubmit =
			!methods.formState.isSubmitting &&
			(!methods.formState.isSubmitted || methods.formState.isDirty);

		const onSubmit: SubmitHandler<CreateApiKeySchema> = (values) => {
			if (!canSubmit) return;
			createMutation.mutate({
				description: values.description,
				neverExpires: values.neverExpires,
				expiresAt: values.neverExpires ? undefined : values.expiresAt,
			});
		};

		const renderForm = (
			<form
				className={cn("space-y-4", !mdUp && "p-4")}
				onSubmit={methods.handleSubmit(onSubmit)}
			>
				<FormField
					control={methods.control}
					name="description"
					render={({ field }) => (
						<FormItem className="flex w-full flex-col">
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Input
									type="text"
									required
									disabled={createMutation.isPending}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="flex flex-col gap-1.5">
					<div className="flex flex-row items-center justify-between">
						<FormLabel>Expires on</FormLabel>
						<FormField
							control={methods.control}
							name="neverExpires"
							render={({ field }) => (
								<FormItem>
									<div className="flex flex-row items-center gap-1">
										<FormControl>
											<Switch
												checked={Boolean(field.value)}
												onCheckedChange={field.onChange}
												disabled={createMutation.isPending}
												className="scale-90"
											/>
										</FormControl>
										<FormLabel className="cursor-pointer leading-4">
											Never expires
										</FormLabel>
									</div>
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={methods.control}
						name="expiresAt"
						render={({ field }) => (
							<FormItem className="flex flex-col">
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												type="button"
												variant="outline"
												className={cn(
													"w-full pl-3 text-left font-normal",
													!field.value && "text-muted-foreground",
												)}
												disabled={
													createMutation.isPending || Boolean(neverExpires)
												}
											>
												{field.value ? (
													format(field.value, "d MMM yyyy")
												) : (
													<span>Pick a date</span>
												)}
												<CalendarIcon className="ml-auto size-4 shrink-0 opacity-50" />
											</Button>
										</FormControl>
									</PopoverTrigger>
									<PopoverContent className="w-auto p-0" align="start">
										<Calendar
											mode="single"
											selected={field.value}
											onSelect={field.onChange}
											disabled={(date) =>
												isBefore(startOfDay(date), new Date())
											}
										/>
									</PopoverContent>
								</Popover>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
			</form>
		);

		const renderButtons = (
			<>
				<Button type="button" variant="outline" onClick={modal.handleClose}>
					Cancel
				</Button>
				<Button
					type="button"
					variant="default"
					disabled={!canSubmit}
					loading={createMutation.isPending}
					onClick={methods.handleSubmit(onSubmit)}
				>
					Create
				</Button>
			</>
		);

		return (
			<Form {...methods}>
				{mdUp ? (
					<Dialog open={modal.visible}>
						<DialogContent
							className="max-w-sm"
							onClose={modal.handleClose}
							onAnimationEndCapture={modal.handleAnimationEndCapture}
						>
							<DialogHeader>
								<DialogTitle>{title}</DialogTitle>
								<DialogDescription className="sr-only">
									{description}
								</DialogDescription>
							</DialogHeader>
							{renderForm}
							<DialogFooter>{renderButtons}</DialogFooter>
						</DialogContent>
					</Dialog>
				) : (
					<Drawer open={modal.visible} onOpenChange={modal.handleOpenChange}>
						<DrawerContent>
							<DrawerHeader className="text-left">
								<DrawerTitle>{title}</DrawerTitle>
								<DrawerDescription className="sr-only">
									{description}
								</DrawerDescription>
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
