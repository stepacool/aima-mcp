"use client";

import { motion } from "motion/react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-marketing-bg py-24 md:py-36 lg:py-44">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-20">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--hero-gradient-start)] via-[var(--marketing-bg)] to-[var(--hero-gradient-end)]" />
        
        {/* Animated orbs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -left-32 -top-32 size-96 rounded-full bg-[var(--marketing-accent)]/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -right-32 top-1/2 size-80 rounded-full bg-[var(--marketing-accent)]/8 blur-[100px]"
        />
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(var(--marketing-fg) 1px, transparent 1px),
                             linear-gradient(90deg, var(--marketing-fg) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--marketing-accent)]/20 bg-[var(--marketing-accent)]/5 px-4 py-1.5 text-sm font-medium text-[var(--marketing-accent)]">
              <Sparkles className="size-4" />
              <span>No API docs required</span>
              <span className="text-[var(--marketing-accent)]/50">•</span>
              <span>Any input works</span>
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl font-bold tracking-tight text-marketing-fg md:text-6xl lg:text-7xl xl:text-8xl"
          >
            Ship MCP Servers in{' '}
            <span className="relative">
              <span className="relative z-10 text-[var(--marketing-accent)]">Minutes</span>
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="absolute -bottom-2 left-0 right-0 h-3 -z-0 bg-[var(--marketing-accent)]/20"
                style={{ transformOrigin: 'left' }}
              />
            </span>
            , Not Weeks
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg text-marketing-fg-muted md:text-xl lg:text-2xl max-w-2xl mx-auto leading-relaxed"
          >
            Connect any database, API, or tool — even without documentation.{' '}
            <span className="text-marketing-fg font-medium">cURL, SQL schema, HTML, or plain English.</span>
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center"
          >
            <Button 
              asChild 
              size="lg" 
              className="min-w-[180px] bg-[var(--marketing-accent)] hover:bg-[var(--marketing-accent-hover)] text-[var(--marketing-accent-fg)] border-0 text-base font-semibold px-8 h-12 shadow-lg shadow-[var(--marketing-accent)]/25 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[var(--marketing-accent)]/30" 
              onClick={() => track("cta_click", { location: "hero", variant: "primary" })}
            >
              <Link href="/auth/sign-up">
                Start Building
                <ArrowRight className="ml-2 size-5 inline-block" />
              </Link>
            </Button>
            <Link
              href="#how-it-works"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
              })}
              onClick={() => track("cta_click", { location: "hero", variant: "secondary" })}
            >
              See How It Works
            </Link>
          </motion.div>

          {/* Social proof pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-marketing-fg-muted"
          >
            <span className="flex items-center gap-2">
              <span className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="size-8 rounded-full border-2 border-[var(--marketing-bg)] bg-gradient-to-br from-[var(--marketing-accent)] to-[var(--marketing-accent-hover)]" />
                ))}
              </span>
              <span>Join 50+ developers</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span>Free tier available</span>
            <span className="hidden sm:inline">•</span>
            <span>Setup in 2 minutes</span>
          </motion.div>
        </div>

        {/* Product Visual */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          className="mt-20"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Glow effect behind */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[var(--marketing-accent)]/20 via-transparent to-transparent blur-3xl" />
            
            {/* Main card */}
            <div className="relative overflow-hidden rounded-2xl border border-marketing-border/50 bg-marketing-bg-elevated shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center gap-2 border-b border-marketing-border/50 bg-marketing-bg-subtle px-4 py-3">
                <div className="size-3 rounded-full bg-red-500/80" />
                <div className="size-3 rounded-full bg-yellow-500/80" />
                <div className="size-3 rounded-full bg-green-500/80" />
                <div className="ml-4 flex-1 rounded-md bg-marketing-bg px-3 py-1.5 text-xs text-marketing-fg-muted font-mono">
                  mcphero.app/dashboard
                </div>
              </div>
              
              {/* Content placeholder */}
              <div className="aspect-[16/9] bg-marketing-bg-subtle p-8">
                <div className="grid h-full gap-6 md:grid-cols-3">
                  {/* Sidebar */}
                  <div className="rounded-lg bg-marketing-bg border border-marketing-border p-4">
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="size-8 rounded-md bg-[var(--marketing-accent)]/10" />
                          <div className="h-3 w-24 rounded bg-marketing-border" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Main content */}
                  <div className="col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-32 rounded bg-marketing-border" />
                      <div className="h-8 w-24 rounded-lg bg-[var(--marketing-accent)]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-lg border border-marketing-border bg-marketing-bg p-4">
                          <div className="h-3 w-16 rounded bg-marketing-border mb-2" />
                          <div className="h-6 w-20 rounded bg-[var(--marketing-accent)]/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
