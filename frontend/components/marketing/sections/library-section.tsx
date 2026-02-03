"use client";

import { CheckIcon, CopyIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function LibrarySection() {
    const [copied, setCopied] = useState(false);
    const installCommand = "pip install mcphero";

    const copyToClipboard = () => {
        navigator.clipboard.writeText(installCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section id="library" className="py-24 scroll-mt-14 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
                    {/* Content */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="text-sm font-semibold text-marketing-accent">
                                For Developers
                            </div>
                            <h2
                                className={cn(
                                    "text-pretty font-display text-4xl leading-tight tracking-tight",
                                    "text-marketing-fg",
                                    "sm:text-5xl",
                                )}
                            >
                                Connect it to your code
                            </h2>
                            <p className="text-lg leading-8 text-marketing-fg-muted">
                                Using OpenAI or Gemini? Our native Python library bridges MCP servers
                                directly to your favorite AI models. Get native tool-calling, automatic
                                schema mapping, and seamless execution with just a few lines of code.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div
                                    onClick={copyToClipboard}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all",
                                        "bg-marketing-card border-marketing-card-hover hover:bg-marketing-card-hover",
                                    )}
                                >
                                    <code className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                                        {installCommand}
                                    </code>
                                    <button className="text-marketing-fg-muted hover:text-marketing-fg transition-colors">
                                        {copied ? (
                                            <CheckIcon className="size-4 text-emerald-500" />
                                        ) : (
                                            <CopyIcon className="size-4" />
                                        )}
                                    </button>
                                </div>

                                <Link
                                    href="https://pypi.org/project/mcphero/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-medium text-marketing-fg-muted hover:text-marketing-fg transition-colors inline-flex items-center gap-1"
                                >
                                    View on PyPI
                                    <ChevronRightIcon className="size-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 blur-2xl opacity-30 dark:opacity-50" />
                        <div className="relative rounded-2xl bg-marketing-card border border-marketing-card-hover shadow-2xl overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-marketing-card-hover bg-marketing-card-hover/50">
                                <div className="flex gap-1.5">
                                    <div className="size-3 rounded-full bg-red-400/20 border border-red-400/40" />
                                    <div className="size-3 rounded-full bg-amber-400/20 border border-amber-400/40" />
                                    <div className="size-3 rounded-full bg-emerald-400/20 border border-emerald-400/40" />
                                </div>
                                <div className="text-xs font-mono text-marketing-fg-muted uppercase tracking-widest">
                                    Python
                                </div>
                            </div>
                            <div className="p-6 overflow-x-auto">
                                <pre className="text-sm font-mono leading-relaxed text-marketing-fg">
                                    <span className="text-purple-600 dark:text-purple-400 font-bold">from</span> mcphero <span className="text-purple-600 dark:text-purple-400 font-bold">import</span> MCPToolAdapterOpenAI{"\n"}
                                    {"\n"}
                                    <span className="text-marketing-fg-muted"># Create adapter for your MCP server</span>{"\n"}
                                    adapter = MCPToolAdapterOpenAI(
                                    <span className="text-emerald-600 dark:text-emerald-300">"https://api.mcphero.app/mcp/my-server"</span>
                                    ){"\n"}
                                    {"\n"}
                                    <span className="text-marketing-fg-muted"># Fetch tools directly into OpenAI format</span>{"\n"}
                                    tools = <span className="text-blue-600 dark:text-blue-400 font-bold">await</span> adapter.get_tools(){"\n"}
                                    {"\n"}
                                    <span className="text-marketing-fg-muted"># Use in your chat completion</span>{"\n"}
                                    response = <span className="text-blue-600 dark:text-blue-400 font-bold">await</span> client.chat.completions.create(
                                    model=<span className="text-emerald-600 dark:text-emerald-300">"gpt-4o"</span>,
                                    messages=messages,
                                    tools=tools
                                    )
                                </pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
