"use client";

import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import SnakeGame from "@/components/SnakeGame";

export default function PlayPage() {
  return (
    <main className="min-h-screen bg-dark text-white">
      <section className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          Play
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
          className="mt-4 text-lg text-accent-muted max-w-2xl"
        >
          Take a break. Have some fun.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-16 flex justify-center"
        >
          <SnakeGame />
        </motion.div>
      </section>
      <Footer />
    </main>
  );
}
