"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button, buttonVariants } from "@/components/ui/button";
import { Copy, Check, ExternalLink, Terminal, Package, Server } from "lucide-react";
import { GitHubIcon } from "@/components/marketing/icons/social-icons";

// ── Python SDK ──────────────────────────────────────────────────────────────

const sdkInstallPip = "pip install mcphero";
const sdkInstallUv = "uv add mcphero";

const sdkCodeExample = `import asyncio
from openai import OpenAI
from mcphero import MCPToolAdapterOpenAI, MCPServerConfig

async def main():
    adapter = MCPToolAdapterOpenAI(
        MCPServerConfig(
            url="https://api.mcphero.app/mcp/your-server",
            headers={"Authorization": "Bearer <your-api-key>"},
        )
    )
    client = OpenAI()

    tools = await adapter.get_tool_definitions()

    messages = [{"role": "user",
                 "content": "Get the weather in London"}]
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
    )

    if response.choices[0].message.tool_calls:
        results = await adapter.process_tool_calls(
            response.choices[0].message.tool_calls
        )
        # Continue conversation with results...

asyncio.run(main())`;

// ── CLI ─────────────────────────────────────────────────────────────────────

const cliInstallBrew = "brew install arterialist/mcpheroctl/mcpheroctl";
const cliInstallUv = "uv tool install mcpheroctl";

const cliCodeExample = `# Authenticate with your MCPHero account
mcpheroctl auth login --token <TOKEN>

# List your deployed MCP servers
mcpheroctl server list

# Create a new server and gather requirements
mcpheroctl wizard create-session
mcpheroctl wizard conversation <SERVER_ID> -m "I need a weather API server"

# Start the wizard after requirements are gathered
mcpheroctl wizard start <SERVER_ID>

# Retrieve an API key for a specific server
mcpheroctl server api-key <SERVER_ID>

# Output any command as JSON for scripting / CI
mcpheroctl server list --json`;

// ── Meta-MCP Server ──────────────────────────────────────────────────────────

const metaMcpUrl = "https://api.mcphero.app/mcp/meta/mcp";

const metaMcpClaudeConfig = `// claude_desktop_config.json
{
  "mcpServers": {
    "mcphero": {
      "url": "https://api.mcphero.app/mcp/meta/mcp"
    }
  }
}
// OAuth is handled automatically by your MCP client`;

const metaMcpCapabilities = [
  "Create MCP servers via AI-guided wizard",
  "Manage tools and environment variables",
  "Generate and deploy server code",
  "Monitor wizard state and server details",
];

