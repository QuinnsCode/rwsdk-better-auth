---
title: RedwoodSDK Integration
description: Integrate Better Auth with RedwoodSDK and Cloudflare Workers and Prisma.
---

Before you start, make sure you have a Better Auth instance configured. If you haven't done that yet, check out the [installation](/docs/installation).

### Setup

RedwoodSDK is a full-stack framework built on Cloudflare Workers with Vite, D1 database, and React. This guide shows how to integrate Better Auth into a RedwoodSDK project.

First, install Better Auth:

```bash
pnpm add better-auth
```

### Database Configuration

Configure Better Auth to work with RedwoodSDK's database setup. Since RedwoodSDK handles the D1 connection, you'll integrate with the existing database:

```ts title="app/lib/auth.ts"
import { betterAuth } from "better-auth"
import { d1Adapter } from "better-auth/adapters/d1"
import { admin } from "better-auth/plugins/admin"
import { multiSession } from "better-auth/plugins/multi-session"
import { apiKey } from "better-auth/plugins/api-key"
import { env } from "cloudflare:workers"

export const auth = betterAuth({
  database: d1Adapter(env.DB), // Use RedwoodSDK's D1 binding
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    multiSession(),
    apiKey(),
  ],
  advanced: {
    generateId: () => crypto.randomUUID(), // Use Web Crypto API
  }
})

export type Session = typeof auth.$Infer.Session
```

### Worker Configuration

In your RedwoodSDK worker, integrate Better Auth using the `defineApp` pattern with session management:

```ts title="worker.tsx"
import { defineApp } from "rwsdk/worker"
import { route, render, prefix } from "rwsdk/router"
import { Document } from "@/app/Document"
import { setCommonHeaders } from "@/app/headers"
import { setupDb } from "@/db"
import { env } from "cloudflare:workers"

export type AppContext = {
  session: any
  user: any
}

// Global flags for one-time initialization
let dbInitialized = false
let authInstance: any = null

export default defineApp([
  setCommonHeaders(),
  
  // Initialize database and auth instance once
  async ({ ctx, request }) => {
    if (!dbInitialized) {
      await setupDb(env)
      dbInitialized = true
      
      // Create auth instance after db setup
      const { auth } = await import("@/lib/auth")
      authInstance = auth
    }

    // Get session on every request
    try {
      const session = await authInstance.api.getSession({
        headers: request.headers
      })
      ctx.session = session
      ctx.user = session?.user || null
    } catch (error) {
      console.error("Session error:", error)
      ctx.session = null
      ctx.user = null
    }
  },
  
  render(Document, [
    // Your app routes
    route("/", HomePage),
    
    // Protected route example
    route("/protected", [
      ({ ctx }) => {
        if (!ctx.user) {
          return new Response(null, {
            status: 302,
            headers: { Location: "/user/login" },
          })
        }
      },
      ProtectedPage,
    ]),
    
    // Better Auth handler
    route("/api/auth/*", ({ request }) => authInstance.handler(request)),
    
    // Protected API route example
    route("/api/protected", async ({ request }) => {
      const session = await authInstance.api.getSession({
        headers: request.headers
      })

      if (!session) {
        return new Response("Unauthorized", { status: 401 })
      }

      return new Response(`Hello ${session.user.name}!`)
    }),
  ]),
])
```

### D1 Database Schema

RedwoodSDK uses Prisma with D1. Add the required Better Auth tables to your Prisma schema:

```prisma title="prisma/schema.prisma"
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts Account[]
  sessions Session[]

  @@map("user")
}

model Session {
  id        String   @id @default(cuid())
  expiresAt DateTime
  token     String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(references: [id], fields: [userId], onDelete: Cascade)

  @@map("session")
}

model Account {
  id                String  @id @default(cuid())
  accountId         String
  providerId        String
  userId            String
  accessToken       String?
  refreshToken      String?
  idToken           String?
  accessTokenExpiresAt DateTime?
  refreshTokenExpiresAt DateTime?
  scope             String?
  password          String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(references: [id], fields: [userId], onDelete: Cascade)

  @@unique([providerId, accountId])
  @@map("account")
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([identifier, value])
  @@map("verification")
}
```

Then create and run your migrations:

```bash
pnpm migrate:new "add better auth tables"
pnpm migrate:dev
```

### Client Configuration

Create a client-side auth configuration for your React components:

```ts title="app/lib/auth-client.ts"
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: process.env.NODE_ENV === "development" 
    ? "http://localhost:5173" 
    : "https://your-app.your-subdomain.workers.dev"
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
} = authClient
```

### Session Management

RedwoodSDK's `defineApp` pattern allows you to add session context to all routes. The auth session is automatically available in your route handlers:

