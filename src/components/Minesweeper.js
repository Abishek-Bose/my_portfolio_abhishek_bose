"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sReveal, sFlag, sBoom, sMineWin } from "@/lib/sound";
import { usePersistentNumber } from "@/lib/usePersistentNumber";

const ROWS = 10;
const COLS = 10;
const MINES = 15;

// Low counts sit in the brand ramp, high counts escalate into warning hues —
// adjacent numbers must stay tellable apart at a glance, so hue moves every step.
const NUM_COLORS = {
  1: "#57c122",
  2: "#9bd419",
  3: "#e9f52b",
  4: "#ffc53d",
  5: "#ff9f45",
  6: "#ff6b6b",
  7: "#ff5577",
  8: "#ff4499",
};

const makeEmptyBoard = () =>
  Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      r,
      c,
      mine: false,
      revealed: false,
      flagged: false,
      neighbors: 0,
    }))
  );

const inBounds = (r, c) => r >= 0 && r < ROWS && c >= 0 && c < COLS;

const neighborsOf = (r, c) => {
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      if (inBounds(r + dr, c + dc)) out.push([r + dr, c + dc]);
    }
  }
  return out;
};

const placeMines = (board, safeR, safeC) => {
  // Don't place a mine on or adjacent to the first clicked cell
  const forbidden = new Set();
  forbidden.add(`${safeR},${safeC}`);
  neighborsOf(safeR, safeC).forEach(([r, c]) => forbidden.add(`${r},${c}`));

  const candidates = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!forbidden.has(`${r},${c}`)) candidates.push([r, c]);
    }
  }

  // Shuffle and take first N
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  const chosen = candidates.slice(0, MINES);

  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  chosen.forEach(([r, c]) => {
    next[r][c].mine = true;
  });

  // Compute neighbor counts
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (next[r][c].mine) continue;
      next[r][c].neighbors = neighborsOf(r, c).filter(
        ([nr, nc]) => next[nr][nc].mine
      ).length;
    }
  }
  return next;
};

const floodReveal = (board, r, c) => {
  const next = board.map((row) => row.map((cell) => ({ ...cell })));
  const stack = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop();
    const cell = next[cr][cc];
    if (cell.revealed || cell.flagged || cell.mine) continue;
    cell.revealed = true;
    if (cell.neighbors === 0) {
      neighborsOf(cr, cc).forEach(([nr, nc]) => {
        if (!next[nr][nc].revealed) stack.push([nr, nc]);
      });
    }
  }
  return next;
};

const revealAllMines = (board) =>
  board.map((row) =>
    row.map((cell) => (cell.mine ? { ...cell, revealed: true } : cell))
  );

const checkWin = (board) => {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell.mine && !cell.revealed) return false;
    }
  }
  return true;
};

