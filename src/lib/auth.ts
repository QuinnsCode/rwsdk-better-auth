// lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { organization } from "better-auth/plugins";
import { apiKey } from "better-auth/plugins"
import { multiSession } from "better-auth/plugins"

import { db } from "@/db";
 
export const auth = betterAuth({
    database: prismaAdapter(db, {
        provider: "sqlite",
    }),
    emailAndPassword: {  
        enabled: true
    },
    plugins: [
        admin({
            defaultRole: "user",
            adminRoles: ["admin"],
            defaultBanReason: "Violated terms of service",
            defaultBanExpiresIn: 60 * 60 * 24 * 7, // 7 days
            impersonationSessionDuration: 60 * 60, // 1 hour
        }),
        organization({
          teams: {
            enabled: true,
            maximumTeams: 10, // Optional: limit teams per organization
            allowRemovingAllTeams: false // Optional: prevent removing the last team
          }
        }),
        apiKey(),
        multiSession({
          maximumSessions: 3
        }),
        
    ],
});