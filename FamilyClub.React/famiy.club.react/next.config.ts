import type { NextConfig } from "next";

/**
 * Browser calls same-origin /api/* and /images/*.
 * Next rewrites those to the ASP.NET backend.
 *
 * Production (K8s/Docker): set INTERNAL_API_URL to the API Service from the Next pod, e.g.
 *   INTERNAL_API_URL=http://familyclub-api:8080
 * Leave NEXT_PUBLIC_API_URL empty so the client uses relative /api.
 * Do not use localhost in cluster — API is in another pod.
 *
 * Local default: HTTP Kestrel (avoids Node TLS errors with self-signed HTTPS).
 */
const internalApi =
  process.env.INTERNAL_API_URL?.replace(/\/$/, "") ||
  "http://localhost:5053";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["26.15.231.182", "localhost", "127.0.0.1"],
  reactStrictMode: false,
  poweredByHeader: false,
  // Hide the Next.js route indicator (circle in the corner). To show again: { position: "bottom-left" }
  devIndicators: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https: http://localhost:* https://localhost:*",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${internalApi}/api/:path*`,
      },
      {
        source: "/images/:path*",
        destination: `${internalApi}/images/:path*`,
      },
      {
        source: "/signin-google",
        destination: `${internalApi}/signin-google`,
      },
    ];
  },
};

export default nextConfig;
