"use client";

import { useEffect, useRef, useState } from "react";
import { useCursor } from "@/lib/CursorContext";

const CURSOR_SIZES = {
  default: 32,
  link: 56,
  project: 80,
  text: 4,
  button: 56,
};

const BLEND_MODES = {
  default: "normal",
  link: "difference",
  project: "difference",
  text: "normal",
  button: "difference",
};

const MAGNETIC_THRESHOLD = 100;

export default function CustomCursor() {
  const { cursorType, magneticElements } = useCursor();
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const labelRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const outerPos = useRef({ x: -100, y: -100 });
  const innerPos = useRef({ x: -100, y: -100 });

  // Start at 45 degrees to match the diamond look
  const rotation = useRef(45);
  const rafId = useRef(null);
  const visible = useRef(false);
  const clicking = useRef(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) {
      setIsMobile(true);
      return;
    }
    setIsMobile(false);

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible.current && outerRef.current) {
        visible.current = true;
        outerRef.current.style.opacity = "1";
        innerRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      visible.current = false;
      if (outerRef.current) outerRef.current.style.opacity = "0";
      if (innerRef.current) innerRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      visible.current = true;
      if (outerRef.current) outerRef.current.style.opacity = "1";
      if (innerRef.current) innerRef.current.style.opacity = "1";
    };

    const handleMouseDown = () => {
      clicking.current = true;
    };

    const handleMouseUp = () => {
      clicking.current = false;
    };

    function animate() {
      let targetX = mousePos.current.x;
      let targetY = mousePos.current.y;

      // Magnetic pull
      if (magneticElements?.current) {
        for (const { element, strength } of magneticElements.current) {
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(targetX - centerX, targetY - centerY);

          if (dist < MAGNETIC_THRESHOLD) {
            const pull = (1 - dist / MAGNETIC_THRESHOLD) * strength;
            targetX += (centerX - targetX) * pull;
            targetY += (centerY - targetY) * pull;
          }
        }
      }

      // Lerp positions
      outerPos.current.x += (targetX - outerPos.current.x) * 0.12;
      outerPos.current.y += (targetY - outerPos.current.y) * 0.12;
      innerPos.current.x += (targetX - innerPos.current.x) * 0.25;
      innerPos.current.y += (targetY - innerPos.current.y) * 0.25;

      // Slow rotation: 15-second cycle for a premium, subtle feel
      rotation.current += 360 / (15 * 60);
      if (rotation.current >= 405) rotation.current = 45;

      const clickScale = clicking.current ? 0.85 : 1;

      // Update outer reticle DOM
      if (outerRef.current) {
        const size = outerRef.current.offsetWidth;
        outerRef.current.style.transform = `translate(${outerPos.current.x - size / 2}px, ${outerPos.current.y - size / 2}px) scale(${clickScale}) rotate(${rotation.current}deg)`;
      }

      // Update inner dot DOM
      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${innerPos.current.x - 3}px, ${innerPos.current.y - 3}px)`;
      }

      // Update label position
      if (labelRef.current) {
        labelRef.current.style.transform = `translate(${outerPos.current.x}px, ${outerPos.current.y}px) translate(-50%, -50%)`;
      }

      rafId.current = requestAnimationFrame(animate);
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    rafId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [magneticElements]);

  if (isMobile) return null;

  const size = CURSOR_SIZES[cursorType] || 32;
  const blendMode = BLEND_MODES[cursorType] || "normal";
  const showDot = cursorType === "default";
  const showLabel = cursorType === "project";

  return (
    <>
      {/* Outer spinning reticle */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
        style={{
          width: size,
          height: size,
          opacity: 0,
          mixBlendMode: blendMode,
          transition: "width 0.3s ease, height 0.3s ease, mix-blend-mode 0.3s ease",
          willChange: "transform",
        }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="white"
          strokeWidth="2"
          className="w-full h-full"
        >
          {/* Shortened corners for wider gap */}
          <path d="M 2 8 L 2 2 L 8 2" />
          <path d="M 24 2 L 30 2 L 30 8" />
          <path d="M 30 24 L 30 30 L 24 30" />
          <path d="M 8 30 L 2 30 L 2 24" />
        </svg>
      </div>

      {/* Inner dot */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 rounded-full bg-white pointer-events-none z-[9999] hidden md:block"
        style={{
          width: 6,
          height: 6,
          opacity: showDot ? 1 : 0,
          mixBlendMode: blendMode,
          transition: "opacity 0.2s ease",
          willChange: "transform",
        }}
      />

      {/* Cursor label (for project hover) */}
      {showLabel && (
        <div
          ref={labelRef}
          className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:flex items-center justify-center"
          style={{
            width: size,
            height: size,
            willChange: "transform",
            mixBlendMode: "difference",
          }}
        >
          <span className="text-white text-xs font-medium uppercase tracking-wider">
            View
          </span>
        </div>
      )}
    </>
  );
}
