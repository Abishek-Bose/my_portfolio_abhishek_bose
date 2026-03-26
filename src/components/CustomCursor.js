"use client";

import { useEffect, useRef, useState } from "react";
import { useCursor } from "@/lib/CursorContext";

const CORNER_SIZE = 12;
const BORDER_WIDTH = 3;
const PARALLAX_STRENGTH = 5e-5;
const MAGNETIC_THRESHOLD = 100;
const MAGNETIC_RELEASE_LERP = 0.06;
const SPIN_DURATION = 2; // seconds per full rotation

// Default idle offsets for corners relative to container center
// Reference: TL=-1.5*12, TR=0.5*12, etc.
const DEFAULT_OFFSETS = [
  { x: -1.5 * CORNER_SIZE, y: -1.5 * CORNER_SIZE }, // TL
  { x: 0.5 * CORNER_SIZE, y: -1.5 * CORNER_SIZE },  // TR
  { x: 0.5 * CORNER_SIZE, y: 0.5 * CORNER_SIZE },   // BR
  { x: -1.5 * CORNER_SIZE, y: 0.5 * CORNER_SIZE },  // BL
];

export default function CustomCursor() {
  const { cursorType, targetElement, magneticElements } = useCursor();
  const containerRef = useRef(null);
  const cornerRefs = useRef([null, null, null, null]);
  const dotRef = useRef(null);
  const labelRef = useRef(null);

  const mousePos = useRef({ x: 0, y: 0 });
  const containerPos = useRef({ x: 0, y: 0 });
  const firstMove = useRef(true);
  const cornerOffsets = useRef(
    DEFAULT_OFFSETS.map((o) => ({ x: o.x, y: o.y }))
  );

  const rotation = useRef(0);
  const rafId = useRef(null);
  const visible = useRef(false);
  const clicking = useRef(false);
  const containerScale = useRef(1);
  const dotScaleVal = useRef(1);
  const dotOpacity = useRef(1);

  const magneticOffset = useRef({ x: 0, y: 0 });
  const wasInMagneticZone = useRef(false);

  const [isMobile, setIsMobile] = useState(true);

  const cursorTypeRef = useRef(cursorType);
  useEffect(() => {
    cursorTypeRef.current = cursorType;
  }, [cursorType]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.innerWidth < 768) {
      setIsMobile(true);
      return;
    }
    setIsMobile(false);

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      // Jump to position on first move (no fly-in)
      if (firstMove.current) {
        firstMove.current = false;
        containerPos.current = { x: e.clientX, y: e.clientY };
      }
      if (!visible.current && containerRef.current) {
        visible.current = true;
        containerRef.current.style.opacity = "1";
      }
    };

    const handleMouseLeave = () => {
      visible.current = false;
      if (containerRef.current) containerRef.current.style.opacity = "0";
    };

    const handleMouseEnter = () => {
      visible.current = true;
      if (containerRef.current) containerRef.current.style.opacity = "1";
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

      // --- Magnetic pull with elastic release ---
      let inMagneticZone = false;
      if (magneticElements?.current) {
        for (const { element, strength } of magneticElements.current) {
          if (!element) continue;
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dist = Math.hypot(targetX - centerX, targetY - centerY);

          if (dist < MAGNETIC_THRESHOLD) {
            inMagneticZone = true;
            const pull = (1 - dist / MAGNETIC_THRESHOLD) * strength;
            const offsetX = (centerX - targetX) * pull;
            const offsetY = (centerY - targetY) * pull;
            magneticOffset.current = { x: offsetX, y: offsetY };
            targetX += offsetX;
            targetY += offsetY;
          }
        }
      }

      if (!inMagneticZone && wasInMagneticZone.current) {
        magneticOffset.current.x *= 1 - MAGNETIC_RELEASE_LERP;
        magneticOffset.current.y *= 1 - MAGNETIC_RELEASE_LERP;
        if (
          Math.abs(magneticOffset.current.x) > 0.1 ||
          Math.abs(magneticOffset.current.y) > 0.1
        ) {
          targetX += magneticOffset.current.x;
          targetY += magneticOffset.current.y;
        } else {
          magneticOffset.current = { x: 0, y: 0 };
          wasInMagneticZone.current = false;
        }
      }
      if (inMagneticZone) wasInMagneticZone.current = true;

      // --- Lerp container position ---
      containerPos.current.x += (targetX - containerPos.current.x) * 0.15;
      containerPos.current.y += (targetY - containerPos.current.y) * 0.15;

      // --- Determine if on target ---
      const el = targetElement?.current;
      const type = cursorTypeRef.current;
      const isOnTarget = el && type !== "default" && type !== "text";

      // --- Corner targets ---
      let cornerTargets;
      if (isOnTarget) {
        const rect = el.getBoundingClientRect();
        const cx = containerPos.current.x;
        const cy = containerPos.current.y;
        cornerTargets = [
          { x: rect.left - cx - BORDER_WIDTH, y: rect.top - cy - BORDER_WIDTH },
          { x: rect.right - cx + BORDER_WIDTH - CORNER_SIZE, y: rect.top - cy - BORDER_WIDTH },
          { x: rect.right - cx + BORDER_WIDTH - CORNER_SIZE, y: rect.bottom - cy + BORDER_WIDTH - CORNER_SIZE },
          { x: rect.left - cx - BORDER_WIDTH, y: rect.bottom - cy + BORDER_WIDTH - CORNER_SIZE },
        ];

        // Parallax offset within target
        const rectCenterX = rect.left + rect.width / 2;
        const rectCenterY = rect.top + rect.height / 2;
        const px = (mousePos.current.x - rectCenterX) * PARALLAX_STRENGTH * 1000;
        const py = (mousePos.current.y - rectCenterY) * PARALLAX_STRENGTH * 1000;
        for (let i = 0; i < 4; i++) {
          cornerTargets[i] = {
            x: cornerTargets[i].x + px,
            y: cornerTargets[i].y + py,
          };
        }
      } else {
        cornerTargets = DEFAULT_OFFSETS;
      }

      // --- Lerp corner offsets ---
      const cornerSpeed = isOnTarget ? 0.12 : 0.18;
      for (let i = 0; i < 4; i++) {
        cornerOffsets.current[i].x +=
          (cornerTargets[i].x - cornerOffsets.current[i].x) * cornerSpeed;
        cornerOffsets.current[i].y +=
          (cornerTargets[i].y - cornerOffsets.current[i].y) * cornerSpeed;
      }

      // --- Rotation: spins when idle, lerps to 0 when on target ---
      if (isOnTarget) {
        // Smoothly reset rotation to 0 so corners align with target rect
        rotation.current += (0 - rotation.current) * 0.12;
        if (Math.abs(rotation.current) < 0.5) rotation.current = 0;
      } else {
        rotation.current += 360 / (SPIN_DURATION * 60);
        if (rotation.current >= 360) rotation.current -= 360;
      }

      // --- Click: container 0.9, dot 0.7 ---
      const targetContainerScale = clicking.current ? 0.9 : 1;
      const targetDotScale = clicking.current ? 0.7 : 1;
      containerScale.current +=
        (targetContainerScale - containerScale.current) * 0.18;
      dotScaleVal.current +=
        (targetDotScale - dotScaleVal.current) * 0.18;

      // --- Dot opacity: fade out when on target ---
      const targetDotOpacity = isOnTarget ? 0 : 1;
      dotOpacity.current += (targetDotOpacity - dotOpacity.current) * 0.15;

      // --- Update container DOM ---
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${containerPos.current.x}px, ${containerPos.current.y}px) rotate(${rotation.current}deg) scale(${containerScale.current})`;
      }

      // --- Update each corner ---
      for (let i = 0; i < 4; i++) {
        const ref = cornerRefs.current[i];
        if (!ref) continue;
        const o = cornerOffsets.current[i];
        ref.style.transform = `translate(${o.x}px, ${o.y}px)`;
      }

      // --- Update dot ---
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(-50%, -50%) scale(${dotScaleVal.current})`;
        dotRef.current.style.opacity = dotOpacity.current;
      }

      // --- Update label ---
      if (labelRef.current) {
        labelRef.current.style.transform = "translate(-50%, -50%)";
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
  }, [magneticElements, targetElement]);

  if (isMobile) return null;

  const showLabel = cursorType === "project";

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block"
      style={{
        width: 0,
        height: 0,
        opacity: 0,
        mixBlendMode: "difference",
        willChange: "transform",
      }}
    >
      {/* Center dot: 4px white circle */}
      <div
        ref={dotRef}
        className="absolute left-1/2 top-1/2 rounded-full bg-white"
        style={{
          width: 4,
          height: 4,
          willChange: "transform, opacity",
        }}
      />

      {/* TL corner: top + left borders */}
      <div
        ref={(el) => (cornerRefs.current[0] = el)}
        className="absolute left-1/2 top-1/2"
        style={{
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderWidth: `${BORDER_WIDTH}px ${0}px ${0}px ${BORDER_WIDTH}px`,
          borderStyle: "solid",
          borderColor: "white",
          willChange: "transform",
        }}
      />

      {/* TR corner: top + right borders */}
      <div
        ref={(el) => (cornerRefs.current[1] = el)}
        className="absolute left-1/2 top-1/2"
        style={{
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderWidth: `${BORDER_WIDTH}px ${BORDER_WIDTH}px ${0}px ${0}px`,
          borderStyle: "solid",
          borderColor: "white",
          willChange: "transform",
        }}
      />

      {/* BR corner: bottom + right borders */}
      <div
        ref={(el) => (cornerRefs.current[2] = el)}
        className="absolute left-1/2 top-1/2"
        style={{
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderWidth: `${0}px ${BORDER_WIDTH}px ${BORDER_WIDTH}px ${0}px`,
          borderStyle: "solid",
          borderColor: "white",
          willChange: "transform",
        }}
      />

      {/* BL corner: bottom + left borders */}
      <div
        ref={(el) => (cornerRefs.current[3] = el)}
        className="absolute left-1/2 top-1/2"
        style={{
          width: CORNER_SIZE,
          height: CORNER_SIZE,
          borderWidth: `${0}px ${0}px ${BORDER_WIDTH}px ${BORDER_WIDTH}px`,
          borderStyle: "solid",
          borderColor: "white",
          willChange: "transform",
        }}
      />

      {/* Cursor label for project hover */}
      {showLabel && (
        <div
          ref={labelRef}
          className="absolute left-1/2 top-1/2 flex items-center justify-center"
          style={{
            width: 80,
            height: 80,
            willChange: "transform",
          }}
        >
          <span className="text-white text-xs font-medium uppercase tracking-wider">
            View
          </span>
        </div>
      )}
    </div>
  );
}
