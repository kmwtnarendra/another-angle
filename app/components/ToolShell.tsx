import Link from "next/link";
import { siteConfig } from "../config/site";

interface Props {
  title: string;
  emoji: string;
  children: React.ReactNode;
}

export default function ToolShell({ title, emoji, children }: Props) {
  return (
    <div className="tool-page">
      {/* Breadcrumb nav */}
      <header className="tool-header">
        <Link href="/" style={{ textDecoration: "none" }}>
          {siteConfig.name}
        </Link>
        <span style={{ color: "var(--border)", userSelect: "none" }}>/</span>
        <Link href="/tools/" style={{ textDecoration: "none" }}>
          Tools
        </Link>
        <span style={{ color: "var(--border)", userSelect: "none" }}>/</span>
        <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>{title}</span>
      </header>

      <div className="tool-body">
        {/* Page title */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1.75rem" }}>{emoji}</span>
          <h1 className="tool-title">{title}</h1>
        </div>

        {children}
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "1rem 1.5rem",
          fontSize: "0.78rem",
          color: "var(--text-muted)",
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} {siteConfig.name} —{" "}
        <a
          href={siteConfig.youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--text-muted)" }}
        >
          YouTube
        </a>{" "}
        ·{" "}
        <a href={`mailto:${siteConfig.contact.email}`} style={{ color: "var(--text-muted)" }}>
          Contact
        </a>
      </footer>
    </div>
  );
}
