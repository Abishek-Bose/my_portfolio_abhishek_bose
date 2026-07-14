"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";
import { siteConfig } from "@/lib/data";
import { useCursorHover } from "@/lib/CursorContext";
import { useIsMobile, useMediaQuery } from "@/lib/useMediaQuery";

// The Spline runtime is a ~1.9MB WebGL bundle that touches `window` on import,
// so it stays out of the server render and off the initial client bundle. The
// decision to render it is made below, BEFORE this import is triggered.
const HeroSpline = dynamic(() => import("./HeroSpline"), { ssr: false });

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
  const isMobile = useIsMobile();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const linkHover = useCursorHover("link");

  // Gate here, not inside HeroSpline: the check must sit outside the dynamic
  // import, or the 1.9MB runtime downloads and then renders nothing. Shown on
  // mobile too (by request — it costs phones that 1.9MB); reduced-motion opts out.
  const showSpline = !reducedMotion;

  // Scroll-based parallax for mobile
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const scrollParallaxY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // Desktop: mouse tracking
  const handleMouseMove = useCallback((e) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMouseOffset({ x, y });

    if (spotlightRef.current) {
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      spotlightRef.current.style.background = `radial-gradient(600px circle at ${localX}px ${localY}px, rgba(87,193,34,0.05), transparent 70%)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMouseOffset({ x: 0, y: 0 });
    if (spotlightRef.current) {
      spotlightRef.current.style.background = "transparent";
    }
  }, []);

  // Desktop drives parallax from the pointer; mobile from the gyroscope.
  useEffect(() => {
    if (!isMobile) {
      const section = sectionRef.current;
      if (!section) return;
      section.addEventListener("mousemove", handleMouseMove, { passive: true });
      section.addEventListener("mouseleave", handleMouseLeave);
      return () => {
        section.removeEventListener("mousemove", handleMouseMove);
        section.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    const handleOrientation = (e) => {
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30));
      const y = Math.max(-1, Math.min(1, (e.beta || 0) / 30));
      setMouseOffset({ x, y });
    };

    window.addEventListener("deviceorientation", handleOrientation, { passive: true });
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [isMobile, handleMouseMove, handleMouseLeave]);

  const displayName = siteConfig.heroName?.toUpperCase() || "ABHISHEK";

  return (
    <section
      ref={sectionRef}
      className="min-h-screen flex flex-col justify-center px-6 md:px-12 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink to-dark-secondary" />

      {/* Spotlight — desktop only */}
      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none z-[1] hidden md:block"
      />

      {/* 3D scene — sits above the gradient, below the copy */}
      {showSpline && <HeroSpline />}

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full relative z-10 flex flex-col max-w-[1400px] mx-auto mt-20"
        style={isMobile ? { y: scrollParallaxY, opacity: scrollOpacity } : undefined}
      >
        {/* Greeting */}
        <motion.p
          variants={itemVariants}
          className="text-white text-2xl md:text-3xl font-medium mb-4"
        >
          {"Hi, I'm"}
        </motion.p>

        {/* Giant Name — parallax on all devices, hover on desktop, tap on mobile */}
        <motion.h1
          ref={nameRef}
          variants={itemVariants}
          className="flex flex-wrap text-[18vw] md:text-[14vw] lg:text-[16vw] font-bold tracking-tighter leading-none text-white w-full cursor-default"
          style={{
            transform: `translate(${mouseOffset.x * 15}px, ${mouseOffset.y * 10}px)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          {displayName.split("").map((char, i) => (
            <motion.span
              key={i}
              className="inline-block origin-bottom text-gradient-primary"
              whileHover={
                !isMobile
                  ? {
                      scaleY: 1.25,
                      scaleX: 1.1,
                      y: -10,
                      filter: "brightness(1.3)",
                    }
                  : undefined
              }
              whileTap={{
                scaleY: 1.2,
                scaleX: 1.08,
                y: -8,
                filter: "brightness(1.3)",
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
              className="text-2xl md:text-3xl font-medium tracking-wide hover:text-accent active:text-accent transition-colors"
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
