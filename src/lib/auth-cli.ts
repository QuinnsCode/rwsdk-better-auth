import { betterAuth } from "better-auth";
import { admin, organization } from "better-auth/plugins";
import { PrismaD1HTTP } from "@prisma/adapter-d1";
import { prismaAdapter } from "better-auth/adapters/prisma";

const d1 = new PrismaD1HTTP({
  CLOUDFLARE_D1_TOKEN: process.env.CLOUDFLARE_D1_TOKEN!,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID!,
  CLOUDFLARE_DATABASE_ID: process.env.CLOUDFLARE_DATABASE_ID!,
});

export const auth = betterAuth({
  database: prismaAdapter(d1, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [organization(), admin()],
});