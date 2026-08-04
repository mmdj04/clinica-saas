import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  serverExternalPackages: ["better-auth", "@better-auth/core", "@better-auth/prisma-adapter"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  webpack: (config) => {
    config.resolve.alias["@better-auth/core/utils"] = resolve(
      __dirname,
      "node_modules/@better-auth/core/dist/utils"
    );
    config.resolve.alias["@better-auth/core/utils/string"] = resolve(
      __dirname,
      "node_modules/@better-auth/core/dist/utils/string.mjs"
    );
    config.resolve.alias["@better-auth/core/utils/url"] = resolve(
      __dirname,
      "node_modules/@better-auth/core/dist/utils/url.mjs"
    );
    config.resolve.alias["@better-auth/core/utils/ip"] = resolve(
      __dirname,
      "node_modules/@better-auth/core/dist/utils/ip.mjs"
    );
    return config;
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;