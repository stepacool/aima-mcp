import type { Metadata } from "next";
import { CtaSection } from "@/components/marketing/sections/cta-section";
import { FaqSection } from "@/components/marketing/sections/faq-section";
import { FeaturesSection } from "@/components/marketing/sections/features-section";
import { HeroSection } from "@/components/marketing/sections/hero-section";
import { LibrarySection } from "@/components/marketing/sections/library-section";
import { LatestArticlesSection } from "@/components/marketing/sections/latest-articles-section";
import { PricingSection } from "@/components/marketing/sections/pricing-section";
import { StatsSection } from "@/components/marketing/sections/stats-section";
import { appConfig } from "@/config/app.config";
import { getAllPosts } from "@/lib/marketing/blog/posts";

export const metadata: Metadata = {
	title: {
		default: "MCP Hero - Ship MCP Servers in Minutes",
		template: "%s | MCP Hero",
	},
	description:
		"Build, deploy, and manage MCP servers with AI in minutes. No code required. Connect any database, API, or tool to ChatGPT, Claude, Cursor, and more.",
	openGraph: {
		title: "MCP Hero - Ship MCP Servers in Minutes",
		description:
			"Build, deploy, and manage MCP servers with AI in minutes. No code required. Connect any database, API, or tool to ChatGPT, Claude, Cursor, and more.",
		type: "website",
		url: appConfig.baseUrl,
	},
	alternates: {
		canonical: appConfig.baseUrl,
	},
};

function OrganizationJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Organization",
		name: appConfig.appName,
		description: appConfig.description,
		url: appConfig.baseUrl,
		logo: `${appConfig.baseUrl}/favicon.svg`,
		contactPoint: {
			"@type": "ContactPoint",
			email: appConfig.contact.email,
			telephone: appConfig.contact.phone,
			contactType: "customer service",
		},
		address: {
			"@type": "PostalAddress",
			streetAddress: appConfig.contact.address,
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

function WebSiteJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "WebSite",
		name: appConfig.appName,
		description: appConfig.description,
		url: appConfig.baseUrl,
		potentialAction: {
			"@type": "SearchAction",
			target: {
				"@type": "EntryPoint",
				urlTemplate: `${appConfig.baseUrl}/blog?q={search_term_string}`,
			},
			"query-input": "required name=search_term_string",
		},
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
		/>
	);
}

export default async function HomePage() {
	const posts = await getAllPosts();

	const faqContent = {
		headline: "Questions & Answers",
		items: [
			{
				question: "What is MCPHero?",
				answer:
					"MCPHero is the ultimate **Auto MCP** and **MCP Generator** platform. You describe what you need in natural language, and our AI builds a production-ready MCP server that connects your databases, APIs (including **MCP from OpenAPI**), and tools to AI clients like ChatGPT, Claude, Cursor, and more.",
			},
			{
				question: "What is an MCP server?",
				answer:
					"MCP (Model Context Protocol) is an open standard that lets AI assistants call external tools and access data sources. An MCP server exposes a set of tools — like querying a database or calling an API — that any MCP-compatible AI client can use. MCPHero makes building and hosting these servers effortless.",
			},
			{
				question: "Do I need to write code to use this Auto MCP tool?",
				answer:
					"No. As a no-code **MCP Generator**, MCPHero uses a guided AI chat flow to understand what you need, propose the right tools, collect any required credentials, and deploy your server automatically. You can go from idea to a live MCP server without writing a single line of code.",
			},
			{
				question: "What AI clients can I connect my MCP server to?",
				answer:
					"MCPHero servers work with any MCP-compatible client, including ChatGPT, Claude, Grok, Gemini, and Cursor. You can also connect programmatically using frameworks like LangChain, PydanticAI, CrewAI, and OpenAI Agents SDK.",
			},
			{
				question: "What's the difference between the Free and Pro plans?",
				answer:
					"The Free plan runs on shared infrastructure with up to 3 tools and limited usage — great for experimenting. The Pro plan gives you dedicated VPS deployment, unlimited tools, up to 5 MCP servers, ephemeral environment variables, and OAuth authentication for production use cases.",
			},
			{
				question: "What are 'ephemeral environment variables'?",
				answer:
					"It's variables you send per-request, meaning we don't store them on our server and you can dynamically send API keys or other credentials in each request for the tool.",
			},
		],
	};

	const ctaContent = {
		headline: "Ready to build the future of AI tools?",
		description:
			"Build, deploy, and manage your MCP servers in minutes. Start for free today.",
		primaryCta: {
			text: "Get Started Free",
			href: "/auth/sign-up",
		},
		secondaryCta: {
			text: "View Documentation",
			href: "/docs",
		},
	};

	return (
		<>
			<OrganizationJsonLd />
			<WebSiteJsonLd />
			<HeroSection />
			<FeaturesSection />
			<LibrarySection />
			<StatsSection />
			<FaqSection content={faqContent} />
			<PricingSection showEnterprisePlans={true} />
			{/*<LatestArticlesSection posts={posts} />*/}
			<CtaSection content={ctaContent} />
		</>
	);
}
