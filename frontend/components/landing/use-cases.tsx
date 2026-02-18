"use client";

import { motion, type Variants } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Globe, FileText, Shield, ArrowUpRight } from "lucide-react";

const useCases = [
  {
    title: "Legacy Databases",
    description: "Connect to Oracle, SQL Server, or any legacy database. AI reads schemas automatically—no documentation needed.",
    icon: Database,
    gradient: "from-orange-500 to-red-500",
  },
  {
    title: "Internal APIs",
    description: "Turn any internal REST or GraphQL API into MCP tools. Works with authentication, custom headers, any response format.",
    icon: Globe,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Document Search",
    description: "Index PDFs, Word docs, and text files. AI assistants can search and summarize your entire knowledge base.",
    icon: FileText,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    title: "Enterprise Connectors",
    description: "Jira, Confluence, ServiceNow—any enterprise system with an API. Securely connect with OAuth or API keys.",
    icon: Shield,
    gradient: "from-emerald-500 to-teal-500",
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function UseCases() {
  return (
    <section id="use-cases" className="relative overflow-hidden bg-marketing-bg py-24 md:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[800px] rounded-full bg-[var(--marketing-accent)]/5 blur-[150px]" />
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-4xl font-bold tracking-tight text-marketing-fg md:text-5xl lg:text-6xl">
            MCP Server from <span className="text-[var(--marketing-accent)]">Anything</span>
          </h2>
          <p className="mt-5 text-lg text-marketing-fg-muted md:text-xl max-w-xl mx-auto">
            Connect any data source, API, or system. No API docs required—describe what you need in plain English.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {useCases.map((useCase, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group relative h-full overflow-hidden border-marketing-border/50 bg-marketing-bg-elevated transition-all duration-500 hover:border-[var(--marketing-accent)]/30 hover:shadow-2xl hover:shadow-[var(--marketing-accent)]/10">
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${useCase.gradient} -z-10`} style={{ opacity: 0.05 }} />
                
                <CardHeader className="pb-3">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--marketing-accent)]/10 to-[var(--marketing-accent)]/5 text-[var(--marketing-accent)] transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <useCase.icon className="size-6" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-marketing-fg group-hover:text-[var(--marketing-accent)] transition-colors">
                    {useCase.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">
                    {useCase.description}
                  </CardDescription>
                  
                  <div className="mt-4 flex items-center text-sm font-medium text-[var(--marketing-accent)] opacity-0 transition-all duration-300 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                    Learn more <ArrowUpRight className="ml-1 size-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
