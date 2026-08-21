import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a fully static site in ./out on `next build`.
  // No Node server, no API routes with server logic, no ISR/SSR.
  output: "export",

  // S3 static website hosting serves /about/index.html for the path
  // "/about/". Without this, Next emits /about.html which S3 won't
  // resolve for a trailing-slash request unless you fix up every link.
  trailingSlash: true,

  // next/image's built-in optimizer needs a server, which static
  // export doesn't have. `unoptimized` just serves the images as-is.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
