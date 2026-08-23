// ─── Site Config ────────────────────────────────────────────────────────────
// All editable content lives here. Swap a YouTube handle, add a tool,
// change the domain — nothing else needs to change.

export const siteConfig = {
  name: "Another Angle",
  tagline: "Fresh perspectives on science, finance & everyday curiosity.",
  domain: "https://anotherangle.in",

  // ── Social ── swap URLs when real handles are confirmed
  youtube: {
    url: "https://www.youtube.com/@AnAnotherAngle",
    handle: "@AnAnotherAngle",
  },
  facebook: {
    url: "https://www.facebook.com/anotherangle", // placeholder
  },
  instagram: {
    url: "https://www.instagram.com/anotherangle", // placeholder
  },

  supportUrl: "https://buymeacoffee.com/cskmwtnaree",

  contact: {
    email: "byteaheaddigital@gmail.com",
  },

  seo: {
    title: "Another Angle — Science, Finance & Curiosity",
    description:
      "Another Angle is a YouTube channel and website exploring science, finance, and technology through simple words, fresh perspectives, and interactive tools.",
    keywords: [
      "Another Angle",
      "science explained",
      "finance tools",
      "EMI calculator",
      "SIP calculator",
      "interactive science",
      "YouTube channel",
    ],
    ogImage: "https://anotherangle.in/og-image.png",
    themeColor: "#0b0c0e",
  },
} as const;

// ─── Tool Registry ───────────────────────────────────────────────────────────
// Add a new tool here → it appears on the homepage automatically.
// "built: false" means the route doesn't exist yet — it's hidden from
// the UI and sitemap so there are never dead links in a shipped build.

export interface Tool {
  slug: string;        // URL: /tools/<slug>/
  title: string;
  description: string;
  emoji: string;
  category: ToolCategory;
  built?: boolean;     // default true; set false for planned-but-not-yet-built
}

export type ToolCategory = "finance" | "science" | "technology" | "kids";

export const tools: Tool[] = [
  {
    slug: "emi",
    title: "EMI Calculator",
    description: "Calculate monthly loan payments and see the full repayment schedule.",
    emoji: "🏦",
    category: "finance",
    built: true,
  },
  {
    slug: "emi-partpayment",
    title: "Part Payment Calculator",
    description: "See exactly how a lump-sum part payment reduces your interest and tenure.",
    emoji: "💳",
    category: "finance",
    built: true,
  },
  {
    slug: "sip",
    title: "SIP Calculator",
    description: "Project the future value of your monthly SIP investments with compounding.",
    emoji: "📈",
    category: "finance",
    built: true,
  },
  {
    slug: "debt-vs-save",
    title: "Buy Now vs Save First",
    description: "Compare taking a loan now against saving up first — inflation included.",
    emoji: "⚖️",
    category: "finance",
    built: true,
  },
  {
    slug: "earth-magnetosphere",
    title: "Earth Magnetosphere",
    description: "Watch solar wind particles deflect off Earth\'s magnetic field in real-time.",
    emoji: "🧲",
    category: "science",
    built: true,
  },
  {
    slug: "earth-satellite",
    title: "Earth Satellite Simulation",
    description: "Top-down orbital simulation — add satellites and compare orbits from ISS to GEO.",
    emoji: "🛰️",
    category: "science",
    built: true,
  },
  {
    slug: "earth-sun-scaled",
    title: "Earth vs Sun (Scaled)",
    description: "Set Earth's diameter in real units and see how the Sun scales proportionally.",
    emoji: "🌍☀️",
    category: "science",
    built: true,
  },
  {
    slug: "solar-system-scaled",
    title: "Solar System Scaled",
    description: "All eight planets and the Sun drawn to scale — from tiny Mercury to the giant Sun.",
    emoji: "🪐",
    category: "science",
    built: true,
  },
  {
    slug: "latitude-longitude",
    title: "Latitude & Longitude Globe",
    description: "Interactive 3D globe with lat/lon grid. Drag to rotate, scroll to zoom.",
    emoji: "🌐",
    category: "science",
    built: true,
  },
  {
    slug: "resistor-calculator",
    title: "Resistor Color Code Calculator",
    description: "Decode 4-band resistor color codes instantly. Click the color strips, see the resistor change, get the value.",
    emoji: "🔌",
    category: "technology",
    built: true,
  },
];

// Only expose tools that have actual pages built.
export const builtTools = tools.filter((t) => t.built !== false);

// Group by category, preserving order from the tools array above.
const CATEGORY_ORDER: ToolCategory[] = ["finance", "science", "technology", "kids"];
const CATEGORY_LABELS: Record<ToolCategory, string> = {
  finance: "Finance Tools",
  science: "Science & Exploration",
  technology: "Technology",
  kids: "Kids Corner",
};

export function groupedTools(): { category: ToolCategory; label: string; items: Tool[] }[] {
  return CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    items: builtTools.filter((t) => t.category === cat),
  })).filter((g) => g.items.length > 0);
}
