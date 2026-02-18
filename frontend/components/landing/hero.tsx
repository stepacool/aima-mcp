"use client";

import { motion } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Star } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-marketing-bg py-24 md:py-32">
      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-4xl font-bold tracking-tight text-marketing-fg md:text-6xl lg:text-7xl"
          >
            Ship MCP Servers in Minutes, Not Weeks
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="mt-6 text-lg text-marketing-fg-muted md:text-xl"
          >
            Build, deploy, and manage MCP servers with AI. No code required. Connect any database, API, or tool to ChatGPT, Claude, Cursor, and more.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button asChild size="lg" className="min-w-[160px]">
              <Link href="/signup">Start Building</Link>
            </Button>
            <Link
              href="#how-it-works"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
              })}
            >
              How It Works
            </Link>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex items-center justify-center gap-2 text-sm text-marketing-fg-muted"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="size-4 fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span>Trusted by 2,000+ developers</span>
          </motion.div>
        </div>

        {/* Product Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
          className="mt-16"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Gradient background */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-marketing-accent/5 via-transparent to-transparent" />

            {/* Placeholder for product screenshot - actual image would go here */}
            <div className="aspect-[16/9] overflow-hidden rounded-xl border border-marketing-border bg-marketing-bg-elevated shadow-2xl">
              <div className="flex h-full items-center justify-center bg-marketing-bg-subtle">
                <div className="text-center">
                  <p className="text-lg font-medium text-marketing-fg">
                    MCPHERO Dashboard
                  </p>
                  <p className="mt-2 text-sm text-marketing-fg-muted">
                    Product screenshot / demo video placeholder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Background gradient orbs */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="absolute -left-1/4 -top-1/4 size-[600px] rounded-full bg-marketing-accent/5 blur-3xl" />
        <div className="absolute -bottom-1/4 -right-1/4 size-[600px] rounded-full bg-marketing-accent/5 blur-3xl" />
      </div>
    </section>
  );
}