// ── Shared helpers ────────────────────────────────────────────────────────────

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 shrink-0 ${className ?? ""}`}
      onClick={copy}
      aria-label={copied ? "Copied!" : "Copy"}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );
}

function InstallCommand({ command }: { command: string }) {
  return (
    <div className="flex items-center gap-2 bg-marketing-bg-subtle border border-marketing-border rounded-lg p-3">
      <code className="text-marketing-fg text-sm flex-1 font-mono">{command}</code>
      <CopyButton text={command} />
    </div>
  );
}

function CodeBlock({ code, className }: { code: string; className?: string }) {
  return (
    <div className={`relative group ${className ?? ""}`}>
      <pre className="bg-marketing-bg-subtle text-marketing-fg text-xs md:text-sm p-4 rounded-lg overflow-x-auto border border-marketing-border font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
      <CopyButton
        text={code}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

export function ForDevelopers() {
  return (
    <section className="bg-marketing-bg-elevated py-24 md:py-32" id="for-developers">
      <div className="container">
        {/* Heading */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl font-bold tracking-tight text-marketing-fg md:text-4xl lg:text-5xl"
          >
            For Developers
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-4 text-lg text-marketing-fg-muted"
          >
            Three ways to integrate MCPHero into your workflow
          </motion.p>
        </div>

        {/* Tabbed cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-3xl"
        >
          <Tabs defaultValue="sdk">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="sdk" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Python SDK</span>
                <span className="sm:hidden">SDK</span>
              </TabsTrigger>
              <TabsTrigger value="cli" className="gap-2">
                <Terminal className="h-4 w-4" />
                CLI
              </TabsTrigger>
              <TabsTrigger value="meta-mcp" className="gap-2">
                <Server className="h-4 w-4" />
                <span className="hidden sm:inline">Meta-MCP Server</span>
                <span className="sm:hidden">MCP</span>
              </TabsTrigger>
            </TabsList>

            {/* ── Python SDK tab ─────────────────────────────────────────── */}
            <TabsContent value="sdk">
              <Card className="border-marketing-border bg-marketing-bg overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-marketing-accent text-marketing-accent-fg font-bold text-xl">
                      M
                    </div>
                    <div>
                      <CardTitle className="text-marketing-fg text-xl">mcphero</CardTitle>
                      <CardDescription className="text-marketing-fg-muted">
                        Use MCP server tools natively with OpenAI, Gemini, or any LLM
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">Install with pip</h4>
                    <InstallCommand command={sdkInstallPip} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">Or with uv (recommended)</h4>
                    <InstallCommand command={sdkInstallUv} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">Quick start</h4>
                    <CodeBlock code={sdkCodeExample} />
                  </div>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <Link href="/docs" className={buttonVariants({ variant: "link" })}>
                      View Full Documentation
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                    <Link
                      href="https://github.com/stepacool/mcphero"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "link" })}
                    >
                      <GitHubIcon className="mr-1 h-4 w-4" />
                      GitHub
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── CLI tab ────────────────────────────────────────────────── */}
            <TabsContent value="cli">
              <Card className="border-marketing-border bg-marketing-bg overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-marketing-accent text-marketing-accent-fg font-bold text-xl">
                      <Terminal className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-marketing-fg text-xl">mcpheroctl</CardTitle>
                      <CardDescription className="text-marketing-fg-muted">
                        Create, manage, and deploy MCP servers from your terminal
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">Install with Homebrew</h4>
                    <InstallCommand command={cliInstallBrew} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">Or with uv</h4>
                    <InstallCommand command={cliInstallUv} />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">Common commands</h4>
                    <CodeBlock code={cliCodeExample} />
                  </div>
                  <p className="text-xs text-marketing-fg-muted">
                    Every command supports <code className="font-mono">--json</code> output for scripting and CI pipelines.
                  </p>
                  <div className="flex items-center justify-center gap-4 pt-2">
                    <Link href="/docs/cli" className={buttonVariants({ variant: "link" })}>
                      CLI Reference
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                    <Link
                      href="https://github.com/arterialist/mcphero-cli"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({ variant: "link" })}
                    >
                      <GitHubIcon className="mr-1 h-4 w-4" />
                      GitHub
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Meta-MCP Server tab ────────────────────────────────────── */}
            <TabsContent value="meta-mcp">
              <Card className="border-marketing-border bg-marketing-bg overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-marketing-accent text-marketing-accent-fg font-bold text-xl">
                      <Server className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-marketing-fg text-xl">Meta-MCP Server</CardTitle>
                      <CardDescription className="text-marketing-fg-muted">
                        Manage MCPHero directly from Claude, Cursor, or any MCP-compatible client
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* URL */}
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">Server URL</h4>
                    <InstallCommand command={metaMcpUrl} />
                  </div>

                  {/* Capabilities */}
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">What it exposes</h4>
                    <ul className="space-y-2">
                      {metaMcpCapabilities.map((cap) => (
                        <li key={cap} className="flex items-start gap-2 text-sm text-marketing-fg-muted">
                          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-marketing-accent/20 flex items-center justify-center">
                            <span className="h-1.5 w-1.5 rounded-full bg-marketing-accent" />
                          </span>
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Claude Desktop config */}
                  <div>
                    <h4 className="text-sm font-medium text-marketing-fg mb-3">
                      Add to Claude Desktop
                    </h4>
                    <CodeBlock code={metaMcpClaudeConfig} />
                  </div>

                  <p className="text-xs text-marketing-fg-muted">
                    The meta-MCP server exposes the same capabilities as{" "}
                    <code className="font-mono">mcpheroctl</code> — no terminal required.
                  </p>

                  <div className="flex items-center justify-center gap-4 pt-2">
                    <Link href="/docs/meta-mcp" className={buttonVariants({ variant: "link" })}>
                      Meta-MCP Docs
                      <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
