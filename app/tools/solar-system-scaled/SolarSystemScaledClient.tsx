"use client";

import { useEffect, useRef, useState } from "react";
import ToolShell from "../../components/ToolShell";

// ── Data ───────────────────────────────────────────────────────────────────
const SUN_D   = 1_391_000;
const EARTH_D = 12_742;

const PLANETS = [
  { name: "Mercury", diameter: 4_879,   color: "#b5b5b5", au: 0.39 },
  { name: "Venus",   diameter: 12_104,  color: "#e8d5a3", au: 0.72 },
  { name: "Earth",   diameter: 12_742,  color: "#2a6bd6", au: 1.00 },
  { name: "Mars",    diameter: 6_779,   color: "#c1440e", au: 1.52 },
  { name: "Jupiter", diameter: 139_820, color: "#c8a882", au: 5.20 },
  { name: "Saturn",  diameter: 116_460, color: "#e8d8a0", au: 9.58 },
  { name: "Uranus",  diameter: 50_724,  color: "#7fffd4", au: 19.18 },
  { name: "Neptune", diameter: 49_244,  color: "#4169e1", au: 30.07 },
];

const UNITS: Record<string, number> = { mm: 1000, cm: 100, m: 1, in: 39.3701, ft: 3.28084 };
const UNIT_LABELS: Record<string, string> = {
  mm: "Millimeters", cm: "Centimeters", m: "Meters", in: "Inches", ft: "Feet",
};
const PPI = 100;
const PX_MM = PPI / 25.4;

function toPxDiam(earthSizeUnits: number, unit: string): number {
  if (unit === "mm") return earthSizeUnits * PX_MM;
  if (unit === "cm") return earthSizeUnits * 10 * PX_MM;
  if (unit === "m")  return earthSizeUnits * 1000 * PX_MM;
  if (unit === "in") return earthSizeUnits * PPI;
  if (unit === "ft") return earthSizeUnits * 12 * PPI;
  return earthSizeUnits;
}

interface InfoRow { name: string; sizeStr: string }

