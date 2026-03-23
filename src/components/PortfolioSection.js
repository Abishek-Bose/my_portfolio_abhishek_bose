"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import { projects } from "@/lib/data";
import SectionReveal from "./SectionReveal";
import { useCursor } from "@/lib/CursorContext";

function ProjectCard({ project, index }) {
  const { setCursorType } = useCursor();
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    if (project.animation) {
      fetch(project.animation)
        .then((res) => res.json())
        .then((data) => setAnimationData(data))
        .catch(() => setAnimationData(null));
    }
  }, [project.animation]);

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
    <motion.a
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
      className="group block rounded-xl overflow-hidden bg-dark-tertiary border border-border hover:border-accent/30 transition-colors"
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Animation container */}
      <div className="relative h-56 md:h-64 overflow-hidden bg-dark flex items-center justify-center">
        {animationData ? (
          <Lottie
            animationData={animationData}
            loop
            autoplay
            className="w-full h-full object-contain p-4 opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-accent/20 text-6xl font-bold">
            {String(index + 1).padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        <p className="text-accent-muted text-sm leading-relaxed">
          {project.description}
        </p>
      </div>
    </motion.a>
  );
}

export default function PortfolioSection() {
  return (
    <section id="portfolio" className="py-24 md:py-32 px-6 md:px-12 bg-dark-secondary">
      <div className="max-w-5xl mx-auto">
        <SectionReveal>
          <h2 className="text-4xl md:text-6xl font-bold mb-4">
            {"What I've"} <span className="text-accent">DONE</span>
          </h2>
          <p className="text-accent-muted text-lg mb-16">A selection of my works</p>
        </SectionReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
