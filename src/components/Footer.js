"use client";

import Link from "next/link";
import { siteConfig } from "@/lib/data";
import { useCursorHover, useMagnetic } from "@/lib/CursorContext";

export default function Footer() {
  const linkHover = useCursorHover("link");
  const talkRef = useMagnetic(0.3);

  return (
    <footer className="border-t border-border py-12 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
          <Link
            href="/"
            className="text-3xl md:text-4xl font-bold tracking-tight hover:text-accent-muted transition-colors"
            {...linkHover}
          >
            {siteConfig.fullName}
          </Link>

          <div className="flex items-center gap-6">
            <a
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="relative group text-accent-muted hover:text-white active:text-white transition-colors text-sm"
              {...linkHover}
            >
              [LINKEDIN]
              <span className="absolute -bottom-1 left-0 h-px bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
            <a
              href={siteConfig.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="relative group text-accent-muted hover:text-white active:text-white transition-colors text-sm"
              {...linkHover}
            >
              [GITHUB]
              <span className="absolute -bottom-1 left-0 h-px bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
            <a
              href={siteConfig.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative group text-accent-muted hover:text-white active:text-white transition-colors text-sm"
              {...linkHover}
            >
              [RESUME]
              <span className="absolute -bottom-1 left-0 h-px bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </a>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-accent-muted text-sm">
          <p>&copy; {new Date().getFullYear()}</p>
          <a
            ref={talkRef}
            href="#contact"
            className="text-accent hover:text-accent/70 active:text-accent/70 transition-colors text-sm font-medium"
            {...linkHover}
          >
            {"[Let's Talk \u2192]"}
          </a>
        </div>
      </div>
    </footer>
  );
}
