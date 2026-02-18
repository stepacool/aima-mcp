"use client";

import { motion, type Variants } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare, Wand2, Settings, Rocket } from "lucide-react";
import Link from "next/link";
import { track } from "@vercel/analytics";

const steps = [
  {
    id: 1,
    title: "Describe",
    description: "Tell us what you need in plain language",
    icon: MessageSquare,
  },
  {
    id: 2,
    title: "Tools",
    description: "We suggest the right tools for your use case",
    icon: Wand2,
  },
  {
    id: 3,
    title: "Configure",
    description: "Connect your APIs, databases, and credentials",
    icon: Settings,
  },
  {
    id: 4,
    title: "Deploy",
    description: "Your MCP server is live in minutes",
    icon: Rocket,
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const item: Variants = {
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

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-marketing-bg py-24 md:py-32"
    >
      <div className="container">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-marketing-fg md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-marketing-fg-muted">
            Build your MCP server in four simple steps
          </p>
        </motion.div>

        {/* Steps Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4"
        >
          {steps.map((step, index) => (
            <motion.div key={step.id} variants={item}>
              <Card className="relative h-full border-marketing-border bg-marketing-card transition-colors hover:bg-marketing-card-hover">
                {/* Step Number Badge */}
                <div className="absolute -left-3 top-6 flex size-8 items-center justify-center rounded-full bg-marketing-accent text-marketing-accent-fg shadow-md">
                  <span className="text-sm font-semibold">{step.id}</span>
                </div>

                <CardHeader className="pt-10">
                  {/* Icon */}
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-marketing-bg-subtle">
                    <step.icon className="size-6 text-marketing-fg" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {step.description}
                  </CardDescription>
                </CardContent>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 z-10 hidden lg:block" style={{ transform: "translateY(-50%)" }}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-marketing-border"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-12 text-center"
        >
          <Button asChild size="lg" className="min-w-[160px]" onClick={() => track("cta_click", { location: "how-it-works", variant: "primary" })}>
            <Link href="/auth/sign-up">Start Building</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
