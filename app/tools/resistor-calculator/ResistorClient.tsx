"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import ToolShell from "../../components/ToolShell";

// ── Standard IEC resistor colour bands ────────────────────────────────────────
const COLORS = [
  { name: "Black",  hex: "#1a1a1a", digit: 0,  multiplier: 1,          border: "#555"    },
  { name: "Brown",  hex: "#7b3f00", digit: 1,  multiplier: 10,         border: "#9b5f20" },
  { name: "Red",    hex: "#cc0000", digit: 2,  multiplier: 100,        border: "#ff2222" },
  { name: "Orange", hex: "#ff6600", digit: 3,  multiplier: 1_000,      border: "#ff8833" },
  { name: "Yellow", hex: "#ffe000", digit: 4,  multiplier: 10_000,     border: "#ffe333" },
  { name: "Green",  hex: "#00a550", digit: 5,  multiplier: 100_000,    border: "#00cc66" },
  { name: "Blue",   hex: "#0047ab", digit: 6,  multiplier: 1_000_000,  border: "#2266cc" },
  { name: "Violet", hex: "#8b00ff", digit: 7,  multiplier: 10_000_000, border: "#aa33ff" },
  { name: "Grey",   hex: "#808080", digit: 8,  multiplier: null,       border: "#aaaaaa" },
  { name: "White",  hex: "#f0f0f0", digit: 9,  multiplier: null,       border: "#cccccc" },
  { name: "Gold",   hex: "#cfb53b", digit: null, multiplier: 0.1,      border: "#e8d060" },
  { name: "Silver", hex: "#c0c0c0", digit: null, multiplier: 0.01,     border: "#dddddd" },
] as const;

type ColorName = typeof COLORS[number]["name"];

// Band constraints — which colours are valid for each band
const BAND_COLORS: Record<number, ColorName[]> = {
  0: ["Black","Brown","Red","Orange","Yellow","Green","Blue","Violet","Grey","White"],
  1: ["Black","Brown","Red","Orange","Yellow","Green","Blue","Violet","Grey","White"],
  2: ["Black","Brown","Red","Orange","Yellow","Green","Blue","Violet","Grey","White","Gold","Silver"],
  3: ["Brown","Red","Orange","Yellow","Green","Blue","Violet","Grey","White","Gold","Silver"],
};

const BAND_LABELS = ["1st Digit", "2nd Digit", "Multiplier", "Tolerance"];

// Tolerance band → text
const TOLERANCE: Record<ColorName, string> = {
  Brown: "±1%", Red: "±2%", Orange: "±0.05%", Yellow: "±0.02%",
  Green: "±0.5%", Blue: "±0.25%", Violet: "±0.1%", Grey: "±0.01%",
  White: "±1%", Gold: "±5%", Silver: "±10%",
  Black: "", // not valid for band 3 but satisfies TS
};

// Format resistance value with SI prefix
function formatOhms(ohms: number): string {
  if (ohms >= 1_000_000) return `${+(ohms / 1_000_000).toPrecision(3)} MΩ`;
  if (ohms >= 1_000)     return `${+(ohms / 1_000).toPrecision(3)} kΩ`;
  return `${+ohms.toPrecision(3)} Ω`;
}

function getColor(name: ColorName) {
  return COLORS.find(c => c.name === name)!;
}

