"use client";

import { KeyIcon, LockIcon, ShieldOffIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { WizardAuthType } from "@/schemas/wizard-schemas";
import { trpc } from "@/trpc/client";

interface AuthStepProps {
	serverId: string;
	selectedTools: string[];
	onAuthConfigured: (authType: WizardAuthType) => void;
}

interface AuthOption {
	type: WizardAuthType;
	title: string;
	description: string;
	icon: React.ComponentType<{ className?: string }>;
	recommended?: boolean;
}

const AUTH_OPTIONS: AuthOption[] = [
	{
		type: "none",
		title: "No Authentication",
		description:
			"Anyone can access your MCP server. Good for public APIs or testing.",
		icon: ShieldOffIcon,
	},
	{
		type: "api_key",
		title: "API Key",
		description:
			"Secure your server with an API key. Simple and effective for most use cases.",
		icon: KeyIcon,
		recommended: true,
	},
	{
		type: "oauth",
		title: "OAuth 2.0",
		description:
			"Full OAuth authentication flow. Best for user-specific access and enterprise needs.",
		icon: LockIcon,
	},
];

export function AuthStep({
	serverId,
	selectedTools,
	onAuthConfigured,
}: AuthStepProps) {
	const [selectedAuth, setSelectedAuth] = useState<WizardAuthType | null>(null);

	const configureAuthMutation =
		trpc.organization.wizard.configureAuth.useMutation();

	const handleContinue = async () => {
		if (!selectedAuth) {
			toast.error("Please select an authentication method");
			return;
		}

		try {
			await configureAuthMutation.mutateAsync({
				serverId,
				authType: selectedAuth,
			});
			onAuthConfigured(selectedAuth);
		} catch (_error) {
			toast.error("Failed to configure authentication");
		}
	};

	return (
		<div className="flex h-full flex-col">
			<div className="flex-1 overflow-auto p-6">
				<div className="mx-auto max-w-3xl space-y-6">
					{/* Header */}
					<div className="text-center">
						<h2 className="font-semibold text-2xl">Configure Authentication</h2>
						<p className="mt-2 text-muted-foreground">
							Choose how you want to secure access to your MCP server.
						</p>
					</div>

					{/* Selected Tools Summary */}
					<Card className="bg-muted/50">
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">
								Selected Tools
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{selectedTools.map((tool) => (
									<span
										key={tool}
										className="rounded-full bg-primary/10 px-3 py-1 text-primary text-sm"
									>
										{tool}
									</span>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Auth Options */}
					<div className="space-y-3">
						{AUTH_OPTIONS.map((option) => {
							const isSelected = selectedAuth === option.type;
							const Icon = option.icon;
							return (
								<Card
									key={option.type}
									className={cn(
										"cursor-pointer transition-all hover:shadow-md",
										isSelected && "border-primary ring-2 ring-primary/20"
									)}
									onClick={() => setSelectedAuth(option.type)}
								>
									<CardHeader className="pb-2">
										<div className="flex items-start gap-4">
											<div
												className={cn(
													"flex size-10 items-center justify-center rounded-lg",
													isSelected ? "bg-primary/20" : "bg-muted"
												)}
											>
												<Icon
													className={cn(
														"size-5",
														isSelected ? "text-primary" : "text-muted-foreground"
													)}
												/>
											</div>
											<div className="flex-1">
												<div className="flex items-center gap-2">
													<CardTitle className="text-base">
														{option.title}
													</CardTitle>
													{option.recommended && (
														<span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs font-medium">
															Recommended
														</span>
													)}
												</div>
												<CardDescription className="mt-1">
													{option.description}
												</CardDescription>
											</div>
											<div
												className={cn(
													"flex size-6 items-center justify-center rounded-full border-2 transition-colors",
													isSelected
														? "border-primary bg-primary"
														: "border-muted-foreground/30"
												)}
											>
												{isSelected && (
													<div className="size-2 rounded-full bg-white" />
												)}
											</div>
										</div>
									</CardHeader>
								</Card>
							);
						})}
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="shrink-0 border-t bg-background/80 p-4 backdrop-blur-sm">
				<div className="mx-auto flex max-w-3xl justify-end">
					<Button
						onClick={handleContinue}
						loading={configureAuthMutation.isPending}
						disabled={!selectedAuth}
					>
						Continue to Deploy
					</Button>
				</div>
			</div>
		</div>
	);
}
