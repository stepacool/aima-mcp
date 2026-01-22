"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils";

const stats = [
	{
		value: "100+",
		description: "MCP integrations built and deployed.",
	},
	{
		value: "Zero",
		description: "Configuration needed - natural language to production.",
	},
];

const values = [
	{
		title: "AI-First Development",
		description: "The future is describing what you want, not how to build it.",
	},
	{
		title: "Zero Configuration",
		description:
			"Complex infrastructure should be invisible. Deploy MCPs with one click.",
	},
	{
		title: "Open Standards",
		description:
			"Built on the Model Context Protocol (MCP) for maximum interoperability.",
	},
	{
		title: "Developer Experience",
		description:
			"From natural language to production-ready MCP servers in minutes.",
	},
];

export function AboutSection() {
	return (
		<main className="isolate overflow-clip">
			{/* Hero Section */}
			<section className="py-16 pt-32 lg:pt-40" id="hero">
				<div className="mx-auto flex max-w-2xl flex-col gap-32 px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
					<div className="flex flex-col gap-32">
						<div className="flex flex-col items-start gap-6">
							<h1
								className={cn(
									"text-balance font-display text-5xl leading-12 tracking-tight",
									"text-marketing-fg",
									"sm:text-[5rem] sm:leading-20",
								)}
							>
								Building the Future of AI Tool Integration
							</h1>
							<div className="flex max-w-3xl flex-col gap-4 text-lg leading-8 text-marketing-fg-muted">
								<p>
									MCP Hero is the fastest way to build and deploy Model Context
									Protocol (MCP) servers. We transform natural language
									descriptions into production-ready MCP servers that connect
									your AI assistants to databases, APIs, spreadsheets, and more.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Stats Section */}
			<section className="py-16" id="stats">
				<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-16 lg:px-10">
					<div className="flex max-w-2xl flex-col gap-6">
						<div className="flex flex-col gap-2">
							<div className="text-sm font-semibold text-marketing-fg-muted">
								Powering AI integrations
							</div>
							<h2
								className={cn(
									"text-pretty font-display text-[2rem] leading-10 tracking-tight",
									"text-marketing-fg",
									"sm:text-5xl sm:leading-14",
								)}
							>
								The platform for MCP developers.
							</h2>
						</div>
						<div className="text-base leading-7 text-marketing-fg-muted text-pretty">
							<p>
								{appConfig.appName} empowers developers to connect AI assistants
								to any tool or data source. From indie hackers to enterprise
								teams, we power the next generation of AI integrations.
							</p>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
						{stats.map((stat) => (
							<div
								key={stat.value}
								className="relative rounded-lg bg-marketing-card p-6"
							>
								<div className="text-3xl font-semibold tracking-tight text-marketing-fg sm:text-4xl">
									{stat.value}
								</div>
								<p className="mt-2 text-sm text-marketing-fg-muted">
									{stat.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Values Section */}
			<section className="py-16" id="values">
				<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:gap-16 lg:px-10">
					<div className="flex max-w-2xl flex-col gap-6">
						<div className="flex flex-col gap-2">
							<h2
								className={cn(
									"text-pretty font-display text-[2rem] leading-10 tracking-tight",
									"text-marketing-fg",
									"sm:text-5xl sm:leading-14",
								)}
							>
								Our Values
							</h2>
						</div>
						<div className="text-base leading-7 text-marketing-fg-muted text-pretty">
							<p>
								The principles that drive our decisions and define our culture.
							</p>
						</div>
					</div>
					<div>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
							{values.map((value) => (
								<div
									key={value.title}
									className="relative rounded-lg bg-marketing-card p-6"
								>
									<p className="font-semibold text-marketing-fg group-hover:text-marketing-accent transition-colors">
										{value.title}
									</p>
									<p className="mt-2 text-sm text-marketing-fg-muted">
										{value.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-16" id="cta">
				<div className="mx-auto flex max-w-2xl flex-col gap-10 px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
					<div className="flex flex-col gap-6">
						<div className="flex max-w-4xl flex-col gap-2">
							<h2
								className={cn(
									"text-pretty font-display text-[2rem] leading-10 tracking-tight",
									"text-marketing-fg",
									"sm:text-5xl sm:leading-14",
								)}
							>
								Ready to build your first MCP server?
							</h2>
						</div>
						<div className="max-w-3xl text-base leading-7 text-marketing-fg-muted text-pretty">
							<p>
								Join developers using {appConfig.appName} to connect their AI
								assistants to the tools they need.
							</p>
						</div>
					</div>
					<div className="flex items-center gap-4">
						<Link
							href="/auth/sign-up"
							className={cn(
								"inline-flex shrink-0 items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-medium",
								"bg-marketing-accent text-white hover:bg-marketing-accent-hover",
								"dark:bg-marketing-accent",
							)}
						>
							Start free trial
						</Link>
						<Link
							href="/contact"
							className={cn(
								"group inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium",
								"text-marketing-fg hover:bg-marketing-card-hover",
								"dark:hover:bg-white/10",
							)}
						>
							Contact us
							<ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
						</Link>
					</div>
				</div>
			</section>
		</main>
	);
}