// ── SVG Resistor Graphic ────────────────────────────────────────────────────
function ResistorGraphic({ bands }: { bands: [ColorName, ColorName, ColorName, ColorName] }) {
  const bodyW = 180, bodyH = 40, bodyX = 110, bodyY = 22;
  const totalW = 400, totalH = 84;
  const cx = totalW / 2, cy = totalH / 2;

  // Band positions (x within body)
  const bandPositions = [22, 50, 78, 118];
  const bandW = 20, bandH = bodyH;

  const [b0, b1, b2, b3] = bands.map(getColor);

  return (
    <svg
      viewBox={`0 0 ${totalW} ${totalH}`}
      style={{ width: "100%", maxWidth: 380, display: "block", margin: "0 auto" }}
      aria-label={`Resistor showing bands: ${bands.join(", ")}`}
    >
      {/* Lead wires */}
      <line x1={0}       y1={cy} x2={bodyX}          y2={cy} stroke="#aaa" strokeWidth={3} strokeLinecap="round" />
      <line x1={bodyX + bodyW} y1={cy} x2={totalW}   y2={cy} stroke="#aaa" strokeWidth={3} strokeLinecap="round" />

      {/* Body shadow */}
      <rect x={bodyX + 3} y={bodyY + 3} width={bodyW} height={bodyH} rx={10} fill="rgba(0,0,0,0.3)" />

      {/* Body */}
      <rect x={bodyX} y={bodyY} width={bodyW} height={bodyH} rx={10}
        fill="url(#bodyGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

      <defs>
        <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#e8ddb0" />
          <stop offset="40%"  stopColor="#d4c490" />
          <stop offset="100%" stopColor="#b8a870" />
        </linearGradient>
      </defs>

      {/* Colour bands */}
      {[b0, b1, b2, b3].map((col, i) => (
        <g key={i}>
          <rect
            x={bodyX + bandPositions[i]}
            y={bodyY}
            width={bandW}
            height={bandH}
            rx={2}
            fill={col.hex}
            stroke={col.border}
            strokeWidth={1}
          />
          {/* Subtle highlight on band */}
          <rect
            x={bodyX + bandPositions[i]}
            y={bodyY}
            width={bandW}
            height={bandH / 3}
            rx={2}
            fill="rgba(255,255,255,0.12)"
          />
        </g>
      ))}

      {/* Body top highlight */}
      <rect x={bodyX + 4} y={bodyY + 4} width={bodyW - 8} height={10} rx={4}
        fill="rgba(255,255,255,0.18)" />
    </svg>
  );
}

