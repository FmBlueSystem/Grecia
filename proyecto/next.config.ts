import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SAP Service Layer uses internal SSL cert
  serverExternalPackages: [],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

// Allow self-signed certs for SAP Service Layer in server-side fetches
if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export default nextConfig;
