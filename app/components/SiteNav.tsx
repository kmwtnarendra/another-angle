import Link from "next/link";

// Shared chrome (nav) is fine to share — "independent pages" means
// each page's CONTENT and DATA don't depend on other pages, not that
// you can't reuse a presentational component like a nav bar.
export default function SiteNav() {
  return (
    <nav className="w-full border-b border-white/10 px-6 py-4 flex gap-6 text-sm">
      <Link href="/" className="font-semibold tracking-tight">
        Another Angle
      </Link>
      <Link href="/tech/" className="text-white/60 hover:text-white">
        Tech
      </Link>
    </nav>
  );
}
