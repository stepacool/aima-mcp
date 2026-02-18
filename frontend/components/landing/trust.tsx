"use client";

import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Github, BookOpen, Twitter, Disc } from "lucide-react";

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/docs/api" },
      { label: "Examples", href: "/docs/examples" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
      { label: "Careers", href: "#careers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

export function Trust() {
  return (
    <section className="bg-marketing-bg py-24 md:py-32" id="trust">
      <div className="container">
        {/* GitHub Stars & Docs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mb-20"
        >
          <div className="flex flex-col items-center justify-center gap-8 md:flex-row">
            {/* GitHub Stars */}
            <a
              href="https://github.com/aimalabs/mcphero"
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
              })}
            >
              <Github className="mr-2 size-5" />
              <span className="font-semibold">4</span>
              <span className="ml-1 text-marketing-fg-muted">Stars</span>
            </a>

            {/* Docs Link */}
            <Link
              href="/docs"
              className={buttonVariants({
                variant: "link",
                size: "lg",
              })}
            >
              <BookOpen className="mr-2 size-5" />
              <span>Read the documentation</span>
              <span className="ml-1">→</span>
            </Link>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="border-t border-marketing-border pt-16"
        >
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
            {/* Brand & Description */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl font-bold text-marketing-fg">
                  MCPHERO
                </span>
              </Link>
              <p className="mt-4 text-sm text-marketing-fg-muted">
                Ship MCP servers in minutes, not weeks. Build, deploy, and
                manage MCP servers with AI. No code required.
              </p>
              {/* Social Links */}
              <div className="mt-6 flex gap-4">
                <a
                  href="https://github.com/aimalabs/mcphero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-marketing-fg-muted transition-colors hover:text-marketing-fg"
                  aria-label="GitHub"
                >
                  <Github className="size-5" />
                </a>
                <a
                  href="https://discord.gg/mcphero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-marketing-fg-muted transition-colors hover:text-marketing-fg"
                  aria-label="Discord"
                >
                  <Disc className="size-5" />
                </a>
                <a
                  href="https://twitter.com/mcphero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-marketing-fg-muted transition-colors hover:text-marketing-fg"
                  aria-label="Twitter"
                >
                  <Twitter className="size-5" />
                </a>
              </div>
            </div>

            {/* Link Columns */}
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="mb-4 text-sm font-semibold text-marketing-fg">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-marketing-fg-muted transition-colors hover:text-marketing-fg"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Copyright */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-marketing-border pt-8 md:flex-row">
            <p className="text-sm text-marketing-fg-muted">
              © 2026 AIMALabs. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-marketing-fg-muted transition-colors hover:text-marketing-fg"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-marketing-fg-muted transition-colors hover:text-marketing-fg"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>
    </section>
  );
}
