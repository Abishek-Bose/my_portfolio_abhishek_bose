"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sSlide, sMerge, s2048Lose, s2048Win } from "@/lib/sound";
import { usePersistentNumber } from "@/lib/usePersistentNumber";

const SIZE = 4;

// Value ramp climbs the brand: near-ink → forest → spring green → acid citron.
// Low tiles stay quiet so the board reads calm; 2048 lands on the brightest
// color in the system, so the win tile is the loudest thing on screen.
const TILE_COLORS = {
  0: { bg: "#121218", fg: "transparent" },
  2: { bg: "#151d17", fg: "#c9d2c4" },
  4: { bg: "#18271c", fg: "#d7dfd2" },
  8: { bg: "#173420", fg: "#e7efe2" },
  16: { bg: "#16452a", fg: "#eaf3e5" },
  32: { bg: "#0f5c39", fg: "#ffffff" },
  64: { bg: "#0a8a58", fg: "#ffffff" },
  128: { bg: "#1aa34a", fg: "#060609" },
  256: { bg: "#35b534", fg: "#060609" },
  512: { bg: "#57c122", fg: "#060609" },
  1024: { bg: "#9bd419", fg: "#060609" },
  2048: { bg: "#e9f52b", fg: "#060609" },
  4096: { bg: "#f3fa7a", fg: "#060609" },
};

const tileColor = (v) => TILE_COLORS[v] || { bg: "#f3fa7a", fg: "#060609" };
const fontSize = (v) => {
  if (v >= 1024) return "clamp(0.9rem, 4.5vw, 1.5rem)";
  if (v >= 128) return "clamp(1rem, 5vw, 1.75rem)";
  return "clamp(1.2rem, 6vw, 2.2rem)";
};

const emptyBoard = () =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const cloneBoard = (b) => b.map((row) => row.slice());

const addRandomTile = (board) => {
  const empties = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) empties.push([r, c]);
    }
  }
  if (empties.length === 0) return board;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const next = cloneBoard(board);
  next[r][c] = Math.random() < 0.9 ? 2 : 4;
  return next;
};

const slideRow = (row) => {
  const filtered = row.filter((v) => v !== 0);
  let gained = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      gained += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < SIZE) filtered.push(0);
  return { row: filtered, gained };
};

const rotateCW = (board) => {
  const next = emptyBoard();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      next[c][SIZE - 1 - r] = board[r][c];
    }
  }
  return next;
};

const rotateCCW = (board) => {
  const next = emptyBoard();
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      next[SIZE - 1 - c][r] = board[r][c];
    }
  }
  return next;
};

const move = (board, dir) => {
  // Normalize to "slide left", rotate as needed
  let b = cloneBoard(board);
  if (dir === "up") b = rotateCCW(b);
  else if (dir === "right") {
    b = b.map((row) => row.slice().reverse());
  } else if (dir === "down") b = rotateCW(b);

  let gained = 0;
  let changed = false;
  const next = b.map((row) => {
    const { row: slid, gained: g } = slideRow(row);
    gained += g;
    if (!changed && slid.some((v, i) => v !== row[i])) changed = true;
    return slid;
  });

  // Un-rotate
  let final = next;
  if (dir === "up") final = rotateCW(final);
  else if (dir === "right") final = final.map((row) => row.slice().reverse());
  else if (dir === "down") final = rotateCCW(final);

  return { board: final, gained, changed };
};

const hasMoves = (board) => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
      if (c + 1 < SIZE && board[r][c] === board[r][c + 1]) return true;
      if (r + 1 < SIZE && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
};

const startBoard = () => addRandomTile(addRandomTile(emptyBoard()));

export default function Game2048() {
  const [board, setBoard] = useState(startBoard);
  const [score, setScore] = useState(0);
  const [best, setBest] = usePersistentNumber("2048-best", 0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const touchStart = useRef(null);

  useEffect(() => {
    if (score > best) setBest(score);
  }, [score, best, setBest]);

  const tryMove = useCallback(
    (dir) => {
      if (gameOver) return;
      setBoard((prev) => {
        const { board: next, gained, changed } = move(prev, dir);
        if (!changed) return prev;
        if (gained > 0) {
          const maxMerged = Math.max(...next.flat());
          sMerge(maxMerged);
        } else {
          sSlide();
        }
        const withTile = addRandomTile(next);
        setScore((s) => s + gained);
        if (!won && withTile.some((row) => row.some((v) => v >= 2048))) {
          setWon(true);
          s2048Win();
        }
        if (!hasMoves(withTile)) {
          setGameOver(true);
          s2048Lose();
        }
        return withTile;
      });
    },
    [gameOver, won]
  );

  const reset = () => {
    setBoard(startBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  useEffect(() => {
    const handleKey = (e) => {
      const map = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const dir = map[e.key];
      if (dir) {
        e.preventDefault();
        tryMove(dir);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [tryMove]);

  const handleTouchStart = (e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const handleTouchEnd = (e) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    touchStart.current = null;
    if (Math.max(absDx, absDy) < 20) return;
    if (absDx > absDy) tryMove(dx > 0 ? "right" : "left");
    else tryMove(dy > 0 ? "down" : "up");
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: 500 }}>
      {/* Score bar */}
      <div className="w-full flex items-center justify-between">
        <div className="text-sm text-accent-muted">
          Score: <span className="text-white font-mono">{score}</span>
        </div>
        <div className="text-sm text-accent-muted">
          Best: <span className="text-accent font-mono">{best}</span>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative w-full rounded-lg border border-border p-3 bg-dark-secondary"
        style={{ aspectRatio: "1 / 1", touchAction: "none" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="grid grid-cols-4 grid-rows-4 gap-2 w-full h-full">
          {board.flat().map((value, i) => {
            const { bg, fg } = tileColor(value);
            return (
              <div
                key={i}
                className="rounded-md flex items-center justify-center font-bold transition-all duration-150"
                style={{
                  background: bg,
                  color: fg,
                  fontSize: fontSize(value),
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                }}
              >
                {value !== 0 && value}
              </div>
            );
          })}
        </div>

        {(gameOver || won) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <div className="text-2xl font-bold text-white mb-1">
              {won && !gameOver ? "You won!" : "Game Over"}
            </div>
            <div className="text-sm text-accent-muted mb-4">
              Score: <span className="text-accent font-mono">{score}</span>
            </div>
            <button
              onClick={reset}
              className="px-6 py-2.5 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-black transition-all duration-200"
            >
              {won && !gameOver ? "KEEP GOING" : "PLAY AGAIN"}
            </button>
          </div>
        )}
      </div>

      {/* Controls hint + restart */}
      <div className="w-full flex items-center justify-between">
        <div className="text-xs text-accent-muted">
          <span className="hidden md:inline">Arrow keys or WASD</span>
          <span className="md:hidden">Swipe to move</span>
        </div>
        <button
          onClick={reset}
          className="text-xs tracking-wider text-accent-muted hover:text-accent transition-colors"
        >
          NEW GAME
        </button>
      </div>
    </div>
  );
}
