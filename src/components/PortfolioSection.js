"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { projects } from "@/lib/data";
import SectionReveal from "./SectionReveal";
import { useCursor } from "@/lib/CursorContext";

export default function PortfolioSection() {
  const { setCursorType } = useCursor();

  const handleCardMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    e.currentTarget.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-5px)`;
    e.currentTarget.style.transition = "transform 0.1s ease";
  };

  const handleCardMouseLeave = (e) => {
    e.currentTarget.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0px)";
    e.currentTarget.style.transition = "transform 0.5s ease";
    setCursorType("default");
  };

  return (
    <section id="portfolio" className="py-24 md:py-32 px-6 md:px-12 bg-dark-secondary">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            What I&apos;VE <span className="text-stroke">DONE</span>
          </h2>
          <p className="text-accent-muted text-lg mb-16">A selection of my works</p>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <motion.a
              key={project.title}
              href={project.url}
              target={project.url !== "#" ? "_blank" : undefined}
              rel={project.url !== "#" ? "noopener noreferrer" : undefined}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: "easeOut",
              }}
              onMouseMove={handleCardMouseMove}
              onMouseEnter={() => setCursorType("project")}
              onMouseLeave={handleCardMouseLeave}
              className="group block rounded-xl overflow-hidden bg-dark-tertiary border border-border hover:border-accent-muted/30 transition-colors"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Image container with gradient fallback */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${
                    index === 0
                      ? "from-purple-900/40 to-blue-900/40"
                      : index === 1
                        ? "from-emerald-900/40 to-teal-900/40"
                        : index === 2
                          ? "from-orange-900/40 to-red-900/40"
                          : "from-cyan-900/40 to-indigo-900/40"
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center text-accent-muted/30 text-6xl font-bold">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="absolute inset-0">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 scale-110 group-hover:scale-100"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-white transition-colors">
                  {project.title}
                </h3>
                <p className="text-accent-muted text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