export default function SolarSystemScaledClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [unit, setUnit]   = useState("mm");
  const [scale, setScale] = useState(0.01 / UNITS["mm"]);
  const [info, setInfo]   = useState<InfoRow[]>([]);

  // ── draw ──────────────────────────────────────────────────────────────────
  function draw(sliderVal: number, u: string) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // match canvas logical px to display size
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const conv           = UNITS[u];
    const earthSizeUnits = sliderVal * conv;
    const earthPxD       = toPxDiam(earthSizeUnits, u);
    const earthR         = earthPxD / 2;

    const sunX    = W / 12;
    const sunY    = H / 2;
    const maxAU   = Math.max(...PLANETS.map(p => p.au));
    const scaleAU = (W - sunX - W * 0.05) / maxAU;

    const newInfo: InfoRow[] = [];

    // ── Sun ──
    const sunRatio  = SUN_D / EARTH_D;
    const sunR      = Math.max(2, earthR * sunRatio);
    const sunG      = ctx.createRadialGradient(sunX, sunY, sunR * 0.1, sunX, sunY, sunR);
    sunG.addColorStop(0,   "#fff9c4");
    sunG.addColorStop(0.4, "#ffb300");
    sunG.addColorStop(1,   "#e65100");
    ctx.beginPath();
    ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
    ctx.fillStyle   = sunG;
    ctx.shadowBlur  = 30;
    ctx.shadowColor = "rgba(255,180,0,0.5)";
    ctx.fill();
    ctx.shadowBlur  = 0;

    ctx.fillStyle    = "rgba(255,255,255,0.8)";
    ctx.font         = `bold ${Math.max(10, H * 0.025)}px ui-sans-serif,sans-serif`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "top";
    ctx.fillText("Sun", sunX, sunY + sunR + 6);
    newInfo.push({ name: "Sun", sizeStr: `${(earthSizeUnits * sunRatio).toFixed(2)} ${u}` });

    // ── Planets ──
    PLANETS.forEach(p => {
      const ratio  = p.diameter / EARTH_D;
      const r      = Math.max(1.5, earthR * ratio);
      const cx     = sunX + p.au * scaleAU;
      const cy     = sunY;

      // orbit ring
      ctx.beginPath();
      ctx.arc(sunX, sunY, p.au * scaleAU, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth   = 1;
      ctx.stroke();

      // planet
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle   = p.color;
      ctx.strokeStyle = "rgba(255,255,255,0.2)";
      ctx.lineWidth   = 1;
      ctx.fill();
      ctx.stroke();

      // label
      ctx.fillStyle    = "rgba(255,255,255,0.8)";
      ctx.font         = `bold ${Math.max(9, H * 0.022)}px ui-sans-serif,sans-serif`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "top";
      ctx.fillText(p.name, cx, cy + r + 5);

      newInfo.push({ name: p.name, sizeStr: `${(earthSizeUnits * ratio).toFixed(2)} ${u}` });
    });

    setInfo(newInfo);
  }

  // ── resize handler ────────────────────────────────────────────────────────
  useEffect(() => {
    function onResize() { draw(scale, unit); }
    window.addEventListener("resize", onResize);
    draw(scale, unit);
    return () => window.removeEventListener("resize", onResize);
  }, []); // eslint-disable-line

  // redraw when slider/unit changes
  useEffect(() => { draw(scale, unit); }, [scale, unit]); // eslint-disable-line

  function handleUnit(u: string) {
    const newMin = 0.01 / UNITS[u];
    setUnit(u);
    setScale(newMin);
  }

  const conv = UNITS[unit];
  const min  = 0.01 / conv;
  const max  = 10   / conv;

  return (
    <ToolShell title="Solar System Scaled" emoji="🪐">
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "-0.5rem", lineHeight: 1.6 }}>
        All eight planets and the Sun drawn to the same scale. Slide Earth&apos;s diameter
        to a real-world size — every other body follows proportionally. Orbit distances
        are scaled to fit the viewport (not to scale with size).
      </p>

      {/* Controls */}
      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {(min * conv).toFixed(2)} {unit}
          </span>
          <input
            type="range" min={min} max={max} step={(max - min) / 2000} value={scale}
            onChange={e => setScale(parseFloat(e.target.value))}
            style={{ flex: 1, accentColor: "var(--accent)" }}
          />
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
            {(max * conv).toFixed(2)} {unit}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Units:</label>
            <select
              value={unit} onChange={e => handleUnit(e.target.value)}
              style={{ background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--text)", padding: "0.3rem 0.6rem", fontSize: "0.85rem" }}
            >
              {Object.keys(UNITS).map(u => <option key={u} value={u}>{UNIT_LABELS[u]}</option>)}
            </select>
          </div>
          <button
            className="btn btn-ghost" style={{ fontSize: "0.8rem", marginLeft: "auto" }}
            onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
          >⛶ Fullscreen</button>
        </div>
      </div>

      {/* Canvas + overlay */}
      <div style={{ position: "relative", background: "#000", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden", width: "100%", aspectRatio: "16/7" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />

        {/* Info overlay */}
        {info.length > 0 && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(11,12,14,0.82)", border: "1px solid var(--border)",
            borderRadius: 8, padding: "0.5rem 0.75rem",
            fontSize: "0.72rem", lineHeight: 1.65, color: "rgba(255,255,255,0.7)",
            maxWidth: "28%", maxHeight: "84%", overflowY: "auto",
            display: "flex", flexDirection: "column", gap: 1,
            pointerEvents: "none",
          }}>
            {info.map(r => (
              <span key={r.name}><strong style={{ color: "rgba(255,255,255,0.9)" }}>{r.name}:</strong> {r.sizeStr}</span>
            ))}
          </div>
        )}
      </div>
    </ToolShell>
  );
}
