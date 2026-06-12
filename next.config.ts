import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "@auth/prisma-adapter", "prisma", "bcryptjs"],
};

export default nextConfig;
