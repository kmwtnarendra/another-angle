import SiteNav from "./components/SiteNav";

// HOME PAGE — app/page.tsx  ->  builds to out/index.html
//
// This page owns everything it needs: its own metadata, its own
// content, its own data (if it ever fetches any). It doesn't import
// from or depend on any other route's page.tsx. That's what makes it
// independently browsable — open out/index.html directly, or deploy
// only this route, and it still works.
export const metadata = {
  title: "Another Angle",
  description: "Another Angle — home",
};

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Another Angle</h1>
        <p className="text-white/60 max-w-md">
          Home page is live. More category pages get added under their own
          folders in <code className="text-white/80">app/</code>.
        </p>
      </main>
    </>
  );
}
