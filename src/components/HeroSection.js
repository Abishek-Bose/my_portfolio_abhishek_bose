"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/lib/data";
import { useCursorHover } from "@/lib/CursorContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

export default function HeroSection() {
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const spotlightRef = useRef(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const linkHover = useCursorHover("link");

  const handleMouseMove = useCallback((e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseOffset({ x, y });

    if (spotlightRef.current) {
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      spotlightRef.current.style.background = `radial-gradient(600px circle at ${localX}px ${localY}px, rgba(255,255,255,0.03), transparent 70%)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
    if (spotlightRef.current) {
      spotlightRef.current.style.background = "transparent";
    }
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window === "undefined" || window.innerWidth < 768) return;

    section.addEventListener("mousemove", handleMouseMove, { passive: true });
    section.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      section.removeEventListener("mousemove", handleMouseMove);
      section.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const displayName = siteConfig.heroName?.toUpperCase() || "ABHISHEK";

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a] to-[#111111]" />

      {/* Spotlight that follows mouse */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none z-[1]"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full relative z-10 flex flex-col max-w-[1400px] mx-auto mt-20"
      >
        {/* Greeting */}
        <motion.p
          variants={itemVariants}
          className="text-white text-2xl md:text-3xl font-medium mb-4"
        >
          {"Hi, I'm"}
        </motion.p>

        {/* Giant Name with per-character hover animation */}
        <motion.h1
          ref={nameRef}
          variants={itemVariants}
          className="flex text-[18vw] md:text-[14vw] lg:text-[16vw] font-bold tracking-tighter leading-none text-white w-full cursor-default"
          style={{
            transform: `translate(${mouseOffset.x * 15}px, ${mouseOffset.y * 10}px)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          {displayName.split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block origin-bottom stroke-char"
              data-char={char}
              style={{ animationDelay: `${1 + i * 0.08}s` }}
              whileHover={{
                scaleY: 1.25,
                scaleX: 1.1,
                y: -10,
                color: "#d1d5db",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 10,
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Bottom: Split Content */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-end w-full mt-16 md:mt-24 gap-12 md:gap-8"
        >
          {/* Left: Description */}
          <div className="flex flex-col gap-3 text-white max-w-2xl">
            <p className="text-2xl md:text-3xl font-medium tracking-wide">
              {`I'm a ${siteConfig.title},`}
            </p>
            <p className="text-xl md:text-2xl font-normal tracking-wide text-gray-100">
              {"passionate about solving real-world problems"}
              <br className="hidden md:block" />
              {" through clean and efficient code."}
            </p>
          </div>

          {/* Right: CTA */}
          <div className="flex flex-col items-start md:items-end gap-3 text-white">
            <Link
              href="/about-me"
              className="text-2xl md:text-3xl font-medium tracking-wide hover:text-gray-300 transition-colors"
              {...linkHover}
            >
              {`[\u2192 Know more about me]`}
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
