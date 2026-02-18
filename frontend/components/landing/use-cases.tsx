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
    title: "Database Tools",
    description: "Connect your database to any AI client with native MCP tools",
    code: `from mcphero import MCPServer, DatabaseTool

server = MCPServer()
server.add_tool(DatabaseTool(
    connection="postgresql://user:pass@localhost/db",
    tables=["users", "products"]
))`,
  },
  {
    title: "API Integration",
    description: "Expose REST APIs as MCP tools in minutes",
    code: `from mcphero import MCPServer, RESTEndpoint

server = MCPServer()
server.add_tool(RESTEndpoint(
    url="https://api.github.com",
    endpoints=["/users", "/repos"]
))`,
  },
  {
    title: "Slack Bot",
    description: "Build an AI-powered Slack assistant with MCP",
    code: `from mcphero import MCPServer, SlackTool

server = MCPServer()
server.add_tool(SlackTool(
    bot_token="xoxb-...",
    channels=["#general", "#dev"]
))`,
  },
  {
    title: "GitHub Automation",
    description: "Automate GitHub workflows with AI commands",
    code: `from mcphero import MCPServer, GitHubTool

server = MCPServer()
server.add_tool(GitHubTool(
    token="ghp_...",
    repos=["owner/repo"]
))`,
  },
  {
    title: "Custom LLM Tools",
    description: "Create custom tools for any LLM",
    code: `from mcphero import MCPServer, CustomTool

@server.tool()
def calculate_metrics(data: list) -> dict:
    return {"avg": sum(data) / len(data)}`,
  },
  {
    title: "File Operations",
    description: "AI-powered file management and processing",
    code: `from mcphero import MCPServer, FileTool

server = MCPServer()
server.add_tool(FileTool(
    root_dir="./data",
    operations=["read", "write", "search"]
))`,
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
