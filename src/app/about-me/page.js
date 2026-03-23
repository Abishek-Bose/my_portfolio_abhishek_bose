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
    company: "Bizotic Technologies",
    companyUrl: "http://bizotictech.com/",
    period: "Feb 2026 \u2014 Present",
    description:
      "Leading full-stack development for enterprise-grade web applications, architecting scalable solutions, and driving product delivery for diverse clients.",
    projects: [
      {
        name: "Bizotic Supervision",
        detail: "Built from scratch \u2014 a comprehensive business registration and compliance services platform.",
        tech: ["Next.js", "React", "Tailwind CSS", "Node.js"],
        url: "https://www.bizoticsupervision.in/",
      },
      {
        name: "Enterprise CRM System",
        detail: "Currently developing a role-based CRM with 19 database models, 37 API routes, 29 pages, and 4 dashboards (Admin, BDM, Leader, Member). Features include task & team management, billing, Cloudinary file uploads, real-time notifications, revenue analytics, and CSV/PDF export.",
        tech: ["Next.js 16", "React 19", "Prisma 7", "Tailwind CSS 4", "JWT Auth", "Recharts", "Cloudinary", "Nodemailer"],
      },
    ],
  },
  {
    role: "Freelance Web Developer",
    company: "Self-Employed",
    period: "Sep 2024 \u2014 Jan 2026",
    description:
      "Delivered end-to-end web solutions for multiple clients, handling everything from architecture and design to deployment and maintenance.",
    projects: [
      {
        name: "Inkosathi",
        detail: "Built from scratch \u2014 a complete client website with modern UI and responsive design.",
        tech: ["Next.js", "React", "Tailwind CSS"],
        url: "https://www.inkosathi.com/",
      },
      {
        name: "Student-Teacher-Parent Management System",
        detail: "A full-stack management platform for educational institutions with role-based access, attendance tracking, and reporting.",
        tech: ["React", "Python", "PostgreSQL", "AWS S3", "REST API"],
      },
    ],
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
              <span className="text-accent">me</span>
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
              Skills & <span className="text-accent">Technologies</span>
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
                  {exp.companyUrl ? (
                    <a
                      href={exp.companyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent text-sm mt-1 inline-block hover:underline"
                    >
                      {exp.company}
                    </a>
                  ) : (
                    <p className="text-accent-muted text-sm mt-1">{exp.company}</p>
                  )}
                  <p className="text-accent-muted text-sm mt-3 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Project cards */}
                  {exp.projects && (
                    <div className="mt-6 space-y-5">
                      {exp.projects.map((project) => (
                        <div
                          key={project.name}
                          className="border border-border rounded-lg p-4 bg-dark-tertiary/50 hover:border-accent/20 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-white">
                              {project.name}
                            </h4>
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent text-xs hover:underline"
                              >
                                {"View \u2197"}
                              </a>
                            )}
                          </div>
                          <p className="text-accent-muted text-xs leading-relaxed mb-3">
                            {project.detail}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {project.tech.map((t) => (
                              <span
                                key={t}
                                className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-accent/20 text-accent"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
