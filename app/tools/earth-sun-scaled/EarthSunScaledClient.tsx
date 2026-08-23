"use client";

import { useState } from "react";
import ToolShell from "../../components/ToolShell";

const SUN_D   = 1_391_000;
const EARTH_D = 12_742;
const RATIO   = SUN_D / EARTH_D;
const AU_KM   = 149_600_000;

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

// SVG coordinate space — fixed; viewBox handles responsive scaling
const VW = 2500, VH = 1200, CY = 600, SUN_CX = 680, EARTH_CX = 1820;

export default function EarthSunScaledClient() {
  const [unit, setUnit]   = useState("mm");
  const [scale, setScale] = useState(0.01 / UNITS["mm"]);   // slider raw value

  function handleUnit(u: string) {
    setUnit(u);
    setScale(0.01 / UNITS[u]);   // reset to min of new unit
  }

  const conv           = UNITS[unit];
  const min            = 0.01 / conv;
  const max            = 10   / conv;
  const earthSizeUnits = scale * conv;
  const earthPxD       = toPxDiam(earthSizeUnits, unit);
  const earthR         = Math.max(1,  earthPxD / 2);
  const sunR           = Math.max(2,  earthR * RATIO);
  const scaledDist     = (earthPxD / EARTH_D) * AU_KM;

  return (
    <ToolShell title="Earth vs Sun (Scaled)" emoji="🌍☀️">
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "-0.5rem", lineHeight: 1.6 }}>
        The Sun is ~109× wider than Earth. Set Earth&apos;s diameter in real-world units
        using the slider — the Sun scales proportionally so you can feel the true difference in size.
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

          <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", flex: 1 }}>
            Earth: <strong style={{ color: "var(--text)" }}>{earthSizeUnits.toFixed(2)} {unit}</strong>
            &nbsp;·&nbsp;
            Sun: <strong style={{ color: "var(--text)" }}>{(earthSizeUnits * RATIO).toFixed(2)} {unit}</strong>
          </div>

          <button
            className="btn btn-ghost" style={{ fontSize: "0.8rem" }}
            onClick={() => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen()}
          >⛶ Fullscreen</button>
        </div>
      </div>

      {/* SVG */}
      <div style={{ background: "#000", borderRadius: 12, border: "1px solid var(--border)", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" style={{ width: "100%", display: "block" }}>
          <defs>
            <radialGradient id="sunG" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#fff9c4" />
              <stop offset="40%"  stopColor="#ffb300" />
              <stop offset="100%" stopColor="#e65100" />
            </radialGradient>
            <filter id="sunGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="40" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="earthG" cx="38%" cy="32%" r="65%">
              <stop offset="0%"   stopColor="#4fc3f7" />
              <stop offset="55%"  stopColor="#1565c0" />
              <stop offset="100%" stopColor="#0d1b3d" />
            </radialGradient>
            <pattern id="cont" patternUnits="userSpaceOnUse" width="60" height="60">
              <path d="M10 10 Q20 0 30 15 T50 30 Q40 45 20 40 Z" fill="rgba(0,180,0,0.55)" />
              <path d="M35 35 Q45 25 55 40 T45 55 Q30 50 35 35 Z" fill="rgba(0,150,0,0.5)" />
            </pattern>
            <pattern id="earthFill" patternUnits="userSpaceOnUse" width="100" height="100">
              <rect width="100" height="100" fill="url(#earthG)" />
              <rect width="100" height="100" fill="url(#cont)" />
            </pattern>
          </defs>

          {/* Distance reference line */}
          <line x1={SUN_CX} y1={CY} x2={EARTH_CX} y2={CY}
            stroke="rgba(255,255,255,0.1)" strokeWidth={2} strokeDasharray="12,8" />

          {/* Sun */}
          <circle cx={SUN_CX} cy={CY} r={sunR} fill="url(#sunG)" filter="url(#sunGlow)" />
          <text x={SUN_CX} y={CY - sunR - 16} fill="rgba(255,255,255,0.65)" fontSize={26} textAnchor="middle">
            {(earthSizeUnits * RATIO).toFixed(2)} {unit}
          </text>
          <text x={SUN_CX} y={CY + sunR + 42} fill="rgba(255,255,255,0.45)" fontSize={24} textAnchor="middle">
            Sun — {SUN_D.toLocaleString()} km
          </text>

          {/* Earth */}
          <circle cx={EARTH_CX} cy={CY} r={earthR} fill="url(#earthFill)" stroke="rgba(100,180,255,0.5)" strokeWidth={1} />
          <text x={EARTH_CX} y={CY - Math.max(earthR, 10) - 16} fill="rgba(255,255,255,0.65)" fontSize={26} textAnchor="middle">
            {earthSizeUnits.toFixed(2)} {unit}
          </text>
          <text x={EARTH_CX} y={CY + Math.max(earthR, 10) + 42} fill="rgba(255,255,255,0.45)" fontSize={22} textAnchor="middle">
            Earth — {EARTH_D.toLocaleString()} km
          </text>
        </svg>
      </div>

      {/* Scaled distance */}
      <div style={{ textAlign: "center", fontSize: "0.88rem", color: "var(--accent)", fontWeight: 600 }}>
        At this scale, Earth–Sun distance = <strong>{scaledDist.toFixed(2)} {unit}</strong>
      </div>

      {/* Fact */}
      <div className="card" style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.7 }}>
        <strong style={{ color: "var(--text)" }}>Quick fact:</strong> If Earth were a marble (~1 cm across),
        the Sun would be about {(0.01 * RATIO * 100).toFixed(0)} cm wide —
        and they would be {((0.01 * RATIO / EARTH_D) * AU_KM * 100).toFixed(0)} cm apart.
        That&apos;s almost {(((0.01 * RATIO / EARTH_D) * AU_KM) / 100).toFixed(0)} m.
      </div>
    </ToolShell>
  );
}
