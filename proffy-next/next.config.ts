import type { NextConfig } from "next";

// Same headers as the legacy server's `app.use(cors())`.
const corsHeaders = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET,HEAD,PUT,PATCH,POST,DELETE" },
  { key: "Access-Control-Allow-Headers", value: "Content-Type" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["knex", "better-sqlite3"],
  async headers() {
    return ["/classes", "/connections"].map((source) => ({ source, headers: corsHeaders }));
  },
};

export default nextConfig;
