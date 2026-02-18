"use client";

import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Github, BookOpen, Twitter, Disc } from "lucide-react";

const companies = [
  { name: "Acme Corp", initials: "AC" },
  { name: "TechCo", initials: "TC" },
  { name: "DataFlow", initials: "DF" },
  { name: "CloudScale", initials: "CS" },
  { name: "DevOps Inc", initials: "DO" },
  { name: "ScaleUp", initials: "SU" },
];

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

function CompanyLogo({ name, initials }: { name: string; initials: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="flex h-12 w-24 items-center justify-center rounded-lg bg-marketing-bg-elevated grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100 border border-marketing-border">
        <span className="text-lg font-semibold text-marketing-fg">
          {initials}
        </span>
      </div>
    </div>
  );
}

export function Trust() {
  return (
    <section className="bg-marketing-bg py-24 md:py-32" id="trust">
      <div className="container">
        {/* Company Logos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-marketing-fg">
              Trusted by leading companies
            </h2>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6"
          >
            {companies.map((company) => (
              <motion.div key={company.name} variants={itemVariants}>
                <CompanyLogo
                  name={company.name}
                  initials={company.initials}
                />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

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
              <span className="font-semibold">2.5k+</span>
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
