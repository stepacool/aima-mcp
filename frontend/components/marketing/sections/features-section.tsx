"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { GradientCard } from "@/components/marketing/primitives/gradient-card";
import { cn } from "@/lib/utils";

interface Feature {
	title: string;
	description: string;
	link: string;
	linkText: string;
	color: "green" | "blue" | "purple" | "brown";
	placement: "bottom-right" | "bottom-left";
	image: {
		light: string;
		dark: string;
		width: number;
		height: number;
	};
}

function FeatureCard({ feature }: { feature: Feature }) {
	return (
		<div className="group relative overflow-hidden rounded-2xl bg-marketing-card transition-all hover:bg-marketing-card-hover hover:shadow-2xl hover:-translate-y-1">
			{/* Screenshot */}
			<div className="relative overflow-hidden p-2">
				<div className="relative overflow-hidden rounded-xl dark:after:absolute dark:after:inset-0 dark:after:rounded-xl dark:after:outline dark:after:outline-1 dark:after:-outline-offset-1 dark:after:outline-white/10 dark:after:content-['']">
					<GradientCard
						color={feature.color}
						placement={feature.placement}
						rounded="xl"
					>
						<img
							src={feature.image.light}
							alt={feature.title}
							width={feature.image.width}
							height={feature.image.height}
							className="dark:hidden w-full h-auto"
						/>
						<img
							src={feature.image.dark}
							alt={feature.title}
							width={feature.image.width}
							height={feature.image.height}
							className="hidden dark:block w-full h-auto"
						/>
					</GradientCard>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-col gap-4 p-8 sm:p-10 lg:p-8">
				<div>
					<h3 className="text-xl font-semibold leading-8 text-marketing-fg">
						{feature.title}
					</h3>
					<div className="mt-3 flex flex-col gap-4 text-base leading-7 text-marketing-fg-muted">
						<p>{feature.description}</p>
					</div>
				</div>
				<Link
					href={feature.link}
					className="group/btn inline-flex items-center gap-2 text-sm font-semibold text-marketing-accent"
				>
					{feature.linkText}
					<ArrowRightIcon className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
				</Link>
			</div>
		</div>
	);
}

export function FeaturesSection() {
	const features: Feature[] = [
		{
			title: "Natural Language to MCP",
			description:
				"Don't waste days reading API docs. Describe what you want in plain English, show cURL examples, OpenAPI spec or table definitions, AI will create an MCP for that.",
			link: "/docs/usage-overview",
			linkText: "Explore AI Generation",
			color: "green",
			placement: "bottom-right",
			image: {
				light: "/marketing/placeholders/placeholder-light.webp",
				dark: "/marketing/placeholders/placeholder-dark.webp",
				width: 600,
				height: 400,
			},
		},
		{
			title: "One-Click VPS Deployment",
			description:
				"Production-ready hosting with zero configuration. We handle the VPS provisioning, SSL, and process management so your tools are always online.",
			link: "/docs/usage-overview",
			linkText: "Learn about hosting",
			color: "blue",
			placement: "bottom-left",
			image: {
				light: "/marketing/placeholders/placeholder-light.webp",
				dark: "/marketing/placeholders/placeholder-dark.webp",
				width: 600,
				height: 400,
			},
		},
		{
			title: "Managed OAuth & Security",
			description:
				"Easily manage secrets and complex auth flows. Our managed OAuth layer simplifies connecting to platforms like Slack, GitHub, and Notion.",
			link: "/docs",
			linkText: "Security overview",
			color: "purple",
			placement: "bottom-right",
			image: {
				light: "/marketing/placeholders/placeholder-light.webp",
				dark: "/marketing/placeholders/placeholder-dark.webp",
				width: 600,
				height: 400,
			},
		},
	];

	return (
		<section id="features" className="py-16 scroll-mt-14">
			<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-16 lg:px-10">
				{/* Header */}
				<div className="flex max-w-2xl flex-col gap-6">
					<div className="flex flex-col gap-2">
						<div className="text-sm font-semibold leading-7 text-marketing-fg-muted">
							Powerful Features
						</div>
						<h2
							className={cn(
								"text-pretty font-display text-4xl leading-tight tracking-tight",
								"text-marketing-fg",
								"sm:text-6xl sm:leading-14",
							)}
						>
							Platform for the Agentic MCP era
						</h2>
					</div>
					<div className="text-base leading-7 text-marketing-fg-muted text-pretty">
						<p>
							MCPHero handles the entire lifecycle — from building your MCP
							server with AI, to deploying and managing it in production.
						</p>
					</div>
				</div>

				{/* Features Grid */}
				<div>
					<div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
						{features.map((feature) => (
							<FeatureCard key={feature.title} feature={feature} />
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
