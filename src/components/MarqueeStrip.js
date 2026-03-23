"use client";

import { marqueeText } from "@/lib/data";

export default function MarqueeStrip() {
  const repeatedText = Array(4).fill(marqueeText);

  return (
    <section className="py-12 -rotate-1 bg-dark-secondary border-y border-border overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap">
        {repeatedText.map((text, i) => (
          <span
            key={i}
            className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase text-stroke mx-8 shrink-0"
          >
            {text}
            <span className="mx-8 text-accent-muted">&#x2022;</span>
          </span>
        ))}
        {/* Duplicate for seamless loop */}
        {repeatedText.map((text, i) => (
          <span
            key={`dup-${i}`}
            className="text-4xl md:text-6xl lg:text-7xl font-bold uppercase text-stroke mx-8 shrink-0"
          >
            {text}
            <span className="mx-8 text-accent-muted">&#x2022;</span>
          </span>
        ))}
      </div>
    </section>
  );
}
