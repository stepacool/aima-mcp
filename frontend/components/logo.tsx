import type * as React from "react";
import { appConfig } from "@/config/app.config";
import { cn } from "@/lib/utils";

export type LogoProps = {
	className?: string;
	withLabel?: boolean;
};

export function Logo({
	withLabel = true,
	className,
}: LogoProps): React.JSX.Element {
	return (
		<span
			className={cn(
				"flex items-center font-semibold text-foreground leading-none",
				className,
			)}
		>
			<div className="flex size-9 items-center justify-center p-1">
				<svg
					width="28"
					height="28"
					viewBox="0 0 100 100"
					xmlns="http://www.w3.org/2000/svg"
				>
					<defs>
						<g id="six_refined">
							<path d="M 50 30 A 20 20 0 1 1 49.9 30 M 50 40 A 10 10 0 1 0 50.1 40" fill="#111111" />
							<path d="M 85.5 22.5 C 70 14, 30 25, 30 50 L 40 50 C 40 35, 65 24, 80 28.5 Z" fill="#111111" />
						</g>
					</defs>
					<rect width="100" height="100" rx="14" ry="14" fill="white" />
					<g transform="translate(50 50) scale(0.78) translate(-50 -50)">
						<use href="#six_refined" />
						<use href="#six_refined" transform="rotate(180 50 50)" />
						<circle cx="50" cy="50" fill="none" r="41" stroke="#F25C05" stroke-width="8" />
					</g>
				</svg>
			</div>
			{withLabel && (
				<span className="ml-2 hidden font-bold text-lg md:block">
					{appConfig.appName}
				</span>
			)}
		</span>
	);
}
