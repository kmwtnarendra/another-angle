"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import ToolShell from "../../components/ToolShell";

const EARTH_RADIUS_KM  = 6371;
const EARTH_ROTATION_S = 86400;
const MU_EARTH         = 398600.4418;

interface Satellite {
  name: string;
  rotationsPerDay: number;
  altitudeKm: number;
  semiMajorAxisKm: number;
  periodSec: number;
  color: string;
  initialPhase: number;
}

const PALETTE = ["#ff6600", "#ffd166", "#7cf5c4", "#9be7a8", "#ff7ab6", "#c4b5fd"];
function pickColor(i: number) { return PALETTE[i % PALETTE.length]; }

function semiMajor(T: number) {
  return Math.cbrt((MU_EARTH * T * T) / (4 * Math.PI * Math.PI));
}

function makeSat(name: string, rotationsPerDay: number, colorIdx: number): Satellite {
  const T = EARTH_ROTATION_S / rotationsPerDay;
  const a = semiMajor(T);
  return {
    name, rotationsPerDay,
    altitudeKm: a - EARTH_RADIUS_KM,
    semiMajorAxisKm: a,
    periodSec: T,
    color: pickColor(colorIdx),
    initialPhase: Math.random() * Math.PI * 2,
  };
}

export default function EarthSatelliteClient() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const simRef     = useRef({ simTime: 0, paused: false, dayDuration: 60 });
  const satsRef    = useRef<Satellite[]>([makeSat("ISS", 15.521, 0)]);

  const [dayDuration, setDayDuration] = useState(60);
  const [paused, setPaused]           = useState(false);
  const [stats, setStats]             = useState<Satellite[]>([...satsRef.current]);

  // keep refs in sync
  useEffect(() => { simRef.current.dayDuration = dayDuration; }, [dayDuration]);
  useEffect(() => { simRef.current.paused      = paused; },     [paused]);

  // ── canvas loop ────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr  = Math.max(1, window.devicePixelRatio || 1);
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    function getScale() {
      const base   = Math.min(canvas.clientWidth, canvas.clientHeight);
      const maxAlt = satsRef.current.length
        ? Math.max(...satsRef.current.map(s => s.altitudeKm))
        : 2000;
      const maxOrbit  = EARTH_RADIUS_KM + Math.max(maxAlt, 1000);
      const maxPxR    = Math.max(1, base * 0.46 - 24);
      return maxPxR / maxOrbit;
    }
    const kmToPx = (km: number) => km * getScale();

    function drawEarth(cx: number, cy: number) {
      const r = Math.max(1, kmToPx(EARTH_RADIUS_KM));
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((2 * Math.PI * simRef.current.simTime) / EARTH_ROTATION_S);

      const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
      g.addColorStop(0,   "#4fa9e6");
      g.addColorStop(0.7, "#015c92");
      g.addColorStop(1,   "#001d33");
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      // shading
      const shade = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.2, 0, 0, r);
      shade.addColorStop(0, "rgba(0,0,0,0)");
      shade.addColorStop(1, "rgba(0,0,0,0.4)");
      ctx.fillStyle = shade;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // latitude circles
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth   = 0.4;
      for (let lat = 15; lat < 90; lat += 15) {
        ctx.beginPath();
        ctx.arc(0, 0, r * Math.cos((lat * Math.PI) / 180), 0, Math.PI * 2);
        ctx.stroke();
      }
      // longitude lines
      for (let lon = 0; lon < 360; lon += 15) {
        const a = (lon * Math.PI) / 180;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(r * Math.cos(a), r * Math.sin(a));
        ctx.stroke();
      }
      // prime meridian
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.stroke();

      ctx.restore();
    }

    function drawSatellites(cx: number, cy: number) {
      for (const sat of satsRef.current) {
        const orbitPx = kmToPx(sat.semiMajorAxisKm);
        const omega   = (2 * Math.PI) / sat.periodSec;
        const angle   = omega * simRef.current.simTime + sat.initialPhase;

        // orbit ring
        ctx.beginPath();
        ctx.arc(cx, cy, orbitPx, 0, Math.PI * 2);
        ctx.strokeStyle = sat.name === "ISS"
          ? "rgba(255,100,50,0.3)"
          : "rgba(200,200,255,0.18)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const sx = cx + orbitPx * Math.cos(angle);
        const sy = cy + orbitPx * Math.sin(angle);

        // satellite body
        ctx.save();
        ctx.translate(sx, sy);
        ctx.fillStyle = sat.color;
        ctx.fillRect(-3, -3, 6, 6);
        ctx.fillStyle = "rgba(200,200,220,0.7)"; // solar panels
        ctx.fillRect(-12, -2, 9, 4);
        ctx.fillRect(3,   -2, 9, 4);
        ctx.restore();

        // label
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font      = "10px ui-sans-serif, sans-serif";
        ctx.fillText(sat.name, sx + 12, sy - 8);
      }
    }

    let last = 0, rafId = 0;

    function animate(ts: number) {
      if (!last) last = ts;
      const dtReal = (ts - last) / 1000;
      last = ts;

      if (!simRef.current.paused) {
        simRef.current.simTime +=
          (dtReal / simRef.current.dayDuration) * EARTH_ROTATION_S;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.clientWidth  / 2;
      const cy = canvas.clientHeight / 2;
      drawEarth(cx, cy);
      drawSatellites(cx, cy);

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    const statsInterval = setInterval(() => setStats([...satsRef.current]), 700);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(statsInterval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const addSatellite = useCallback(() => {
    const rotStr = prompt("Rotations per day (e.g. 1 = GEO, 15.5 = ISS-like):", "1");
    if (!rotStr) return;
    const rot = parseFloat(rotStr);
    if (isNaN(rot) || rot <= 0) { alert("Invalid number"); return; }
    const name = prompt("Satellite name:", `Sat${satsRef.current.length + 1}`) || `Sat${satsRef.current.length + 1}`;
    const sat  = makeSat(name, rot, satsRef.current.length);
    satsRef.current = [...satsRef.current, sat];
    setStats([...satsRef.current]);
  }, []);

  return (
    <ToolShell title="Earth Satellite Simulation" emoji="🛰️">
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "-0.5rem", lineHeight: 1.6 }}>
        Top-down view of Earth rotating with satellites in real orbital mechanics.
        The ISS orbits ~15.5 times per day; a geostationary satellite orbits exactly once.
        Add your own satellites and compare orbits at any speed.
      </p>

      {/* Controls */}
      <div className="card" style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", alignItems: "center" }}>
        <button
          className={`btn ${paused ? "btn-primary" : "btn-ghost"}`}
          onClick={() => setPaused(p => !p)}
          style={{ minWidth: 90 }}
        >
          {paused ? "▶ Play" : "⏸ Pause"}
        </button>

        <button className="btn btn-ghost" onClick={addSatellite}>
          + Add Satellite
        </button>

        <div className="field" style={{ flex: 1, minWidth: 200 }}>
          <label>Sim Speed — 1 Earth day = {dayDuration}s</label>
          <input type="range" min="5" max="300" step="5" value={dayDuration}
            onChange={e => setDayDuration(parseFloat(e.target.value))}
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
        aspectRatio: "16/9",
      }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      </div>

      {/* Stats table */}
      {stats.length > 0 && (
        <div>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem" }}>
            Active Satellites
          </h2>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Orbits / day</th>
                  <th>Altitude (km)</th>
                  <th>Orbital period</th>
                </tr>
              </thead>
              <tbody>
                {stats.map(sat => {
                  const displayPeriod = (sat.periodSec / EARTH_ROTATION_S) * dayDuration;
                  return (
                    <tr key={sat.name}>
                      <td style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: sat.color, display: "inline-block", flexShrink: 0 }} />
                        {sat.name}
                      </td>
                      <td>{sat.rotationsPerDay.toFixed(2)}</td>
                      <td>{sat.altitudeKm.toFixed(0).toLocaleString()}</td>
                      <td>{displayPeriod.toFixed(1)}s (sim)</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolShell>
  );
}
