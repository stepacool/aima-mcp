import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { JSX } from "react";
import {
	Page,
	PageBody,
	PageBreadcrumb,
	PageHeader,
	PagePrimaryBar,
} from "@/components/ui/custom/page";
import { McpWizardChat } from "@/components/wizard/mcp-wizard-chat";
import { getOrganizationById, getSession } from "@/lib/auth/server";

export const metadata: Metadata = {
	title: "Create MCP Server",
};

export default async function NewMcpServerPage(): Promise<JSX.Element> {
	const session = await getSession();

	if (!session) {
		redirect("/auth/sign-in");
	}

	const activeOrganizationId = session.session.activeOrganizationId;
	if (!activeOrganizationId) {
		redirect("/dashboard");
	}

	let organization: Awaited<ReturnType<typeof getOrganizationById>> | null =
		null;
	try {
		organization = await getOrganizationById(activeOrganizationId);
	} catch {
		redirect("/dashboard");
	}

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
							{ label: "New MCP Server" },
						]}
					/>
				</PagePrimaryBar>
			</PageHeader>
			<PageBody disableScroll className="overflow-hidden p-0">
				<McpWizardChat organizationId={organization.id} />
			</PageBody>
		</Page>
	);
}
