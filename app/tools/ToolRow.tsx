"use client";

import Link from "next/link";
import { type Tool } from "../config/site";

export default function ToolRow({ tool, hasBorderTop }: { tool: Tool; hasBorderTop: boolean }) {
  return (
    <Link href={`/tools/${tool.slug}/`} style={{ textDecoration: "none", display: "block" }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.65rem 1rem", borderTop: hasBorderTop ? "1px solid var(--border)" : "none", transition: "background 0.12s", cursor: "pointer" }}
        onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "rgba(124,245,196,0.05)")}
        onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}
      >
        <span style={{ fontSize: "1.25rem", flexShrink: 0, width: 28, textAlign: "center" }}>{tool.emoji}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {tool.title}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginTop: "0.1rem" }}>
            {tool.description}
          </div>
        </div>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", flexShrink: 0 }}>→</span>
      </div>
    </Link>
  );
}