```ts title="app/pages/user/routes.tsx"
import { route, render } from "rwsdk/router"
import { SignInPage } from "./SignInPage"
import { SignUpPage } from "./SignUpPage"
import { ProfilePage } from "./ProfilePage"

export const userRoutes = [
  route("/login", SignInPage),
  route("/signup", SignUpPage),
  route("/profile", [
    // Protect the profile route
    ({ ctx }) => {
      if (!ctx.user) {
        return new Response(null, {
          status: 302,
          headers: { Location: "/user/login" },
        })
      }
    },
    ProfilePage,
  ]),
]
```

Access the session in your React components by passing it from the route handler:

```tsx title="app/pages/user/ProfilePage.tsx"
export default function ProfilePage({ ctx }: { ctx: AppContext }) {
  const { user, session } = ctx

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

### React Components

Create authentication components using the Better Auth React client:

```tsx title="app/components/auth/SignInForm.tsx"
import { useState } from "react"
import { authClient } from "../../lib/auth-client"

export function SignInForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      })
      
      if (error) {
        console.error("Sign in error:", error)
      } else {
        window.location.href = "/dashboard"
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 border rounded"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  )
}
```

```tsx title="app/components/auth/SignUpForm.tsx"
import { useState } from "react"
import { authClient } from "../../lib/auth-client"

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      })
      
      if (error) {
        console.error("Sign up error:", error)
      } else {
        window.location.href = "/dashboard"
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 border rounded"
        required
      />
      <button 
        type="submit" 
        disabled={loading}
        className="w-full p-2 bg-green-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  )
}
```

```tsx title="app/components/auth/UserMenu.tsx"
import { useSession, authClient } from "../../lib/auth-client"

export function UserMenu() {
  const { data: session, isLoading } = useSession()

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!session) {
    return (
      <div className="space-x-2">
        <a href="/auth/signin" className="text-blue-500 hover:underline">
          Sign In
        </a>
        <a href="/auth/signup" className="text-green-500 hover:underline">
          Sign Up
        </a>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700">Hello, {session.user.name}</span>
      <button
        onClick={() => authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = "/"
            }
          }
        })}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Sign Out
      </button>
    </div>
  )
}
```

### Admin Components

If you're using the admin plugin, create admin-specific components:

```tsx title="app/components/admin/AdminPanel.tsx"
import { useSession } from "../../lib/auth-client"

export function AdminPanel() {
  const { data: session } = useSession()

  // Check if user is admin (this should also be validated server-side)
  if (!session?.user?.role || session.user.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
      <p>Welcome to the admin panel, {session.user.name}!</p>
      {/* Your admin functionality */}
    </div>
  )
}
```

### Environment Configuration

Configure your environment variables in `wrangler.jsonc`. RedwoodSDK includes D1, Durable Objects, and assets by default:

```jsonc title="wrangler.jsonc"
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-app-with-better-auth",
  "main": "src/worker.tsx",
  "compatibility_date": "2025-05-07",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true
  },
  "durable_objects": {
    "bindings": [
      {
        "name": "SESSION_DURABLE_OBJECT",
        "class_name": "SessionDurableObject"
      }
    ]
  },
  "vars": {
    "WEBAUTHN_APP_NAME": "My App with Better Auth",
    "NODE_ENV": "development"
  },
  "migrations": [
    {
      "tag": "v1",
      "new_sqlite_classes": ["SessionDurableObject"]
    }
  ],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-app-db",
      "database_id": "your-database-id-here"
    }
  ]
}
```

Set your Better Auth secret using Wrangler secrets:

```bash
# Set the secret for Better Auth
npx wrangler secret put BETTER_AUTH_SECRET

# Optional: Set other auth-related secrets
npx wrangler secret put BETTER_AUTH_URL
```

For production, you can create environment-specific configurations or use different values.

### Deployment

When deploying to Cloudflare Workers:

1. Ensure your D1 database is created and migrations are applied:
```bash
npx wrangler d1 create your-database
npx wrangler d1 migrations apply your-database --env production
```

2. Deploy your worker:
```bash
pnpm run release
```

### Development

Run your development server:

```bash
pnpm dev
```

Your Better Auth endpoints will be available at `http://localhost:5173/api/auth/*` and your React app will have full authentication functionality.

### Additional Features

RedwoodSDK works seamlessly with Better Auth plugins:

- **Admin Plugin**: For user management and role-based access
- **Multi-session Plugin**: For multiple device support  
- **API Key Plugin**: For API authentication
- **Two-factor Plugin**: For enhanced security

Simply add them to your `auth.ts` configuration and update your D1 schema as needed. The Cloudflare Workers environment provides excellent performance and global distribution for your authenticated application.