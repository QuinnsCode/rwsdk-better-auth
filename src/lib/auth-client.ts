// lib/auth-client.ts
import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";
import { apiKeyClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins"
import { multiSessionClient } from "better-auth/client/plugins"



export const authClient = createAuthClient({
    baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:5173",
    plugins: [
        adminClient(),
        apiKeyClient(),
        organizationClient({
          teams: {
            enabled: true
          }
        }),
        multiSessionClient(),
    ]
});