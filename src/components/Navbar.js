"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/data";
import { useCursorHover, useMagnetic } from "@/lib/CursorContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const linkHover = useCursorHover("link");
  const logoRef = useMagnetic(0.2);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0c0c0c]/80 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
        <a
          ref={logoRef}
          href="/"
          className="text-lg font-bold tracking-widest text-white hover:text-accent active:text-accent transition-colors"
          {...linkHover}
        >
          [{siteConfig.fullName}]
        </a>

        <div className="flex items-center gap-8">
          <a
            href={siteConfig.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative group text-sm text-accent-muted hover:text-white active:text-white transition-colors"
            {...linkHover}
          >
            [RESUME]
            <span className="absolute -bottom-1 left-0 h-px bg-accent origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </motion.nav>
  );
}
