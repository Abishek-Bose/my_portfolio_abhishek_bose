"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const CELL_SIZE = 20;
const GRID_W = 25;
const GRID_H = 25;
const CANVAS_W = GRID_W * CELL_SIZE;
const CANVAS_H = GRID_H * CELL_SIZE;

const DIRECTIONS = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  w: { x: 0, y: -1 },
  s: { x: 0, y: 1 },
  a: { x: -1, y: 0 },
  d: { x: 1, y: 0 },
};

const COLORS = {
  bg: "#0f0f0f",
  grid: "#1a1a1a",
  snake: "#c9a96e",
  snakeHead: "#e0c080",
  food: "#c9a96e",
  foodGlow: "rgba(201, 169, 110, 0.3)",
  text: "#ffffff",
  muted: "#6b6b6b",
  border: "#1e1e1e",
};

function randomFood(snake) {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * GRID_W),
      y: Math.floor(Math.random() * GRID_H),
    };
  } while (snake.some((s) => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function SnakeGame() {
  const canvasRef = useRef(null);
  const gameLoop = useRef(null);
  const dirQueue = useRef([]);

  const [gameState, setGameState] = useState("idle"); // idle | playing | paused | over
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(120);

  const snake = useRef([{ x: 15, y: 15 }]);
  const direction = useRef({ x: 1, y: 0 });
  const food = useRef({ x: 20, y: 15 });
  const scoreRef = useRef(0);

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("snake-highscore");
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= GRID_W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * CELL_SIZE, 0);
      ctx.lineTo(x * CELL_SIZE, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y <= GRID_H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * CELL_SIZE);
      ctx.lineTo(CANVAS_W, y * CELL_SIZE);
      ctx.stroke();
    }

    // --- Apple food ---
    const fx = food.current.x * CELL_SIZE + CELL_SIZE / 2;
    const fy = food.current.y * CELL_SIZE + CELL_SIZE / 2;
    const r = CELL_SIZE * 0.38;

    // Glow
    const glow = ctx.createRadialGradient(fx, fy, r * 0.5, fx, fy, CELL_SIZE * 1.2);
    glow.addColorStop(0, "rgba(220, 50, 50, 0.25)");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(fx - CELL_SIZE * 1.2, fy - CELL_SIZE * 1.2, CELL_SIZE * 2.4, CELL_SIZE * 2.4);

    // Apple body
    ctx.fillStyle = "#e53e3e";
    ctx.beginPath();
    ctx.arc(fx - r * 0.25, fy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(fx + r * 0.25, fy, r, 0, Math.PI * 2);
    ctx.fill();

    // Apple highlight
    ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
    ctx.beginPath();
    ctx.arc(fx - r * 0.3, fy - r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Stem
    ctx.strokeStyle = "#5a3e28";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(fx, fy - r * 0.8);
    ctx.lineTo(fx + 1, fy - r * 1.4);
    ctx.stroke();

    // Leaf
    ctx.fillStyle = "#48bb78";
    ctx.beginPath();
    ctx.ellipse(fx + r * 0.35, fy - r * 1.15, r * 0.4, r * 0.2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // --- Snake ---
    const segs = snake.current;
    const dir = direction.current;

    segs.forEach((seg, i) => {
      const isHead = i === 0;
      const isTail = i === segs.length - 1;
      const cx = seg.x * CELL_SIZE + CELL_SIZE / 2;
      const cy = seg.y * CELL_SIZE + CELL_SIZE / 2;

      // Body segments: connected rounded rects with gradient fade
      const segRadius = isHead ? CELL_SIZE * 0.45 : CELL_SIZE * 0.4 - i * 0.05;
      const clampedRadius = Math.max(segRadius, CELL_SIZE * 0.2);

      // Gradient from head color to darker tail
      const t = segs.length > 1 ? i / (segs.length - 1) : 0;
      const headR = 224, headG = 192, headB = 128; // #e0c080
      const tailR = 140, tailG = 120, tailB = 70;
      const cr = Math.round(headR + (tailR - headR) * t);
      const cg = Math.round(headG + (tailG - headG) * t);
      const cb = Math.round(headB + (tailB - headB) * t);

      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.globalAlpha = isTail ? 0.7 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, clampedRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Draw connector between segments (fill the gap)
      if (i > 0) {
        const prev = segs[i - 1];
        const px = prev.x * CELL_SIZE + CELL_SIZE / 2;
        const py = prev.y * CELL_SIZE + CELL_SIZE / 2;
        // Only draw connector if segments are adjacent (not wrapping)
        const dx = Math.abs(seg.x - prev.x);
        const dy = Math.abs(seg.y - prev.y);
        if (dx <= 1 && dy <= 1) {
          const prevT = (i - 1) / (segs.length - 1 || 1);
          const pr = Math.round(headR + (tailR - headR) * prevT);
          const pg = Math.round(headG + (tailG - headG) * prevT);
          const pb = Math.round(headB + (tailB - headB) * prevT);
          const connRadius = Math.max(clampedRadius - 1, CELL_SIZE * 0.18);
          ctx.fillStyle = `rgb(${Math.round((cr + pr) / 2)}, ${Math.round((cg + pg) / 2)}, ${Math.round((cb + pb) / 2)})`;
          ctx.fillRect(
            Math.min(cx, px) - connRadius + Math.abs(cx - px) * 0.1,
            Math.min(cy, py) - connRadius + Math.abs(cy - py) * 0.1,
            Math.abs(cx - px) + connRadius * 2 - Math.abs(cx - px) * 0.2,
            Math.abs(cy - py) + connRadius * 2 - Math.abs(cy - py) * 0.2
          );
        }
      }

      // Re-draw the circle on top of connector
      ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
      ctx.globalAlpha = isTail ? 0.7 : 1;
      ctx.beginPath();
      ctx.arc(cx, cy, clampedRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Head details: eyes
      if (isHead) {
        const eyeOffset = CELL_SIZE * 0.18;
        const eyeRadius = CELL_SIZE * 0.1;
        const pupilRadius = CELL_SIZE * 0.05;
        let ex1, ey1, ex2, ey2;

        if (dir.x === 1) { // right
          ex1 = cx + eyeOffset * 0.5; ey1 = cy - eyeOffset;
          ex2 = cx + eyeOffset * 0.5; ey2 = cy + eyeOffset;
        } else if (dir.x === -1) { // left
          ex1 = cx - eyeOffset * 0.5; ey1 = cy - eyeOffset;
          ex2 = cx - eyeOffset * 0.5; ey2 = cy + eyeOffset;
        } else if (dir.y === -1) { // up
          ex1 = cx - eyeOffset; ey1 = cy - eyeOffset * 0.5;
          ex2 = cx + eyeOffset; ey2 = cy - eyeOffset * 0.5;
        } else { // down
          ex1 = cx - eyeOffset; ey1 = cy + eyeOffset * 0.5;
          ex2 = cx + eyeOffset; ey2 = cy + eyeOffset * 0.5;
        }

        // Eye whites
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(ex1, ey1, eyeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2, ey2, eyeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Pupils (shifted toward direction)
        ctx.fillStyle = "#1a1a1a";
        ctx.beginPath();
        ctx.arc(ex1 + dir.x * pupilRadius * 0.5, ey1 + dir.y * pupilRadius * 0.5, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex2 + dir.x * pupilRadius * 0.5, ey2 + dir.y * pupilRadius * 0.5, pupilRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, []);

  const tick = useCallback(() => {
    // Process direction queue
    if (dirQueue.current.length > 0) {
      const next = dirQueue.current.shift();
      // Prevent 180 degree turns
      if (
        next.x !== -direction.current.x ||
        next.y !== -direction.current.y
      ) {
        direction.current = next;
      }
    }

    const head = snake.current[0];
    const newHead = {
      x: (head.x + direction.current.x + GRID_W) % GRID_W,
      y: (head.y + direction.current.y + GRID_H) % GRID_H,
    };

    // Self collision (only way to die)
    if (snake.current.some((s) => s.x === newHead.x && s.y === newHead.y)) {
      endGame();
      return;
    }

    snake.current.unshift(newHead);

    // Eat food
    if (newHead.x === food.current.x && newHead.y === food.current.y) {
      scoreRef.current += 10;
      setScore(scoreRef.current);
      food.current = randomFood(snake.current);
      // Speed up slightly every 50 points
      if (scoreRef.current % 50 === 0) {
        setSpeed((s) => Math.max(60, s - 10));
      }
    } else {
      snake.current.pop();
    }

    draw();
  }, [draw]);

  const endGame = useCallback(() => {
    clearInterval(gameLoop.current);
    gameLoop.current = null;
    setGameState("over");
    if (scoreRef.current > highScore) {
      setHighScore(scoreRef.current);
      localStorage.setItem("snake-highscore", String(scoreRef.current));
    }
  }, [highScore]);

  const startGame = useCallback(() => {
    snake.current = [{ x: 15, y: 15 }];
    direction.current = { x: 1, y: 0 };
    dirQueue.current = [];
    food.current = randomFood(snake.current);
    scoreRef.current = 0;
    setScore(0);
    setSpeed(120);
    setGameState("playing");
    draw();
  }, [draw]);

  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      clearInterval(gameLoop.current);
      gameLoop.current = null;
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
  }, [gameState]);

  // Game loop — restart interval whenever speed or gameState changes
  useEffect(() => {
    if (gameState === "playing") {
      clearInterval(gameLoop.current);
      gameLoop.current = setInterval(tick, speed);
    }
    return () => clearInterval(gameLoop.current);
  }, [gameState, speed, tick]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      const dir = DIRECTIONS[e.key];
      if (dir) {
        e.preventDefault();
        if (gameState === "idle" || gameState === "over") {
          startGame();
        }
        if (gameState === "playing" || gameState === "idle" || gameState === "over") {
          dirQueue.current.push(dir);
        }
      }

      if (e.key === " " || e.key === "Escape") {
        e.preventDefault();
        if (gameState === "idle" || gameState === "over") {
          startGame();
        } else {
          togglePause();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, startGame, togglePause]);

  // Touch/swipe controls for mobile
  const touchStart = useRef(null);
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStart.current.x;
    const dy = touch.clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 20) {
      // Tap — start or pause
      if (gameState === "idle" || gameState === "over") {
        startGame();
      } else {
        togglePause();
      }
      return;
    }

    let dir;
    if (absDx > absDy) {
      dir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      dir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }

    if (gameState === "idle" || gameState === "over") {
      startGame();
    }
    dirQueue.current.push(dir);
    touchStart.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: CANVAS_W }}>
      {/* Score bar */}
      <div className="w-full flex items-center justify-between">
        <div className="text-sm text-accent-muted">
          Score: <span className="text-white font-mono">{score}</span>
        </div>
        <div className="text-sm text-accent-muted">
          Best: <span className="text-accent font-mono">{highScore}</span>
        </div>
      </div>

      {/* Game canvas */}
      <div
        className="relative rounded-lg overflow-hidden border border-border w-full"
        style={{ maxWidth: CANVAS_W, aspectRatio: `${GRID_W} / ${GRID_H}`, cursor: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="block"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />

        {/* Overlay states */}
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white mb-2">Snake</div>
            <div className="text-sm text-accent-muted mb-6">
              A classic, reimagined.
            </div>
            <button
              onClick={startGame}
              className="px-6 py-2.5 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-black transition-all duration-200"
            >
              PLAY
            </button>
            <div className="mt-4 text-xs text-accent-muted">
              <span className="hidden md:inline">Arrow keys or WASD to move &middot; Space to pause</span>
              <span className="md:hidden">Swipe to move &middot; Tap to pause</span>
            </div>
          </div>
        )}

        {gameState === "paused" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-4">Paused</div>
            <button
              onClick={togglePause}
              className="px-6 py-2.5 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-black transition-all duration-200"
            >
              RESUME
            </button>
          </div>
        )}

        {gameState === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-xl font-bold text-white mb-1">Game Over</div>
            <div className="text-sm text-accent-muted mb-1">
              Score: <span className="text-accent font-mono">{score}</span>
            </div>
            {score >= highScore && score > 0 && (
              <div className="text-xs text-accent mb-3">New high score!</div>
            )}
            <button
              onClick={startGame}
              className="mt-2 px-6 py-2.5 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-black transition-all duration-200"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile D-pad */}
      <div className="md:hidden grid grid-cols-3 gap-2 w-36">
        <div />
        <button
          onTouchStart={() => dirQueue.current.push({ x: 0, y: -1 })}
          className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2 L8 14 M3 7 L8 2 L13 7" /></svg>
        </button>
        <div />
        <button
          onTouchStart={() => dirQueue.current.push({ x: -1, y: 0 })}
          className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8 L14 8 M7 3 L2 8 L7 13" /></svg>
        </button>
        <button
          onTouchStart={() => {
            if (gameState === "idle" || gameState === "over") startGame();
            else togglePause();
          }}
          className="h-12 border border-border rounded flex items-center justify-center text-xs text-accent-muted active:bg-dark-tertiary active:text-white"
        >
          {gameState === "playing" ? "||" : "GO"}
        </button>
        <button
          onTouchStart={() => dirQueue.current.push({ x: 1, y: 0 })}
          className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8 L14 8 M9 3 L14 8 L9 13" /></svg>
        </button>
        <div />
        <button
          onTouchStart={() => dirQueue.current.push({ x: 0, y: 1 })}
          className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2 L8 14 M3 9 L8 14 L13 9" /></svg>
        </button>
        <div />
      </div>
    </div>
  );
}
