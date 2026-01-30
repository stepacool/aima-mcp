"use client";

import NiceModal, { useModal } from "@ebay/nice-modal-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/trpc/client";

const formSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string().optional(),
});

interface EditMcpServerModalProps {
	serverId: string;
	initialName: string;
	initialDescription?: string;
}

export const EditMcpServerModal = NiceModal.create(
	({ serverId, initialName, initialDescription }: EditMcpServerModalProps) => {
		const modal = useModal();
		const utils = trpc.useUtils();

		const form = useForm<z.infer<typeof formSchema>>({
			resolver: zodResolver(formSchema),
			defaultValues: {
				name: initialName,
				description: initialDescription || "",
			},
		});

		const updateServerMutation = trpc.organization.server.update.useMutation({
			onSuccess: () => {
				toast.success("Server updated successfully");
				utils.organization.server.getDetails.invalidate({ serverId });
				utils.organization.server.list.invalidate();
				modal.hide();
			},
			onError: (error) => {
				toast.error(error.message || "Failed to update server");
			},
		});

		const onSubmit = (values: z.infer<typeof formSchema>) => {
			updateServerMutation.mutate({
				serverId,
				name: values.name,
				description: values.description,
			});
		};

		return (
			<Dialog open={modal.visible} onOpenChange={modal.hide}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Server</DialogTitle>
						<DialogDescription>
							Make changes to your MCP server details here. Click save when
							you&apos;re done.
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="My MCP Server" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Description</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe what this server does..."
												className="resize-none"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<DialogFooter>
								<Button
									type="button"
									variant="outline"
									onClick={modal.hide}
									disabled={updateServerMutation.isPending}
								>
									Cancel
								</Button>
								<Button type="submit" disabled={updateServerMutation.isPending}>
									{updateServerMutation.isPending
										? "Saving..."
										: "Save changes"}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		);
	},
);
