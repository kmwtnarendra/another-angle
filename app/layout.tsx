import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Another Angle",
  description: "Another Angle",
};

// This root layout wraps EVERY page (it's how Next.js's App Router
// works — there's always one root layout). Keep it to only what truly
// belongs on every page (e.g. global nav/footer, <html>/<body> tags,
// fonts). Each page under app/<route>/page.tsx still owns its own
// content and data independently — nothing here couples them together.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
