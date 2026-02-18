"use client";

import { motion, type Variants } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";

interface ComparisonRow {
  feature: string;
  mcphero: boolean | string;
  competitor: boolean | string;
}

interface ComparisonTable {
  title: string;
  subtitle: string;
  rows: ComparisonRow[];
}

const comparisonTables: ComparisonTable[] = [
  {
    title: "vs Self-Hosting",
    subtitle: "Stop managing infrastructure. Start building features.",
    rows: [
      { feature: "Setup Time", mcphero: "Minutes", competitor: "Days" },
      { feature: "No Code Required", mcphero: true, competitor: false },
      { feature: "Auto-scaling", mcphero: true, competitor: "Manual" },
      { feature: "Managed Infrastructure", mcphero: true, competitor: false },
      { feature: "Security & Auth", mcphero: "Built-in OAuth", competitor: "DIY" },
    ],
  },
  {
    title: "vs FastMCP",
    subtitle: "More power. More integrations. Less boilerplate.",
    rows: [
      { feature: "No-Code Builder", mcphero: true, competitor: false },
      { feature: "AI-Powered Generation", mcphero: true, competitor: false },
      { feature: "Hosted Deployment", mcphero: true, competitor: false },
      { feature: "Database Tools", mcphero: "Full + OAuth", competitor: "Limited" },
      { feature: "OAuth Support", mcphero: true, competitor: false },
    ],
  },
  {
    title: "vs Official SDK",
    subtitle: "Ship faster with less code and more features.",
    rows: [
      { feature: "No Code Required", mcphero: true, competitor: false },
      { feature: "Visual Builder", mcphero: true, competitor: false },
      { feature: "One-Click Deploy", mcphero: true, competitor: "CLI" },
      { feature: "Managed Auth", mcphero: "OAuth2", competitor: "Manual" },
      { feature: "Built-in Integrations", mcphero: "50+", competitor: false },
    ],
  },
  {
    title: "vs HasMCP",
    subtitle: "More flexible. More affordable. More powerful.",
    rows: [
      { feature: "AI Code Generation", mcphero: true, competitor: false },
      { feature: "Free Tier", mcphero: "Unlimited", competitor: "250 calls/mo" },
      { feature: "Pro Pricing", mcphero: "$19/seat", competitor: "$24/seat" },
      { feature: "Custom Tools", mcphero: true, competitor: "OpenAPI only" },
      { feature: "Self-Hosted Option", mcphero: true, competitor: true },
    ],
  },
];

function CheckIcon({ className }: { className?: string }) {
  return <Check className={`size-5 text-green-500 ${className}`} />;
}

function CrossIcon({ className }: { className?: string }) {
  return <X className={`size-5 text-red-400 ${className}`} />;
}

function FeatureValue({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckIcon className="mx-auto" />
    ) : (
      <CrossIcon className="mx-auto" />
    );
  }
  return <span className="text-sm font-medium">{value}</span>;
}

const tableVariants: Variants = {
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

export function Comparison() {
  return (
    <section className="bg-marketing-bg py-24 md:py-32" id="comparison">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-3xl font-bold tracking-tight text-marketing-fg md:text-4xl lg:text-5xl"
          >
            Why MCPHERO?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-4 text-lg text-marketing-fg-muted"
          >
            The fastest way to build production-ready MCP servers
          </motion.p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
          {comparisonTables.map((table, tableIndex) => (
            <motion.div
              key={table.title}
              variants={tableVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: tableIndex * 0.1 }}
            >
              <Card className="h-full border-marketing-border bg-marketing-bg-elevated">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl text-marketing-fg">
                    {table.title}
                  </CardTitle>
                  <p className="text-sm text-marketing-fg-muted mt-1">
                    {table.subtitle}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Header row */}
                    <div className="grid grid-cols-3 gap-2 border-b border-marketing-border pb-2 text-sm font-semibold">
                      <span className="text-marketing-fg-muted">Feature</span>
                      <span className="text-center text-marketing-accent">MCPHERO</span>
                      <span className="text-center text-marketing-fg-muted">
                        {table.title.replace("vs ", "")}
                      </span>
                    </div>
                    {/* Data rows */}
                    {table.rows.map((row, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="grid grid-cols-3 gap-2 py-2"
                      >
                        <span className="text-sm text-marketing-fg-muted">
                          {row.feature}
                        </span>
                        <div className="flex items-center justify-center">
                          <FeatureValue value={row.mcphero} />
                        </div>
                        <div className="flex items-center justify-center">
                          <FeatureValue value={row.competitor} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Why MCPHERO Callouts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "5-Minute Setup",
                description: "From sign-up to running MCP server in minutes",
              },
              {
                title: "Zero Maintenance",
                description: "We handle updates, security, and scaling",
              },
              {
                title: "Enterprise Security",
                description: "SOC 2 compliant with built-in auth",
              },
              {
                title: "Expert Support",
                description: "Direct access to the MCPHERO team",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-lg bg-marketing-bg-elevated border border-marketing-border"
              >
                <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-green-500/10">
                  <CheckIcon className="size-5 text-green-500" />
                </div>
                <h3 className="font-semibold text-marketing-fg">{item.title}</h3>
                <p className="mt-1 text-sm text-marketing-fg-muted">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
