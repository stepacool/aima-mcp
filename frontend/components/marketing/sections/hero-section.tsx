"use client";

import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { GradientCard } from "@/components/marketing/primitives/gradient-card";
import { cn } from "@/lib/utils";

function HeroScreenshot() {
	return (
		<div className="flex flex-col gap-32">
			{/* Mobile/Tablet Screenshot - visible below lg */}
			<GradientCard
				color="green"
				placement="bottom-right"
				className="lg:hidden"
				rounded="xl"
			>
				<img
					src="/marketing/placeholders/placeholder-hero-light.webp"
					alt="App screenshot"
					width={1328}
					height={727}
					className="dark:hidden w-full h-auto"
				/>
				<img
					src="/marketing/placeholders/placeholder-hero-dark.webp"
					alt="App screenshot"
					width={1328}
					height={727}
					className="hidden dark:block w-full h-auto"
				/>
			</GradientCard>

			{/* Desktop Screenshot - visible at lg and above */}
			<GradientCard
				color="green"
				placement="bottom"
				className="hidden lg:block"
				rounded="2xl"
			>
				<img
					src="/marketing/placeholders/placeholder-hero-light.webp"
					alt="App screenshot"
					width={1328}
					height={727}
					className="dark:hidden w-full h-auto"
				/>
				<img
					src="/marketing/placeholders/placeholder-hero-dark.webp"
					alt="App screenshot"
					width={1328}
					height={727}
					className="hidden dark:block w-full h-auto"
				/>
			</GradientCard>
		</div>
	);
}

export function HeroSection() {
	return (
		<section id="hero" className="py-16 scroll-mt-14">
			<div className="mx-auto flex max-w-2xl flex-col gap-16 px-6 md:max-w-3xl lg:max-w-7xl lg:px-10">
				<div className="flex flex-col gap-32">
					<div className="flex flex-col items-start gap-6">
						{/* Announcement Pill */}
						<Link
							href="/docs"
							className={cn(
								"relative inline-flex max-w-full items-center gap-3 overflow-hidden rounded-md px-3.5 py-2 text-sm",
								"bg-marketing-card",
								"hover:bg-marketing-card-hover",
								"dark:ring-inset dark:ring-1 dark:ring-white/5",
								"sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:px-3 sm:py-0.5",
							)}
						>
							<span className="truncate text-pretty sm:truncate">
								Check our Python Library
							</span>
							<span className="hidden h-3 w-px bg-marketing-card-hover sm:block" />
							<span className="inline-flex shrink-0 items-center gap-1 font-semibold">
								Read the docs
								<ChevronRightIcon className="size-3" />
							</span>
						</Link>

						{/* Headline */}
						<h1
							className={cn(
								"max-w-5xl text-balance font-display text-5xl tracking-display-tight",
								"text-marketing-fg",
								"sm:text-6xl sm:leading-14",
								"lg:text-[5.5rem] lg:leading-20",
							)}
						>
							Build & Deploy MCP Servers with Natural Language
						</h1>

						{/* Description */}
						<div className="flex max-w-3xl flex-col gap-4 text-lg leading-8 text-marketing-fg-muted md:text-xl">
							<p>
								Connect your AI to any API, database, or tool in minutes. No
								code required. Managed hosting, OAuth, and scale included out
								of the box.
							</p>
						</div>

						{/* CTA Buttons */}
						<div className="flex items-center gap-4">
							<Link
								href="/auth/sign-up"
								className={cn(
									"inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-semibold transition-all",
									"bg-marketing-accent text-marketing-accent-fg hover:bg-marketing-accent-hover",
									"hover:shadow-[0_0_20px_rgba(var(--marketing-accent-rgb),0.3)] hover:-translate-y-0.5 active:translate-y-0",
								)}
							>
								Get Started Free
								<ArrowRightIcon className="size-4" />
							</Link>
							<Link
								href="/docs"
								className={cn(
									"group inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-base font-medium transition-all",
									"text-marketing-fg hover:bg-marketing-card-hover",
								)}
							>
								Documentation
								<ChevronRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
							</Link>
						</div>
					</div>

					<HeroScreenshot />
				</div>
			</div>
		</section>
	);
}
