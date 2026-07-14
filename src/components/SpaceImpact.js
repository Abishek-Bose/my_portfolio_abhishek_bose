"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { sShoot, sEnemyHit, sPlayerHit, sSpaceOver } from "@/lib/sound";
import { usePersistentNumber } from "@/lib/usePersistentNumber";

const W = 500;
const H = 320;
const PLAYER_W = 20;
const PLAYER_H = 14;
const BULLET_W = 6;
const BULLET_H = 2;
const ENEMY_W = 18;
const ENEMY_H = 18;

const PLAYER_SPEED = 220;
const BULLET_SPEED = 460;
const ENEMY_BULLET_SPEED = 260;
const SHOOT_COOLDOWN = 220;

const initialState = () => ({
  player: { x: 40, y: H / 2 - PLAYER_H / 2, invincibleUntil: 0 },
  bullets: [],
  enemies: [],
  enemyBullets: [],
  stars: Array.from({ length: 30 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    speed: 20 + Math.random() * 60,
  })),
  lastEnemySpawn: 0,
  lastShot: 0,
  time: 0,
  lastFrame: 0,
  score: 0,
  lives: 3,
});

export default function SpaceImpact() {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef(initialState());
  const keysRef = useRef({});

  const [gameState, setGameState] = useState("idle"); // idle | playing | over
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = usePersistentNumber("space-impact-highscore", 0);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const s = stateRef.current;

    // Background
    ctx.fillStyle = "#060609";
    ctx.fillRect(0, 0, W, H);

    // Stars
    ctx.fillStyle = "#23232e";
    s.stars.forEach((star) => {
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), 1, 1);
    });

    // Player (blinks while invincible)
    const blink = s.time < s.player.invincibleUntil && Math.floor(s.time / 80) % 2 === 0;
    if (!blink && s.lives > 0) {
      const { x, y } = s.player;
      ctx.fillStyle = "#57c122";
      ctx.fillRect(x, y + 4, 12, 6);
      ctx.fillRect(x + 6, y + 2, 10, 10);
      ctx.fillRect(x + 14, y + 5, 6, 4);
      ctx.fillRect(x, y, 4, 2);
      ctx.fillRect(x, y + 12, 4, 2);
      // Exhaust flicker
      if (Math.floor(s.time / 60) % 2 === 0) {
        ctx.fillStyle = "#e9f52b";
        ctx.fillRect(x - 4, y + 6, 4, 2);
      }
    }

    // Player bullets
    ctx.fillStyle = "#e9f52b";
    s.bullets.forEach((b) => ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H));

    // Enemy bullets — red stays the danger channel against the green player
    ctx.fillStyle = "#e53e3e";
    s.enemyBullets.forEach((b) => ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H));

    // Enemies (alien-ish pixel block) — same hue family as the player, darker value
    s.enemies.forEach((e) => {
      ctx.fillStyle = "#0a8a58";
      ctx.fillRect(e.x + 2, e.y + 2, ENEMY_W - 4, ENEMY_H - 4);
      ctx.fillRect(e.x, e.y + 6, ENEMY_W, ENEMY_H - 12);
      ctx.fillRect(e.x + 4, e.y, ENEMY_W - 8, ENEMY_H);
      // Eye
      ctx.fillStyle = "#060609";
      ctx.fillRect(e.x + 5, e.y + 7, 3, 3);
      ctx.fillRect(e.x + 10, e.y + 7, 3, 3);
    });
  }, []);

  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (s.time - s.lastShot < SHOOT_COOLDOWN) return;
    s.lastShot = s.time;
    s.bullets.push({
      x: s.player.x + PLAYER_W,
      y: s.player.y + PLAYER_H / 2 - BULLET_H / 2,
    });
    sShoot();
  }, []);

  const start = useCallback(() => {
    stateRef.current = initialState();
    stateRef.current.lastFrame = performance.now();
    setScore(0);
    setLives(3);
    setGameState("playing");
  }, []);

  // Keyboard
  useEffect(() => {
    const handleDown = (e) => {
      const k = e.key;
      const keys = keysRef.current;
      if (k === "ArrowUp" || k === "w" || k === "W") { keys.up = true; e.preventDefault(); }
      else if (k === "ArrowDown" || k === "s" || k === "S") { keys.down = true; e.preventDefault(); }
      else if (k === "ArrowLeft" || k === "a" || k === "A") { keys.left = true; e.preventDefault(); }
      else if (k === "ArrowRight" || k === "d" || k === "D") { keys.right = true; e.preventDefault(); }
      else if (k === " " || k === "Enter") {
        e.preventDefault();
        if (gameState === "idle" || gameState === "over") start();
        else if (gameState === "playing") shoot();
      }
    };
    const handleUp = (e) => {
      const k = e.key;
      const keys = keysRef.current;
      if (k === "ArrowUp" || k === "w" || k === "W") keys.up = false;
      else if (k === "ArrowDown" || k === "s" || k === "S") keys.down = false;
      else if (k === "ArrowLeft" || k === "a" || k === "A") keys.left = false;
      else if (k === "ArrowRight" || k === "d" || k === "D") keys.right = false;
    };
    window.addEventListener("keydown", handleDown);
    window.addEventListener("keyup", handleUp);
    return () => {
      window.removeEventListener("keydown", handleDown);
      window.removeEventListener("keyup", handleUp);
    };
  }, [gameState, start, shoot]);

  // Game loop
  useEffect(() => {
    if (gameState !== "playing") {
      draw();
      return;
    }
    const s = stateRef.current;
    s.lastFrame = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - s.lastFrame) / 1000, 0.05);
      s.lastFrame = now;
      s.time += dt * 1000;

      // Player movement
      const keys = keysRef.current;
      let vx = 0;
      let vy = 0;
      if (keys.up) vy -= 1;
      if (keys.down) vy += 1;
      if (keys.left) vx -= 1;
      if (keys.right) vx += 1;
      if (vx !== 0 && vy !== 0) {
        const inv = 1 / Math.SQRT2;
        vx *= inv;
        vy *= inv;
      }
      s.player.x = Math.max(0, Math.min(W - PLAYER_W, s.player.x + vx * PLAYER_SPEED * dt));
      s.player.y = Math.max(0, Math.min(H - PLAYER_H, s.player.y + vy * PLAYER_SPEED * dt));

      // Stars parallax
      s.stars.forEach((star) => {
        star.x -= star.speed * dt;
        if (star.x < 0) {
          star.x = W;
          star.y = Math.random() * H;
        }
      });

      // Spawn enemies (increasing difficulty)
      const difficulty = Math.floor(s.time / 8000);
      const spawnInterval = Math.max(500, 1200 - difficulty * 100);
      if (s.time - s.lastEnemySpawn > spawnInterval) {
        s.lastEnemySpawn = s.time;
        const speed = 60 + difficulty * 15 + Math.random() * 40;
        s.enemies.push({
          x: W,
          y: Math.random() * (H - ENEMY_H),
          vx: -speed,
          vy: (Math.random() - 0.5) * 40,
          shootTimer: 1200 + Math.random() * 1800,
        });
      }

      // Update bullets
      s.bullets = s.bullets
        .map((b) => ({ ...b, x: b.x + BULLET_SPEED * dt }))
        .filter((b) => b.x < W);

      // Update enemies
      s.enemies.forEach((e) => {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.y < 0) { e.y = 0; e.vy = Math.abs(e.vy); }
        if (e.y > H - ENEMY_H) { e.y = H - ENEMY_H; e.vy = -Math.abs(e.vy); }
        e.shootTimer -= dt * 1000;
        if (e.shootTimer <= 0 && e.x > 60 && e.x < W - 30) {
          e.shootTimer = 2000 + Math.random() * 2500;
          s.enemyBullets.push({
            x: e.x,
            y: e.y + ENEMY_H / 2 - BULLET_H / 2,
          });
        }
      });
      s.enemies = s.enemies.filter((e) => e.x + ENEMY_W > 0);

      // Enemy bullets
      s.enemyBullets = s.enemyBullets
        .map((b) => ({ ...b, x: b.x - ENEMY_BULLET_SPEED * dt }))
        .filter((b) => b.x + BULLET_W > 0);

      // Bullet -> enemy collision
      for (let bi = s.bullets.length - 1; bi >= 0; bi--) {
        const b = s.bullets[bi];
        for (let ei = s.enemies.length - 1; ei >= 0; ei--) {
          const e = s.enemies[ei];
          if (
            b.x < e.x + ENEMY_W &&
            b.x + BULLET_W > e.x &&
            b.y < e.y + ENEMY_H &&
            b.y + BULLET_H > e.y
          ) {
            s.bullets.splice(bi, 1);
            s.enemies.splice(ei, 1);
            s.score += 10;
            setScore(s.score);
            sEnemyHit();
            break;
          }
        }
      }

      // Player hit detection
      if (s.time > s.player.invincibleUntil) {
        const p = s.player;
        let hit = false;
        for (let ei = s.enemies.length - 1; ei >= 0; ei--) {
          const e = s.enemies[ei];
          if (
            p.x < e.x + ENEMY_W &&
            p.x + PLAYER_W > e.x &&
            p.y < e.y + ENEMY_H &&
            p.y + PLAYER_H > e.y
          ) {
            s.enemies.splice(ei, 1);
            hit = true;
            break;
          }
        }
        if (!hit) {
          for (let bi = s.enemyBullets.length - 1; bi >= 0; bi--) {
            const b = s.enemyBullets[bi];
            if (
              p.x < b.x + BULLET_W &&
              p.x + PLAYER_W > b.x &&
              p.y < b.y + BULLET_H &&
              p.y + PLAYER_H > b.y
            ) {
              s.enemyBullets.splice(bi, 1);
              hit = true;
              break;
            }
          }
        }
        if (hit) {
          s.lives -= 1;
          setLives(s.lives);
          sPlayerHit();
          s.player.invincibleUntil = s.time + 1500;
          if (s.lives <= 0) {
            setGameState("over");
            sSpaceOver();
            if (s.score > highScore) {
              setHighScore(s.score);
            }
            draw();
            return;
          }
        }
      }

      draw();
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameState, highScore, draw, setHighScore]);

  // Initial draw
  useEffect(() => {
    draw();
  }, [draw]);

  const setKey = (name, value) => {
    keysRef.current[name] = value;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full" style={{ maxWidth: W }}>
      {/* HUD */}
      <div className="w-full flex items-center justify-between text-sm">
        <div className="text-accent-muted">
          Score: <span className="text-white font-mono">{score}</span>
        </div>
        <div className="text-accent-muted flex items-center gap-1">
          Lives:
          <span className="text-accent font-mono ml-1">
            {Array.from({ length: Math.max(lives, 0) }).map((_, i) => (
              <span key={i}>♥</span>
            ))}
          </span>
        </div>
        <div className="text-accent-muted">
          Best: <span className="text-accent font-mono">{highScore}</span>
        </div>
      </div>

      {/* Canvas */}
      <div
        className="relative w-full rounded-lg overflow-hidden border border-border"
        style={{ maxWidth: W, aspectRatio: `${W} / ${H}`, cursor: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="block w-full h-full"
          style={{ touchAction: "none", imageRendering: "pixelated" }}
        />

        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white mb-1">Space Impact</div>
            <div className="text-sm text-accent-muted mb-5">Defend the quadrant.</div>
            <button
              onClick={start}
              className="px-6 py-2.5 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-black transition-all duration-200"
            >
              LAUNCH
            </button>
            <div className="mt-4 text-xs text-accent-muted text-center px-4">
              <span className="hidden md:inline">Arrows / WASD to move &middot; Space to shoot</span>
              <span className="md:hidden">D-pad to move &middot; FIRE to shoot</span>
            </div>
          </div>
        )}

        {gameState === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-2xl font-bold text-white mb-1">Game Over</div>
            <div className="text-sm text-accent-muted mb-1">
              Score: <span className="text-accent font-mono">{score}</span>
            </div>
            {score >= highScore && score > 0 && (
              <div className="text-xs text-accent mb-3">New high score!</div>
            )}
            <button
              onClick={start}
              className="mt-2 px-6 py-2.5 border border-accent text-accent text-sm tracking-wider hover:bg-accent hover:text-black transition-all duration-200"
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </div>

      {/* Mobile controls */}
      <div className="md:hidden w-full flex items-center justify-between" style={{ touchAction: "manipulation" }}>
        <div className="grid grid-cols-3 gap-2 w-36">
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); setKey("up", true); }}
            onTouchEnd={(e) => { e.preventDefault(); setKey("up", false); }}
            onTouchCancel={() => setKey("up", false)}
            className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2 L8 14 M3 7 L8 2 L13 7" /></svg>
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); setKey("left", true); }}
            onTouchEnd={(e) => { e.preventDefault(); setKey("left", false); }}
            onTouchCancel={() => setKey("left", false)}
            className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8 L14 8 M7 3 L2 8 L7 13" /></svg>
          </button>
          <div className="h-12 border border-border rounded opacity-30" />
          <button
            onTouchStart={(e) => { e.preventDefault(); setKey("right", true); }}
            onTouchEnd={(e) => { e.preventDefault(); setKey("right", false); }}
            onTouchCancel={() => setKey("right", false)}
            className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8 L14 8 M9 3 L14 8 L9 13" /></svg>
          </button>
          <div />
          <button
            onTouchStart={(e) => { e.preventDefault(); setKey("down", true); }}
            onTouchEnd={(e) => { e.preventDefault(); setKey("down", false); }}
            onTouchCancel={() => setKey("down", false)}
            className="h-12 border border-border rounded flex items-center justify-center text-accent-muted active:bg-dark-tertiary active:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2 L8 14 M3 9 L8 14 L13 9" /></svg>
          </button>
          <div />
        </div>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameState === "idle" || gameState === "over") start();
            else shoot();
          }}
          className="h-16 w-20 border border-accent rounded-full flex items-center justify-center text-accent text-xs tracking-widest active:bg-accent active:text-black"
        >
          FIRE
        </button>
      </div>
    </div>
  );
}