// ── Color Strip Selector ────────────────────────────────────────────────────
function ColorStrip({
  bandIndex,
  available,
  selected,
  onSelect,
}: {
  bandIndex: number;
  available: ColorName[];
  selected: ColorName;
  onSelect: (c: ColorName) => void;
}) {
  return (
    <div>
      <div style={{
        fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase",
        letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: "0.35rem",
      }}>
        Band {bandIndex + 1} — {BAND_LABELS[bandIndex]}
      </div>

      {/* Colour swatches */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
        {available.map(name => {
          const col    = getColor(name);
          const active = name === selected;
          return (
            <button
              key={name}
              title={name}
              onClick={() => onSelect(name)}
              style={{
                width: 28, height: 28,
                borderRadius: 6,
                background: col.hex,
                border: active
                  ? `3px solid var(--accent)`
                  : `2px solid ${col.border}`,
                cursor: "pointer",
                transition: "transform 0.1s, border 0.1s",
                transform: active ? "scale(1.18)" : "scale(1)",
                boxShadow: active ? "0 0 0 2px rgba(124,245,196,0.35)" : "none",
                position: "relative",
                flexShrink: 0,
              }}
              aria-label={name}
              aria-pressed={active}
            />
          );
        })}
      </div>

      {/* Selected colour label */}
      <div style={{
        marginTop: "0.3rem",
        display: "flex", alignItems: "center", gap: "0.4rem",
      }}>
        <span style={{
          width: 12, height: 12, borderRadius: 3,
          background: getColor(selected).hex,
          border: `1px solid ${getColor(selected).border}`,
          display: "inline-block", flexShrink: 0,
        }} />
        <span style={{ fontSize: "0.78rem", color: "var(--text)", fontWeight: 600 }}>
          {selected}
        </span>
        {bandIndex <= 1 && (
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            = {getColor(selected).digit}
          </span>
        )}
        {bandIndex === 2 && getColor(selected).multiplier !== null && (
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            × {getColor(selected).multiplier!.toLocaleString("en-US")}
          </span>
        )}
        {bandIndex === 3 && (
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {TOLERANCE[selected] || "—"}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const DEFAULT: [ColorName, ColorName, ColorName, ColorName] =
  ["Brown", "Black", "Red", "Gold"];

export default function ResistorClient() {
  const [bands, setBands] = useState<[ColorName, ColorName, ColorName, ColorName]>(DEFAULT);
  const [copied, setCopied] = useState(false);
  const didLoad = useRef(false);

  // Load from URL on mount
  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    const p = new URLSearchParams(window.location.search);
    const b = [p.get("b1"), p.get("b2"), p.get("b3"), p.get("b4")];
    const next = [...bands] as [ColorName, ColorName, ColorName, ColorName];
    let changed = false;
    b.forEach((v, i) => {
      if (!v) return;
      const valid = BAND_COLORS[i].includes(v as ColorName);
      if (valid) { next[i] = v as ColorName; changed = true; }
    });
    if (changed) setBands(next);
  }, []); // eslint-disable-line

  // Sync to URL whenever bands change
  useEffect(() => {
    const p = new URLSearchParams();
    bands.forEach((b, i) => p.set(`b${i + 1}`, b));
    window.history.replaceState(null, "", "?" + p.toString());
  }, [bands]);

  const setband = useCallback((i: number, name: ColorName) => {
    setBands(prev => {
      const next = [...prev] as typeof prev;
      next[i] = name;
      return next;
    });
  }, []);

  // Calculate resistance
  const [b0, b1, b2, b3] = bands;
  const c0 = getColor(b0), c1 = getColor(b1), c2 = getColor(b2);
  const digit0 = c0.digit ?? 0;
  const digit1 = c1.digit ?? 0;
  const multiplier = c2.multiplier ?? 1;
  const resistance = (digit0 * 10 + digit1) * multiplier;
  const tolerance = TOLERANCE[b3] || "—";
  const minVal = resistance * (1 - parseFloat(tolerance) / 100);
  const maxVal = resistance * (1 + parseFloat(tolerance) / 100);
  const hasRange = !isNaN(minVal);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Resistor Color Code", url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {});
    }
  }

  return (
    <ToolShell title="Resistor Color Code" emoji="🔌">
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "-0.5rem", marginBottom: "-0.25rem", lineHeight: 1.45 }}>
        Click a colour swatch for each band — the resistor graphic updates live and the value
        is calculated instantly. Share the URL to save your result.
      </p>

      {/* ── Resistor graphic ── */}
      <div className="card" style={{ padding: "0.85rem 1rem" }}>
        <ResistorGraphic bands={bands} />

        {/* Band labels below the graphic */}
        <div style={{
          display: "flex", justifyContent: "center",
          gap: "clamp(0.5rem, 3vw, 2.5rem)",
          marginTop: "0.4rem",
          fontSize: "0.66rem",
          color: "var(--text-muted)",
          textAlign: "center",
        }}>
          {bands.map((name, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3,
                background: getColor(name).hex,
                border: `1px solid ${getColor(name).border}`,
                display: "inline-block",
              }} />
              <span style={{ whiteSpace: "nowrap" }}>{BAND_LABELS[i]}</span>
              <span style={{ color: "var(--text)", fontWeight: 600, fontSize: "0.7rem" }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Result ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "0.5rem",
      }}>
        <div className="stat-card" style={{ gridColumn: "span 1" }}>
          <span className="stat-label">Resistance</span>
          <span className="stat-value">{formatOhms(resistance)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tolerance</span>
          <span className="stat-value" style={{ fontSize: "1.1rem" }}>{tolerance}</span>
        </div>
        {hasRange && (
          <div className="stat-card">
            <span className="stat-label">Range</span>
            <span className="stat-value" style={{ fontSize: "0.95rem" }}>
              {formatOhms(minVal)} – {formatOhms(maxVal)}
            </span>
          </div>
        )}
      </div>

      {/* ── Band selectors ── */}
      <div className="band-grid">
        {([0, 1, 2, 3] as const).map(i => (
          <div key={i} className="card" style={{ padding: "0.7rem 0.85rem" }}>
            <ColorStrip
              bandIndex={i}
              available={BAND_COLORS[i] as unknown as ColorName[]}
              selected={bands[i]}
              onSelect={name => setband(i, name)}
            />
          </div>
        ))}
      </div>
      <style jsx>{`
        .band-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }
        @media (max-width: 700px) {
          .band-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── How to read guide ── */}
      <details style={{ cursor: "pointer", marginTop: "-0.25rem" }}>
        <summary style={{
          fontWeight: 700, fontSize: "0.85rem", color: "var(--text)",
          padding: "0.4rem 0", userSelect: "none", listStyle: "none",
          display: "flex", alignItems: "center", gap: "0.4rem",
        }}>
          <span style={{ color: "var(--accent)" }}>▶</span> How to read a 4-band resistor
        </summary>
        <div className="card" style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.8 }}>
          <p style={{ marginBottom: "0.75rem" }}>
            A 4-band resistor has four coloured stripes. Hold it so the three stripes are on the left
            and the single stripe (tolerance) is on the right — there is usually a larger gap before it.
          </p>
          <div style={{
            display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.3rem 1rem",
            alignItems: "start", marginBottom: "0.75rem",
          }}>
            {[
              ["Band 1", "First significant digit (0–9)"],
              ["Band 2", "Second significant digit (0–9)"],
              ["Band 3", "Multiplier — multiply (Band1 Band2) by this"],
              ["Band 4", "Tolerance — how accurate the actual value is"],
            ].map(([label, desc]) => (
              <Fragment key={label}>
                <strong style={{ color: "var(--text)", whiteSpace: "nowrap" }}>{label}</strong>
                <span>{desc}</span>
              </Fragment>
            ))}
          </div>
          <p style={{ marginBottom: "0.5rem" }}>
            <strong style={{ color: "var(--text)" }}>Example — Brown · Black · Red · Gold:</strong>
          </p>
          <p>
            Brown = 1, Black = 0 → first two digits are <strong style={{ color: "var(--text)" }}>10</strong>.
            Red multiplier = ×100 → 10 × 100 = <strong style={{ color: "var(--accent)" }}>1 kΩ</strong>.
            Gold tolerance = <strong style={{ color: "var(--text)" }}>±5%</strong>, so the actual value is 950 Ω – 1050 Ω.
          </p>
        </div>
      </details>

      {/* ── Colour code reference table ── */}
      <details style={{ marginTop: "-0.25rem" }}>
        <summary style={{
          fontWeight: 700, fontSize: "0.85rem", color: "var(--text)",
          padding: "0.4rem 0", userSelect: "none", listStyle: "none",
          display: "flex", alignItems: "center", gap: "0.4rem",
          cursor: "pointer",
        }}>
          <span style={{ color: "var(--accent)" }}>▶</span> Full colour code reference
        </summary>
        <div className="table-wrap" style={{ marginTop: "0.75rem" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Colour</th>
                <th>Digit</th>
                <th>Multiplier</th>
                <th>Tolerance</th>
              </tr>
            </thead>
            <tbody>
              {COLORS.map(col => (
                <tr key={col.name}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{
                        width: 16, height: 16, borderRadius: 3,
                        background: col.hex, border: `1px solid ${col.border}`,
                        display: "inline-block", flexShrink: 0,
                      }} />
                      {col.name}
                    </div>
                  </td>
                  <td>{col.digit !== null ? col.digit : "—"}</td>
                  <td>{col.multiplier !== null ? `×${col.multiplier.toLocaleString("en-US")}` : "—"}</td>
                  <td>{TOLERANCE[col.name as ColorName] || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* ── Share button ── */}
      <button className="share-fab" onClick={share} title="Share this resistor value">
        {copied ? "✓" : "🔗"}
      </button>
    </ToolShell>
  );
}
