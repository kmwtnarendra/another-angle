"use client";

import Link from "next/link";
import { type Tool } from "../config/site";

interface Props {
  groups: { category: string; label: string; items: Tool[] }[];
}

export default function ToolsGrid({ groups }: Props) {
  return (
    <>
      {groups.map(({ category, label, items }) => (
        <div key={category} style={{ marginBottom: "2.5rem" }}>
          <h3
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--text-muted)",
              marginBottom: "1rem",
              paddingBottom: "0.5rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {label}
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {items.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link href={`/tools/${tool.slug}/`} style={{ textDecoration: "none" }}>
      <div
        className="card"
        style={{ cursor: "pointer", transition: "border-color 0.15s", height: "100%" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
      >
        <div style={{ fontSize: "1.75rem", marginBottom: "0.6rem" }}>{tool.emoji}</div>
        <div style={{ fontWeight: 700, marginBottom: "0.3rem" }}>{tool.title}</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
          {tool.description}
        </div>
      </div>
    </Link>
  );
}
