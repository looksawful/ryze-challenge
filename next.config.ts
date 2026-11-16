import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1", "100.110.158.49", "titan.tail85619a.ts.net"],
};

export default nextConfig;
