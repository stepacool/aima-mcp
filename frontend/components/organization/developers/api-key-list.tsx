"use client";

import NiceModal from "@ebay/nice-modal-react";
import { format } from "date-fns";
import { MoreHorizontalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditApiKeyModal } from "./edit-api-key-modal";
import { RevokeApiKeyModal } from "./revoke-api-key-modal";

export type ApiKeyDto = {
	id: string;
	description: string;
	lastUsedAt?: Date;
	expiresAt?: Date;
};

export type ApiKeyListProps = {
	apiKeys: ApiKeyDto[];
	className?: string;
};

export function ApiKeyList({
	apiKeys,
	className,
}: ApiKeyListProps): React.JSX.Element {
	return (
		<ul
			role="list"
			className={`m-0 list-none divide-y p-0 ${className ?? ""}`}
		>
			{apiKeys.map((apiKey) => (
				<ApiKeyListItem key={apiKey.id} apiKey={apiKey} />
			))}
		</ul>
	);
}

function ApiKeyListItem({
	apiKey,
	className,
}: {
	apiKey: ApiKeyDto;
	className?: string;
}): React.JSX.Element {
	const handleShowUpdateApiKeyModal = (): void => {
		NiceModal.show(EditApiKeyModal, { apiKey });
	};
	const handleShowRevokeApiKeyModal = (): void => {
		NiceModal.show(RevokeApiKeyModal, { apiKey });
	};
	return (
		<li
			role="listitem"
			className={`flex w-full flex-row justify-between p-6 ${className ?? ""}`}
		>
			<div className="flex flex-col">
				<div className="text-sm font-medium">{apiKey.description}</div>
				<div
					suppressHydrationWarning
					className="text-xs font-normal text-muted-foreground"
				>
					{apiKey.expiresAt
						? `Expires on ${format(apiKey.expiresAt, "dd MMM yyyy")}`
						: "Never expires"}
				</div>
			</div>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						className="size-8 p-0"
						title="Open menu"
					>
						<MoreHorizontalIcon className="size-4 shrink-0" />
						<span className="sr-only">Open menu</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						className="cursor-pointer"
						onClick={handleShowUpdateApiKeyModal}
					>
						Edit
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="cursor-pointer text-destructive focus:text-destructive"
						onClick={handleShowRevokeApiKeyModal}
					>
						Revoke
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</li>
	);
}
