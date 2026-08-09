"use client";

import { useEffect, useRef } from "react";

/**
 * Canvas fireworks for the sign-in brand panel.
 *
 * A real particle system rather than CSS keyframes: rockets launch from the
 * bottom of the panel, arc toward a target, then explode into particles that
 * carry velocity, gravity, friction and alpha decay. Trails come from fading
 * the previous frame with a `destination-out` fill instead of clearing it,
 * which is what gives the streaks their comet tail.
 *
 * Mouse: rockets aim at the cursor while it is over the panel, and a click
 * detonates a shell there immediately. The canvas is `pointer-events: none`,
 * so it never intercepts clicks meant for the page.
 *
 * Everything runs after mount on the client, so there is no server markup to
 * mismatch. The loop stops under prefers-reduced-motion and on unmount.
 */

/** Brand hues (HSL hue values): gold, saffron, violet, pink, magenta. */
const HUES = [45, 28, 275, 330, 300];

const TRAIL_LENGTH = 6;
const GRAVITY = 0.95;
const FRICTION = 0.965;
/** Hard ceiling so a long-idle tab can never accumulate unbounded work. */
const MAX_PARTICLES = 1400;

type Pt = [number, number];

class Rocket {
  x: number; y: number;
  sx: number; sy: number;
  tx: number; ty: number;
  distanceToTarget: number;
  distanceTravelled = 0;
  coords: Pt[] = [];
  angle: number;
  speed = 2.4;
  acceleration = 1.045;
  brightness: number;
  hue: number;

  constructor(sx: number, sy: number, tx: number, ty: number, hue: number) {
    this.x = this.sx = sx;
    this.y = this.sy = sy;
    this.tx = tx;
    this.ty = ty;
    this.hue = hue;
    this.distanceToTarget = Math.hypot(tx - sx, ty - sy);
    this.angle = Math.atan2(ty - sy, tx - sx);
    this.brightness = 50 + Math.random() * 20;
    for (let i = 0; i < TRAIL_LENGTH; i++) this.coords.push([sx, sy]);
  }

  /** Returns true when it has reached its target and should detonate. */
  update(): boolean {
    this.coords.pop();
    this.coords.unshift([this.x, this.y]);
    this.speed *= this.acceleration;
    const vx = Math.cos(this.angle) * this.speed;
    const vy = Math.sin(this.angle) * this.speed;
    this.distanceTravelled = Math.hypot(this.x + vx - this.sx, this.y + vy - this.sy);
    if (this.distanceTravelled >= this.distanceToTarget) return true;
    this.x += vx;
    this.y += vy;
    return false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const tail = this.coords[this.coords.length - 1];
    ctx.beginPath();
    ctx.moveTo(tail[0], tail[1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsl(${this.hue}, 100%, ${this.brightness}%)`;
    ctx.stroke();
  }
}

class Particle {
  x: number; y: number;
  coords: Pt[] = [];
  angle = Math.random() * Math.PI * 2;
  speed: number;
  friction = FRICTION;
  gravity = GRAVITY;
  hue: number;
  brightness: number;
  alpha = 1;
  decay: number;

  constructor(x: number, y: number, hue: number) {
    this.x = x;
    this.y = y;
    this.hue = hue + (Math.random() * 40 - 20);
    this.speed = Math.random() * 11 + 1;
    this.brightness = 55 + Math.random() * 25;
    this.decay = Math.random() * 0.012 + 0.011;
    for (let i = 0; i < TRAIL_LENGTH; i++) this.coords.push([x, y]);
  }

  /** Returns true once faded out. */
  update(): boolean {
    this.coords.pop();
    this.coords.unshift([this.x, this.y]);
    this.speed *= this.friction;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.alpha -= this.decay;
    return this.alpha <= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const tail = this.coords[this.coords.length - 1];
    ctx.beginPath();
    ctx.moveTo(tail[0], tail[1]);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
    ctx.stroke();
  }
}

export function Fireworks({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let raf = 0;
    let ticker = 0;
    /** Frames between auto-launches; shortens as the display warms up. */
    let launchEvery = 45;

    const rockets: Rocket[] = [];
    const particles: Particle[] = [];
    /** Cursor target, in canvas pixels. Null until the pointer enters. */
    let target: { x: number; y: number } | null = null;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = "round";
      ctx.lineWidth = 2;
    };
    resize();

    const explode = (x: number, y: number) => {
      const hue = HUES[Math.floor(Math.random() * HUES.length)];
      const count = 68 + Math.floor(Math.random() * 34);
      if (particles.length > MAX_PARTICLES) return;
      for (let i = 0; i < count; i++) particles.push(new Particle(x, y, hue));
    };

    const launch = (tx: number, ty: number) => {
      const hue = HUES[Math.floor(Math.random() * HUES.length)];
      rockets.push(new Rocket(width / 2, height, tx, ty, hue));
    };

    const loop = () => {
      raf = window.requestAnimationFrame(loop);

      // Fade the previous frame instead of clearing — this is the trail.
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      for (let i = rockets.length - 1; i >= 0; i--) {
        rockets[i].draw(ctx);
        if (rockets[i].update()) {
          explode(rockets[i].tx, rockets[i].ty);
          rockets.splice(i, 1);
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].draw(ctx);
        if (particles[i].update()) particles.splice(i, 1);
      }

      // Auto-launch: toward the cursor when present, else a random arc.
      if (ticker++ >= launchEvery) {
        ticker = 0;
        launchEvery = 38 + Math.floor(Math.random() * 34);
        if (target) {
          launch(target.x, target.y);
        } else {
          launch(
            width * (0.2 + Math.random() * 0.6),
            height * (0.15 + Math.random() * 0.4),
          );
        }
      }
    };

    const inside = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return null;
      return { x, y };
    };

    const onMove = (e: PointerEvent) => {
      target = inside(e);
    };
    const onDown = (e: PointerEvent) => {
      const p = inside(e);
      if (p) explode(p.x, p.y);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    raf = window.requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`pointer-events-none ${className}`}
    />
  );
}
