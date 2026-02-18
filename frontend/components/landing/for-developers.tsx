"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Copy, Check, ExternalLink } from "lucide-react";

const installCommand = "pip install mcphero";
const installCommandUv = "uv add mcphero";

const codeExample = `import asyncio
from openai import OpenAI
from mcphero import MCPToolAdapterOpenAI

async def main():
    # Connect to MCP server
    adapter = MCPToolAdapterOpenAI(
        "https://api.mcphero.app/mcp/your-server"
    )
    client = OpenAI()

    # Get tools from MCP server
    tools = await adapter.get_tool_definitions()

    # Use with OpenAI
    messages = [{"role": "user", 
                 "content": "Get the weather in London"}]
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
    )

    # Process tool calls automatically
    if response.choices[0].message.tool_calls:
        results = await adapter.process_tool_calls(
            response.choices[0].message.tool_calls
        )
        # Continue with results...

asyncio.run(main())`;

function CodeBlock({ code, className }: { code: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      <pre className="bg-marketing-bg-subtle text-marketing-fg text-xs md:text-sm p-4 rounded-lg overflow-x-auto border border-marketing-border font-mono">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        onClick={copyToClipboard}
        aria-label={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 bg-marketing-bg-subtle border border-marketing-border rounded-lg p-3">
      <code className="text-marketing-fg text-sm flex-1 font-mono">{command}</code>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={copyToClipboard}
        aria-label={copied ? "Copied!" : "Copy command"}
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

export function ForDevelopers() {
  return (
    <section className="bg-marketing-bg-elevated py-24 md:py-32" id="for-developers">
      <div className="container">
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
            Connect OpenAI, Gemini, and any LLM to MCP servers
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mx-auto max-w-3xl"
        >
          <Card className="border-marketing-border bg-marketing-bg overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-marketing-accent text-marketing-accent-fg font-bold text-xl">
                  M
                </div>
                <div>
                  <CardTitle className="text-marketing-fg text-xl">mcphero</CardTitle>
                  <CardDescription className="text-marketing-fg-muted">
                    Connect any MCP server to OpenAI or Gemini
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Package Info */}
              <div>
                <h4 className="text-sm font-medium text-marketing-fg mb-3">Install with pip</h4>
                <InstallCommand command={installCommand} />
              </div>
              <div>
                <h4 className="text-sm font-medium text-marketing-fg mb-3">Or with uv (recommended)</h4>
                <InstallCommand command={installCommandUv} />
              </div>

              {/* Code Example */}
              <div>
                <h4 className="text-sm font-medium text-marketing-fg mb-3">Quick start</h4>
                <CodeBlock code={codeExample} />
              </div>

              {/* Documentation Link */}
              <div className="flex justify-center pt-2">
                <Link
                  href="/docs"
                  className={buttonVariants({ variant: "link" })}
                >
                  View Full Documentation
                  <ExternalLink className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
