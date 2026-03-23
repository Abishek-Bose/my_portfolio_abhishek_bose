"use client";

import { motion } from "framer-motion";
import { siteConfig } from "@/lib/data";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/SectionReveal";

const skills = [
  { category: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML/CSS"] },
  { category: "Backend", items: ["Node.js", "Express", "Python", "REST APIs", "GraphQL"] },
  { category: "Database", items: ["PostgreSQL", "MongoDB", "Redis", "Prisma"] },
  { category: "Tools", items: ["Git", "Docker", "AWS", "CI/CD", "Figma"] },
];

const experience = [
  {
    role: "Full Stack Developer",
    company: "Your Company",
    period: "2023 — Present",
    description: "Building scalable web applications and leading frontend architecture decisions.",
  },
  {
    role: "Software Developer",
    company: "Previous Company",
    period: "2021 — 2023",
    description: "Developed and maintained multiple client-facing applications using React and Node.js.",
  },
  {
    role: "Junior Developer",
    company: "First Company",
    period: "2020 — 2021",
    description: "Started career building responsive websites and learning modern web technologies.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function AboutMe() {
  return (
    <main className="pt-24">
      {/* Hero */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p variants={itemVariants} className="text-accent-muted text-lg mb-4">
              About Me
            </motion.p>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold mb-8">
              Know more about{" "}
              <span className="text-stroke">me</span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-accent-muted text-lg md:text-xl max-w-3xl leading-relaxed">
              I&apos;m {siteConfig.name}, a {siteConfig.title} who loves turning complex
              problems into simple, beautiful, and intuitive solutions. I specialize
              in building full-stack web applications that make a real impact.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Skills */}
      <section className="px-6 md:px-12 py-16 md:py-24 bg-dark-secondary">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <h2 className="text-3xl md:text-5xl font-bold mb-12">
              Skills & <span className="text-stroke">Technologies</span>
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillGroup, index) => (
              <motion.div
                key={skillGroup.category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="space-y-4"
              >
                <h3 className="text-lg font-semibold text-white">
                  {skillGroup.category}
                </h3>
                <ul className="space-y-2">
                  {skillGroup.items.map((skill) => (
                    <li key={skill} className="text-accent-muted text-sm">
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience */}
      <section className="px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <h2 className="text-3xl md:text-5xl font-bold mb-12">
              Experience
            </h2>
          </SectionReveal>

          <div className="space-y-0">
            {experience.map((exp, index) => (
              <motion.div
                key={exp.role + exp.company}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-t border-border py-8 md:py-10 flex flex-col md:flex-row gap-4 md:gap-12"
              >
                <span className="text-accent-muted text-sm font-mono md:w-40 shrink-0">
                  {exp.period}
                </span>
                <div>
                  <h3 className="text-xl font-semibold">{exp.role}</h3>
                  <p className="text-accent-muted text-sm mt-1">{exp.company}</p>
                  <p className="text-accent-muted text-sm mt-3 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              </motion.div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
