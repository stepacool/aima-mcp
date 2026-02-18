import type { Metadata } from "next";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { UseCases } from "@/components/landing/use-cases";
import { ForDevelopers } from "@/components/landing/for-developers";
import { Comparison } from "@/components/landing/comparison";
import { Trust } from "@/components/landing/trust";
import { appConfig } from "@/config/app.config";

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

/**
 * LCP Optimization Guidelines
 *
 * When adding hero images or other above-the-fold visual content:
 * - Use next/image component with the priority prop for the LCP element
 * - Example: <Image src="/hero.png" alt="Hero" priority sizes="(max-width: 768px) 100vw, 50vw" />
 * - The priority prop preloads the image, improving LCP score
 * - Use sizes prop to serve appropriately sized images for different viewports
 * - For below-fold images, lazy loading is the default behavior of next/image
 */

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

function ProductJsonLd() {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "Product",
		name: "MCP Hero - Auto MCP Generator",
		description:
			"Build, deploy, and manage MCP servers with AI. No code required. Connect any database, API, or tool to AI assistants.",
		brand: {
			"@type": "Brand",
			name: appConfig.appName,
		},
		manufacturer: {
			"@type": "Organization",
			name: "AIMALabs",
			url: appConfig.baseUrl,
		},
		category: "Software > Developer Tools > AI Integration",
		offers: [
			{
				"@type": "Offer",
				name: "Free Plan",
				description: "Free tier: 1 server, 3 tools, community support",
				price: "0",
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
				url: `${appConfig.baseUrl}/pricing`,
			},
			{
				"@type": "Offer",
				name: "Pro Plan",
				description:
					"Dedicated VPS, unlimited tools, 5 MCP servers, ephemeral env vars, priority support",
				price: "59",
				priceCurrency: "USD",
				availability: "https://schema.org/InStock",
				url: `${appConfig.baseUrl}/pricing`,
			},
		],
		aggregateRating: {
			"@type": "AggregateRating",
			ratingValue: "4.9",
			reviewCount: "127",
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
	return (
		<>
			<OrganizationJsonLd />
			<WebSiteJsonLd />
			<ProductJsonLd />
			<Hero />
			<HowItWorks />
			<UseCases />
			<ForDevelopers />
			<Comparison />
			<Trust />
		</>
	);
}
