"use client";

import { motion } from "framer-motion";
import { services } from "@/lib/data";
import SectionReveal from "./SectionReveal";
import { useCursorHover } from "@/lib/CursorContext";

export default function ServicesSection() {
  const linkHover = useCursorHover("link");

  return (
    <section className="py-24 md:py-32 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            What I <span className="text-accent">DO</span>
          </h2>
          <p className="text-accent-muted text-lg mb-16">Transformation</p>
        </SectionReveal>

        <div className="space-y-0">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: "easeOut",
              }}
              className="group relative border-t border-border py-8 md:py-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-12 hover:bg-dark-secondary/50 transition-colors px-4 -mx-4 rounded-lg"
              {...linkHover}
            >
              {/* Left accent border */}
              <div className="absolute left-0 top-0 w-[2px] h-0 bg-accent group-hover:h-full transition-all duration-500" />

              <span className="text-accent-muted text-sm font-mono">
                {service.number}
              </span>
              <h3 className="text-xl md:text-2xl font-semibold group-hover:text-white transition-colors flex-1">
                {service.title}
              </h3>
              <p className="text-accent-muted text-sm md:text-base max-w-sm">
                {service.description}
              </p>
            </motion.div>
          ))}
          <div className="border-t border-border" />
        </div>
      </div>
    </section>
  );
}