export default function Minesweeper() {
  const [board, setBoard] = useState(makeEmptyBoard);
  const [started, setStarted] = useState(false);
  const [gameState, setGameState] = useState("playing"); // playing | won | lost
  const [flagsLeft, setFlagsLeft] = useState(MINES);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = usePersistentNumber("minesweeper-best", null);
  const startTime = useRef(null);
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);

  // Timer
  useEffect(() => {
    if (gameState !== "playing" || !started) return;
    const id = setInterval(() => {
      if (startTime.current) {
        setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
      }
    }, 500);
    return () => clearInterval(id);
  }, [gameState, started]);

  const reset = () => {
    setBoard(makeEmptyBoard());
    setStarted(false);
    setGameState("playing");
    setFlagsLeft(MINES);
    setElapsed(0);
    startTime.current = null;
  };

  const reveal = useCallback(
    (r, c) => {
      if (gameState !== "playing") return;
      setBoard((prev) => {
        let working = prev;
        if (!started) {
          working = placeMines(working, r, c);
          setStarted(true);
          startTime.current = Date.now();
        }
        const cell = working[r][c];
        if (cell.revealed || cell.flagged) return working;
        if (cell.mine) {
          sBoom();
          setGameState("lost");
          return revealAllMines(working).map((row, rr) =>
            row.map((c2, cc) =>
              rr === r && cc === c ? { ...c2, revealed: true, exploded: true } : c2
            )
          );
        }
        sReveal();
        const next = floodReveal(working, r, c);
        if (checkWin(next)) {
          setGameState("won");
          sMineWin();
          const t = Math.floor((Date.now() - startTime.current) / 1000);
          setElapsed(t);
          if (best === null || t < best) {
            setBest(t);
          }
        }
        return next;
      });
    },
    [gameState, started, best, setBest]
  );

  const toggleFlag = useCallback(
    (r, c) => {
      if (gameState !== "playing" || !started) return;
      setBoard((prev) => {
        const cell = prev[r][c];
        if (cell.revealed) return prev;
        const next = prev.map((row) => row.map((x) => ({ ...x })));
        const newFlag = !cell.flagged;
        next[r][c].flagged = newFlag;
        setFlagsLeft((f) => f + (newFlag ? -1 : 1));
        sFlag();
        return next;
      });
    },
    [gameState, started]
  );

  const handleCellClick = (r, c) => {
    if (longPressFired.current) {
      longPressFired.current = false;
      return;
    }
    reveal(r, c);
  };

  const handleContextMenu = (e, r, c) => {
    e.preventDefault();
    toggleFlag(r, c);
  };

  const handleTouchStart = (r, c) => {
    longPressFired.current = false;
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      toggleFlag(r, c);
    }, 350);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: 500 }}>
      {/* Stats bar */}
      <div className="w-full flex items-center justify-between text-sm">
        <div className="text-accent-muted">
          Flags: <span className="text-white font-mono">{flagsLeft}</span>
        </div>
        <div className="text-accent-muted">
          Time: <span className="text-white font-mono">{formatTime(elapsed)}</span>
        </div>
        <div className="text-accent-muted">
          Best: <span className="text-accent font-mono">{best !== null ? formatTime(best) : "—"}</span>
        </div>
      </div>

      {/* Board */}
      <div
        className="relative w-full rounded-lg border border-border p-2 bg-dark-secondary"
        style={{ aspectRatio: "1 / 1", touchAction: "manipulation" }}
      >
        <div
          className="grid w-full h-full gap-[2px]"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
        >
          {board.flat().map((cell) => {
            const { r, c, revealed, flagged, mine, neighbors } = cell;
            const exploded = cell.exploded;
            const numColor = NUM_COLORS[neighbors] || "#57c122";
            const base =
              "flex items-center justify-center rounded-[3px] font-mono font-bold select-none transition-colors";
            const bg = revealed
              ? exploded
                ? "bg-red-900/60"
                : "bg-dark"
              : "bg-dark-tertiary hover:bg-border";

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleContextMenu(e, r, c)}
                onTouchStart={() => handleTouchStart(r, c)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                className={`${base} ${bg} border border-border/60`}
                style={{
                  color: numColor,
                  fontSize: "clamp(0.7rem, 2.5vw, 1rem)",
                }}
                disabled={gameState !== "playing"}
              >
                {revealed
                  ? mine
                    ? "✱"
                    : neighbors > 0
                    ? neighbors
                    : ""
                  : flagged
                  ? <span style={{ color: "#e9f52b" }}>⚑</span>
                  : ""}
              </button>
            );
          })}
        </div>

        {gameState !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm rounded-lg">
            <div className="text-2xl font-bold text-white mb-1">
              {gameState === "won" ? "Cleared" : "Boom"}
            </div>
            <div className="text-sm text-accent-muted mb-4">
              {gameState === "won"
                ? `Time: ${formatTime(elapsed)}`
                : "You hit a mine."}
            </div>
            <button
              onClick={reset}
              className="px-6 py-2.5 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-black transition-all duration-200"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Controls hint + restart */}
      <div className="w-full flex items-center justify-between">
        <div className="text-xs text-accent-muted">
          <span className="hidden md:inline">Click to reveal &middot; Right-click to flag</span>
          <span className="md:hidden">Tap to reveal &middot; Long-press to flag</span>
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
