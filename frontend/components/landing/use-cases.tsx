"use client";

import { useState } from "react";
import { motion, type Variants } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface UseCase {
  title: string;
  description: string;
  code: string;
}

const useCases: UseCase[] = [
  {
    title: "AI Tool Adapter",
    description: "Connect any MCP server to OpenAI as native tools",
    code: `import asyncio
from openai import OpenAI
from mcphero import MCPToolAdapterOpenAI

adapter = MCPToolAdapterOpenAI(
    "https://api.mcphero.app/mcp/your-server"
)
client = OpenAI()

tools = await adapter.get_tool_definitions()
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather?"}],
    tools=tools
)`,
  },
  {
    title: "Multi-Server",
    description: "Connect to multiple MCP servers at once",
    code: `from mcphero import MCPToolAdapterOpenAI, MCPServerConfig

adapter = MCPToolAdapterOpenAI([
    MCPServerConfig(
        url="https://api.mcphero.app/mcp/weather",
        name="weather",
    ),
    MCPServerConfig(
        url="https://api.mcphero.app/mcp/calendar",
        name="calendar",
    ),
])

tools = await adapter.get_tool_definitions()
# Tools from both servers merged automatically`,
  },
  {
    title: "Google Gemini",
    description: "Use MCP tools with Gemini AI models",
    code: `import asyncio
from google import genai
from mcphero import MCPToolAdapterGemini

adapter = MCPToolAdapterGemini(
    "https://api.mcphero.app/mcp/your-server"
)
client = genai.Client(api_key="your-api-key")

tool = await adapter.get_tool()
response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="What's on my calendar?",
    config=types.GenerateContentConfig(tools=[tool])
)`,
  },
  {
    title: "Tool Routing",
    description: "Automatic routing between multiple servers",
    code: `from mcphero import MCPToolAdapterOpenAI

adapter = MCPToolAdapterOpenAI([
    MCPServerConfig(url="https://example.com/mcp/db", name="db"),
    MCPServerConfig(url="https://example.com/mcp/api", name="api"),
])

tools = await adapter.get_tool_definitions()
# "search" becomes "db__search" and "api__search"`,
  },
  {
    title: "Custom Headers",
    description: "Pass authentication to your MCP servers",
    code: `from mcphero import MCPToolAdapterOpenAI, MCPServerConfig

adapter = MCPToolAdapterOpenAI(
    MCPServerConfig(
        url="https://api.mcphero.app/mcp/secure",
        headers={
            "Authorization": "Bearer your-token",
        },
    )
)`,
  },
  {
    title: "Error Handling",
    description: "Graceful error handling with automatic retries",
    code: `results = await adapter.process_tool_calls(
    tool_calls,
    return_errors=True  # Returns errors in results
)
# Failed calls return error messages
# that can be sent back to the model`,
  },
];

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="bg-marketing-bg-subtle text-marketing-fg text-xs md:text-sm p-3 rounded-lg overflow-x-auto border border-marketing-border">
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

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

export function UseCases() {
  return (
    <section className="bg-marketing-bg py-24 md:py-32" id="use-cases">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl font-bold tracking-tight text-marketing-fg md:text-4xl lg:text-5xl"
          >
            Use Cases
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-4 text-lg text-marketing-fg-muted"
          >
            See what you can build with MCPHERO
          </motion.p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {useCases.map((useCase, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full transition-all duration-300 hover:border-marketing-border-strong hover:shadow-lg group border-marketing-border bg-marketing-bg-elevated">
                <CardHeader>
                  <CardTitle className="text-marketing-fg">{useCase.title}</CardTitle>
                  <CardDescription className="text-marketing-fg-muted">
                    {useCase.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CodeBlock code={useCase.code} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
