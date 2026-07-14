"use client";

import { useState } from "react";
import Spline from "@splinetool/react-spline";

const SCENE_URL = "https://prod.spline.design/l5WbTDJlIWEQw1Lm/scene.splinecode";

// The scene ships with its own opaque backdrop, which would otherwise show up as
// a hard-edged rectangle over the hero. `screen` drops anything darker than the
// page (the backdrop) and keeps the bright particles; the mask feathers the
// canvas edges so the rectangle never announces itself.
const FEATHER =
  "radial-gradient(ellipse 44% 48% at 50% 50%, #000 30%, transparent 78%)";

// Callers gate on motion preference BEFORE rendering this — the gate must sit
// outside the dynamic import, or the 1.9MB runtime downloads and then renders
// nothing. See HeroSection.
export default function HeroSpline() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="absolute inset-0 z-[2] pointer-events-none transition-opacity duration-1000 ease-out"
      style={{ opacity: loaded ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Recolours ONLY the drifting particles, leaving the brain itself the
          grey it ships as. A CSS filter can't do this — it hits every pixel.
          So: key on luminance (the specks are the brightest thing in the scene),
          hard-threshold that into a mask, tint just the masked pixels, and lay
          them back over the untouched original. */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="glitter-brand-tint" colorInterpolationFilters="sRGB">
            {/* luminance → alpha */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0.2126 0.7152 0.0722 0 0"
              result="luma"
            />
            {/* Hard cut at luminance 0.35 (20 buckets => 0.05 resolution).
                Tuned against the actual scene: the drifting specks sit above
                this line, the brain's own surface sits below it and so keeps
                the grey it ships with. Raise the cut to green fewer specks. */}
            <feComponentTransfer in="luma" result="sparkKey">
              <feFuncA
                type="discrete"
                tableValues="0 0 0 0 0 0 0 1 1 1 1 1 1 1 1 1 1 1 1 1"
              />
            </feComponentTransfer>

            {/* Scale grey → #57C122 (87,193,34)/255, so a speck keeps its own
                brightness but arrives in brand green. */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="0.34 0 0 0 0
                      0.76 0 0 0 0
                      0.13 0 0 0 0
                      0    0 0 1 0"
              result="branded"
            />
            <feComposite
              in="branded"
              in2="sparkKey"
              operator="in"
              result="brandedSparks"
            />

            {/* untouched scene, with the tinted sparks laid back on top */}
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="brandedSparks" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Centered behind the wordmark. Luminance is held back so the type reads
          on top — at full strength the bright core swallows the middle letters.

          The canvas gets an explicit landscape box rather than filling the
          section: the scene's camera crops to the canvas aspect, so a tall
          phone viewport would slice the brain into an unrecognisable slab.
          Mobile also runs dimmer, since the body copy sits right on top of it
          there with nowhere else to go. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   w-full h-[42%] opacity-[0.6]
                   md:w-[118%] md:h-[118%] md:opacity-[0.78]"
        style={{
          mixBlendMode: "screen",
          maskImage: FEATHER,
          WebkitMaskImage: FEATHER,
          filter: "url(#glitter-brand-tint)",
        }}
      >
        <Spline scene={SCENE_URL} onLoad={() => setLoaded(true)} />
      </div>
    </div>
  );
}
