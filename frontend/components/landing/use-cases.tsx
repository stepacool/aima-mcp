"use client";

import { motion, type Variants } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Globe, FileText, Shield } from "lucide-react";

const useCases = [
  {
    title: "Legacy Databases",
    description: "Connect to Oracle, SQL Server, or any legacy database. AI reads schemas automatically—no documentation needed.",
    icon: Database,
  },
  {
    title: "Internal APIs",
    description: "Turn any internal REST or GraphQL API into MCP tools. Works with authentication, custom headers, any response format.",
    icon: Globe,
  },
  {
    title: "Document Search",
    description: "Index PDFs, Word docs, and text files. AI assistants can search and summarize your entire knowledge base.",
    icon: FileText,
  },
  {
    title: "Enterprise Connectors",
    description: "Jira, Confluence, ServiceNow—any enterprise system with an API. Securely connect with OAuth or API keys.",
    icon: Shield,
  },
];

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
    <section id="use-cases" className="bg-marketing-bg py-24 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-marketing-fg md:text-4xl lg:text-5xl">
            MCP Server from Anything
          </h2>
          <p className="mt-4 text-lg text-marketing-fg-muted">
            Connect any data source, API, or system. No API docs required—describe what you need in plain English.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {useCases.map((useCase, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="h-full transition-all duration-300 hover:border-marketing-border-strong hover:shadow-lg group border-marketing-border bg-marketing-bg-elevated">
                <CardHeader className="pb-2">
                  <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-marketing-accent/10 text-marketing-accent w-fit">
                    <useCase.icon className="size-5" />
                  </div>
                  <CardTitle className="text-xl text-marketing-fg">
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {useCase.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
