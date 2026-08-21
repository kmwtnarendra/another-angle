import SiteNav from "../components/SiteNav";

// EXAMPLE CATEGORY PAGE — app/tech/page.tsx -> builds to out/tech/index.html
//
// This is the pattern to copy for every new category: a folder under
// app/ named after the URL segment, with its own page.tsx inside.
// Add app/travel/page.tsx and you get /travel/ automatically — no
// routing config to touch, no other page's file to edit.
export const metadata = {
  title: "Tech — Another Angle",
  description: "Tech category",
};

export default function TechPage() {
  return (
    <>
      <SiteNav />
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Tech</h1>
        <p className="text-white/60 max-w-md">
          This page lives entirely at app/tech/page.tsx and knows nothing
          about the home page or any other category.
        </p>
      </main>
    </>
  );
}
