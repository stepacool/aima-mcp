import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type * as React from "react";
import { McpServerDetail } from "@/components/organization/mcp-server-detail";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";
import { getOrganizationById, getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Server Details",
};

interface McpServerDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function McpServerDetailPage({
	params,
}: McpServerDetailPageProps): Promise<React.JSX.Element> {
	const { id } = await params;

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
							{
								label: "MCP Servers",
								href: "/dashboard/organization/mcp-servers",
							},
							{ label: "Server Details" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody>
				<div className="p-4 pb-24 sm:px-6 sm:pt-6">
					<McpServerDetail serverId={id} />
				</div>
			</PageBody>
		</Page>
	);
}
