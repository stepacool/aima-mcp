"use client";

import NiceModal from "@ebay/nice-modal-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/trpc/client";
import { ApiKeyList } from "./api-key-list";
import { CopyCreatedApiKeyModal } from "./copy-created-api-key-modal";
import { CreateApiKeyModal } from "./create-api-key-modal";

export function ApiKeysCard(): React.JSX.Element {
	const utils = trpc.useUtils();
	const { data: apiKeys = [], isLoading } =
		trpc.organization.apiKey.list.useQuery();

	const handleShowCreateApiKeyModal = async (): Promise<void> => {
		const apiKey = (await NiceModal.show(CreateApiKeyModal)) as
			| string
			| undefined;
		if (apiKey) {
			await NiceModal.show(CopyCreatedApiKeyModal, { apiKey });
			utils.organization.apiKey.list.invalidate();
		}
	};

	return (
		<Card className="flex h-full flex-col gap-0 pt-0">
			<CardContent className="max-h-72 flex-1 overflow-hidden p-0">
				{isLoading ? (
					<div className="flex items-center justify-center p-6">
						<div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
					</div>
				) : apiKeys.length > 0 ? (
					<ScrollArea className="h-full">
						<ApiKeyList apiKeys={apiKeys} />
					</ScrollArea>
				) : (
					<p className="p-6 text-sm text-muted-foreground">
						No API key found.
					</p>
				)}
			</CardContent>
			<Separator />
			<CardFooter className="flex w-full justify-end pt-6">
				<Button
					type="button"
					variant="default"
					size="default"
					onClick={handleShowCreateApiKeyModal}
				>
					Create API key
				</Button>
			</CardFooter>
		</Card>
	);
}
