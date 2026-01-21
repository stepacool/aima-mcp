import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import type * as React from "react";
import { McpServersGrid } from "@/components/organization/mcp-servers-grid";
import { Button } from "@/components/ui/button";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageContent,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";
import { getOrganizationById, getSession } from "@/lib/auth/server";
import { PlusIcon } from "lucide-react";

export const metadata: Metadata = {
	title: "MCP Servers",
};

export default async function McpServersPage(): Promise<React.JSX.Element> {
	const session = await getSession();
	if (!session?.session.activeOrganizationId) {
		redirect("/dashboard");
	}

	const organization = await getOrganizationById(
		session.session.activeOrganizationId,
	);
	if (!organization) {
		redirect("/dashboard");
	}

	return (
		<Page>
			<PageHeader>
				<PagePrimaryBar>
					<PageBreadcrumb
						segments={[
							{ label: "Home", href: "/dashboard" },
							{ label: organization.name, href: "/dashboard/organization" },
							{ label: "MCP Servers" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<PageContent
					title="MCP Servers"
					action={
						<Button asChild size="sm">
							<Link href="/dashboard/organization/new-mcp-server">
								<PlusIcon className="mr-2 size-4" />
								Create Server
							</Link>
						</Button>
					}
				>
					<McpServersGrid />
				</PageContent>
			</PageBody>
		</Page>
	);
}
