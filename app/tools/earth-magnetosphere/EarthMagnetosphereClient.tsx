"use client";

import { useEffect, useRef, useState } from "react";
import ToolShell from "../../components/ToolShell";

export default function EarthMagnetosphereClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({ running: true, simSpeed: 1.0, windDensity: 1.0 });
  const [running, setRunning]   = useState(true);
  const [speed, setSpeed]       = useState(1.0);
  const [density, setDensity]   = useState(1.0);

  useEffect(() => { stateRef.current.simSpeed = speed; }, [speed]);
  useEffect(() => { stateRef.current.windDensity = density; }, [density]);
  useEffect(() => { stateRef.current.running = running; }, [running]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d", { alpha: true })!;
    const DPR    = window.devicePixelRatio || 1;

    // ── particles ──────────────────────────────────────────────────────────
    interface Particle {
      x: number; y: number; vx: number; vy: number;
      life: number; age: number; flare: boolean;
      color: string; size: number;
    }
    const particles: Particle[] = [];
    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    // ── layout values (recomputed each frame) ──────────────────────────────
    let sunX = 0, sunY = 0, earthX = 0, earthY = 0;
    let sunPx = 0, earthPx = 0;

    function layout() {
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      const scale = Math.min(w / 1200, 1);
      sunPx    = 70 * scale;
      earthPx  = 10 * scale;
      sunX     = 120 * scale;
      sunY     = h / 2;
      earthX   = sunX + Math.min(900, w * 0.6) * scale;
      earthY   = sunY;
    }

    function resizeCanvas() {
      const rect = canvas.getBoundingClientRect();
      canvas.width  = Math.max(600, Math.floor(rect.width  * DPR));
      canvas.height = Math.max(300, Math.floor(rect.height * DPR));
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      layout();
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const magnetopausePx = () => earthPx * 10;

    // ── spawn ───────────────────────────────────────────────────────────────
    function spawnWind(count = 6, flare = false) {
      for (let i = 0; i < count; i++) {
        const angle = rand(-0.35, 0.35);
        const sx  = sunX + Math.cos(angle) * sunPx;
        const sy  = sunY + Math.sin(angle) * sunPx;
        const spd = flare ? rand(220, 520) : rand(60, 140);
        particles.push({
          x: sx, y: sy,
          vx: spd + rand(-40, 40),
          vy: rand(-0.15, 0.15) * spd,
          life: rand(6, 12) * (flare ? 0.6 : 1),
          age: 0, flare,
          color: flare ? "#ffb86b" : "#9be7ff",
          size: flare ? rand(2.2, 3.2) : rand(1.0, 2.0),
        });
      }
    }

    // ── dipole field ────────────────────────────────────────────────────────
    function dipoleB(px: number, py: number) {
      let rx = (px - earthX) / earthPx;
      let ry = (py - earthY) / earthPx;
      let r  = Math.sqrt(rx * rx + ry * ry) || 0.01;
      const r5 = Math.pow(r, 5);
      return { Bx: (3 * rx * ry) / r5, By: (2 * ry * ry - rx * rx) / r5, r };
    }

    // ── draw helpers ────────────────────────────────────────────────────────
    function drawSun(t: number) {
      const pulse = 0.95 + 0.05 * Math.sin(t * 0.0012);
      const r     = sunPx * (1 + 0.01 * Math.sin(t * 0.002));
      const g     = ctx.createRadialGradient(sunX, sunY, r * 0.2, sunX, sunY, r);
      g.addColorStop(0,   `rgba(255,240,200,${0.95 * pulse})`);
      g.addColorStop(0.4, `rgba(255,200,80,${0.85 * pulse})`);
      g.addColorStop(0.8, `rgba(255,120,30,${0.6 * pulse})`);
      g.addColorStop(1,   `rgba(255,60,0,${0.25 * pulse})`);
      ctx.beginPath();
      ctx.arc(sunX, sunY, r, 0, Math.PI * 2);
      ctx.fillStyle    = g;
      ctx.shadowBlur   = 20;
      ctx.shadowColor  = "rgba(255,150,40,0.6)";
      ctx.fill();
      ctx.shadowBlur   = 0;

      for (let i = 0; i < 12; i++) {
        const a  = Math.random() * Math.PI * 2;
        const rr = r * (0.2 + Math.random() * 0.7);
        ctx.fillStyle = `rgba(255,${140 + Math.random() * 80},40,${0.15 + Math.random() * 0.25})`;
        ctx.fillRect(sunX + Math.cos(a) * rr, sunY + Math.sin(a) * rr, 1.5, 1.5);
      }
    }

    function drawCorona(t: number) {
      const pulse  = 0.98 + 0.02 * Math.sin(t * 0.0008);
      const cR     = sunPx * 1.55 * pulse;
      const g      = ctx.createRadialGradient(sunX, sunY, sunPx, sunX, sunY, cR);
      g.addColorStop(0,   "rgba(255,220,150,0.25)");
      g.addColorStop(0.6, "rgba(255,200,120,0.12)");
      g.addColorStop(1,   "rgba(255,200,120,0)");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.beginPath();
      ctx.arc(sunX, sunY, cR, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const fl = 0.85 + 0.15 * Math.sin(t * 0.001 + i * 2.1);
        ctx.strokeStyle = "rgba(255,200,120,0.15)";
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(sunX + Math.cos(a) * sunPx * 1.1, sunY + Math.sin(a) * sunPx * 1.1);
        ctx.lineTo(sunX + Math.cos(a) * sunPx * (1.4 + 0.25 * fl), sunY + Math.sin(a) * sunPx * (1.4 + 0.25 * fl));
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawFieldLines() {
      ctx.save();
      ctx.translate(earthX, earthY);
      ctx.lineWidth   = 1;
      ctx.strokeStyle = "rgba(160,230,255,0.45)";
      for (const L of [1.5, 2, 3, 4, 6, 8, 10]) {
        ctx.beginPath();
        for (const dir of [-1, 1] as const) {
          let x = L * earthPx, y = 0;
          ctx.moveTo(x, y);
          for (let i = 0; i < 400; i++) {
            const { Bx, By } = dipoleB(earthX + x, earthY + y);
            const Bm = Math.sqrt(Bx * Bx + By * By) || 1;
            x += (Bx / Bm) * dir * 0.05 * earthPx;
            y += (By / Bm) * dir * 0.05 * earthPx;
            if (x < 0) x *= 0.98; else x *= 1.002;
            ctx.lineTo(x, y);
            if (Math.abs(x) > 20 * earthPx || Math.abs(y) > 20 * earthPx) break;
          }
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawFrame() {
      layout();
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);

      // static starfield
      for (let s = 0; s < 60; s++) {
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.fillRect((s * 97) % w, ((s * 59) + 37) % h, 1, 1);
      }

      const t = performance.now();
      drawCorona(t);
      drawSun(t);

      ctx.globalAlpha = 0.85;
      for (const p of particles) {
        ctx.beginPath();
        ctx.fillStyle   = p.color;
        ctx.globalAlpha = p.flare ? 0.92 : 0.8;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      const mp = magnetopausePx();
      ctx.beginPath();
      ctx.fillStyle = "rgba(100,220,255,0.02)";
      ctx.ellipse(earthX - mp * 0.6, earthY, mp * 1.4, mp * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.lineWidth   = 2;
      ctx.strokeStyle = "rgba(120,210,255,0.35)";
      ctx.ellipse(earthX - mp * 0.3, earthY, mp, mp * 0.9, 0, -Math.PI / 2.6, Math.PI / 2.6);
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.globalCompositeOperation = "lighter";
      drawFieldLines();
      ctx.globalCompositeOperation = "source-over";

      // atmosphere glow
      ctx.beginPath();
      ctx.fillStyle = "rgba(150,230,255,0.06)";
      ctx.arc(earthX, earthY, earthPx * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Earth
      ctx.beginPath();
      ctx.fillStyle = "#0b5a8b";
      ctx.arc(earthX, earthY, earthPx, 0, Math.PI * 2);
      ctx.fill();

      // highlight
      ctx.beginPath();
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      ctx.arc(earthX - earthPx * 0.4, earthY - earthPx * 0.5, earthPx * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── main loop ───────────────────────────────────────────────────────────
    let lastT    = performance.now();
    let lastFlare = 0;
    let flareCooldown = 8 + Math.random() * 12;
    let rafId    = 0;

    for (let i = 0; i < 120; i++) spawnWind(1, false);

    function update(now: number) {
      const { running, simSpeed, windDensity } = stateRef.current;
      const dt = Math.min(0.04, (now - lastT) / 1000) * simSpeed;
      lastT = now;

      if (running) {
        if (Math.random() < 0.8) spawnWind(Math.round(3 * windDensity));
        lastFlare += dt;
        if (lastFlare > flareCooldown) {
          for (let i = 0; i < 40; i++) spawnWind(1, true);
          lastFlare = 0;
          flareCooldown = 10 + Math.random() * 18;
        }
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.age += dt;
          if (p.age > p.life) { particles.splice(i, 1); continue; }
          const dx   = p.x - earthX, dy = p.y - earthY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < magnetopausePx() * 1.05) {
            const { Bx, By, r } = dipoleB(p.x, p.y);
            const Bm  = Math.sqrt(Bx * Bx + By * By) || 1;
            const Bnx = Bx / Bm, Bny = By / Bm;
            const def = 15 * (p.flare ? 2 : 1) * simSpeed;
            const vxN = p.vx * 0.99 + (p.vy * Bnx - p.vx * Bny) * def * dt;
            const vyN = p.vy * 0.99 + (-p.vx * Bnx + p.vy * Bny) * def * dt;
            p.vx = vxN * (1 - 0.002 * (1.2 - dist / magnetopausePx()));
            p.vy = vyN * (1 - 0.002 * (1.2 - dist / magnetopausePx()));
            if (r < 1.8) {
              const pole = p.y < earthY ? -1 : 1;
              p.vx += (dx / r) * -20 * dt;
              p.vy += (pole * 60 - p.vy) * 0.05 * dt;
              p.color = "#ffd6e0";
            }
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
      }

      drawFrame();
      rafId = requestAnimationFrame(update);
    }

    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  const triggerFlare = () => {
    // signal via a custom event the loop picks up — simpler than a ref callback
    window.dispatchEvent(new CustomEvent("aa:flare"));
  };

  // wire manual flare into the loop via event
  useEffect(() => {
    const handler = () => {
      // accessed inside the closure — re-dispatch is the cleanest bridge
    };
    window.addEventListener("aa:flare", handler);
    return () => window.removeEventListener("aa:flare", handler);
  }, []);

  return (
    <ToolShell title="Earth Magnetosphere" emoji="🧲">
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "-0.5rem", lineHeight: 1.6 }}>
        Real-time simulation of the solar wind interacting with Earth&apos;s magnetic field.
        Charged particles from the Sun are deflected by the magnetosphere — some funnel
        toward the poles, creating auroras.
      </p>

      {/* Controls */}
      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center" }}>
        <button
          className={`btn ${running ? "btn-ghost" : "btn-primary"}`}
          onClick={() => setRunning(r => !r)}
          style={{ minWidth: 90 }}
        >
          {running ? "⏸ Pause" : "▶ Play"}
        </button>

        <button className="btn btn-ghost" onClick={() => {
          // flare: temporarily boost density
          setDensity(d => { setTimeout(() => setDensity(d), 1500); return 8; });
        }}>
          ☀️ Solar Flare
        </button>

        <div className="field" style={{ flex: 1, minWidth: 160 }}>
          <label>Sim Speed — {speed.toFixed(1)}×</label>
          <input type="range" min="0.2" max="4" step="0.1" value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            style={{ accentColor: "var(--accent)" }} />
        </div>

        <div className="field" style={{ flex: 1, minWidth: 160 }}>
          <label>Wind Density — {density.toFixed(1)}×</label>
          <input type="range" min="0.2" max="4" step="0.1" value={density}
            onChange={e => setDensity(parseFloat(e.target.value))}
            style={{ accentColor: "var(--accent)" }} />
        </div>

        <button className="btn btn-ghost" onClick={() => {
          const el = document.documentElement;
          if (!document.fullscreenElement) el.requestFullscreen();
          else document.exitFullscreen();
        }}>
          ⛶ Fullscreen
        </button>
      </div>

      {/* Canvas */}
      <div style={{
        background: "#000",
        borderRadius: 12,
        border: "1px solid var(--border)",
        overflow: "hidden",
        width: "100%",
        aspectRatio: "16/7",
      }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* Legend */}
      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
        {[
          ["🟡", "Sun / Corona"],
          ["🔵", "Earth"],
          ["💠", "Magnetic field lines"],
          ["🩵", "Solar wind particles"],
          ["🟠", "Solar flare particles"],
          ["🩷", "Auroral zone (poles)"],
        ].map(([icon, label]) => (
          <span key={label}>{icon} {label}</span>
        ))}
      </div>
    </ToolShell>
  );
}
