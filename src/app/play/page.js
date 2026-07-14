"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Footer from "@/components/Footer";
import SnakeGame from "@/components/SnakeGame";
import SpaceImpact from "@/components/SpaceImpact";
import Game2048 from "@/components/Game2048";
import Minesweeper from "@/components/Minesweeper";
import { isMuted, setMuted, subscribeMuted, getMutedServerSnapshot } from "@/lib/sound";

const GAMES = [
  { id: "snake", label: "Snake", Component: SnakeGame },
  { id: "space", label: "Space Impact", Component: SpaceImpact },
  { id: "2048", label: "2048", Component: Game2048 },
  { id: "minesweeper", label: "Minesweeper", Component: Minesweeper },
];

export default function PlayPage() {
  const [active, setActive] = useState("snake");
  const muted = useSyncExternalStore(subscribeMuted, isMuted, getMutedServerSnapshot);
  const ActiveComponent = GAMES.find((g) => g.id === active).Component;

  const toggleMute = () => setMuted(!muted);

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

        {/* Game selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-12 flex items-center justify-between border-b border-border"
        >
          <div className="flex items-center gap-2">
            {GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => setActive(g.id)}
                className={`relative px-5 py-3 text-sm tracking-wider transition-colors ${
                  active === g.id ? "text-accent" : "text-accent-muted hover:text-white"
                }`}
              >
                {g.label.toUpperCase()}
                {active === g.id && (
                  <motion.span
                    layoutId="game-tab-underline"
                    className="absolute left-0 right-0 -bottom-px h-px bg-accent"
                  />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={toggleMute}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
            title={muted ? "Unmute" : "Mute"}
            className="px-3 py-2 text-accent-muted hover:text-accent transition-colors"
          >
            {muted ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
        </motion.div>

        {/* Active game */}
        <div className="mt-12 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full flex justify-center"
            >
              <ActiveComponent />
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      <Footer />
    </main>
  );
}
