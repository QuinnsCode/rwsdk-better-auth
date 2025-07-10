# RedwoodSDK + Better Auth Integration

A RedwoodSDK project pre-configured with Better Auth for comprehensive authentication and multi-tenant subdomain routing. This extends the standard RedwoodSDK starter with:

- Vite
- Database (Prisma via D1)
- Better Auth with email/password authentication
- Session Management 
- Tailwind CSS for styling
- Multi-tenant subdomain routing

## Getting Started

Clone this repository to get started with RedwoodSDK + Better Auth:

```shell
git clone https://github.com/yourusername/rwsdk-better-auth.git my-project-name
cd my-project-name
pnpm install
```

## Environment Setup

### 1. Configure Environment Variables

Set up your Better Auth secret and other required environment variables:

```shell
# Required for Better Auth
npx wrangler secret put BETTER_AUTH_SECRET

# Optional: Set other auth-related secrets
npx wrangler secret put BETTER_AUTH_URL
```

### 2. Database Setup

Create a new D1 database and configure Wrangler:

```shell
npx wrangler d1 create my-project-db
```

Copy the database ID provided and update your `wrangler.jsonc` file:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-app-with-better-auth",
  "main": "src/worker.tsx",
  "compatibility_date": "2025-05-07",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-project-db",
      "database_id": "your-database-id-here"
    }
  ]
}
```

### 3. Configure Better Auth Trusted Origins

Update the trusted origins in `app/lib/auth.ts` to match your domain:

```typescript
// In app/lib/auth.ts, update the trustedOrigins array:
trustedOrigins: [
  "yourdomain.com",        // Replace with your actual domain
  "*.yourdomain.com",      // Wildcard for all subdomains (REQUIRED for subdomain auth)
  "localhost:5173",        // Development
  "*.localhost:5173",      // Development subdomains
  "localhost:8787",        // Wrangler dev
  "*.localhost:8787",      // Wrangler dev subdomains
],
```

**Critical:** The wildcard entry (`*.yourdomain.com`) is essential for authentication to work on organization subdomains.

### 4. Run Database Migrations

Apply the Better Auth database schema:

```shell
pnpm migrate:new "add better auth tables"
pnpm migrate:dev
```

## Running the dev server

```shell
pnpm dev
```

Point your browser to the URL displayed in the terminal (e.g. `http://localhost:5173/`). You should see a "Hello World" message in your browser.

## Deploying your app

### Wrangler Setup

Within your project's `wrangler.jsonc`:

- Replace the `__change_me__` placeholders with a name for your application

- Create a new D1 database:

```shell
npx wrangler d1 create my-project-db
```

Copy the database ID provided and paste it into your project's `wrangler.jsonc` file:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-project-db",
      "database_id": "your-database-id",
    },
  ],
}
```

### DNS Configuration for Subdomain Routing

**Note:** Subdomain routing only works with custom domains, not `.workers.dev` URLs. You'll need to have your own domain configured in Cloudflare.

To enable dynamic subdomain routing (where each organization gets its own subdomain), configure these DNS records in Cloudflare:

1. **Add a wildcard CNAME record** to route all subdomains to your main domain:
   ```
   Type: CNAME
   Name: *
   Target: yourdomain.com
   Proxy status: Proxied
   TTL: Auto
   ```

2. **Add a www CNAME record** for the www subdomain:
   ```
   Type: CNAME
   Name: www
   Target: yourdomain.com
   Proxy status: Proxied
   TTL: Auto
   ```

These DNS records will route all subdomains (e.g., `org1.yourdomain.com`, `org2.yourdomain.com`) to your Cloudflare Worker, where the subdomain is used as an organization slug to identify and route to the correct organization.

### 5. Deploy Your Application

Deploy your worker to Cloudflare:

```shell
pnpm run release
```

**How it works:**
- The wildcard CNAME (`*`) captures all subdomains
- Your RedwoodSDK worker extracts the subdomain from the request
- The subdomain is used as a unique field to look up organizations in your database
- This happens in the middleware within your `worker.tsx` file

## Multi-Tenant Database Queries

When building multi-tenant features, make sure to scope your Prisma queries by organization:

```typescript
// Always include orgSlug in organization-scoped queries
const users = await prisma.user.findMany({
  where: {
    orgSlug: organizationSlug, // Extracted from subdomain
    // ... other filters
  }
});

const posts = await prisma.post.findMany({
  where: {
    organization: {
      slug: organizationSlug
    },
    // ... other filters
  }
});
```

This ensures data isolation between different organizations using the same application.

### Better Auth Setup

This project comes pre-configured with Better Auth, but you need to update the trusted origins in `app/lib/auth.ts` to match your domain. Update the `trustedOrigins` array:

```typescript
// app/lib/auth.ts
trustedOrigins: [
  "yourdomain.com",        // Replace with your domain
  "*.yourdomain.com",      // Wildcard for all subdomains
  "localhost:5173",        // Development
  "*.localhost:5173",      // Development subdomains
  "localhost:8787",        // Wrangler dev
  "*.localhost:8787",      // Wrangler dev subdomains
],
```

**Important:** The wildcard subdomain entry (`*.yourdomain.com`) is crucial for subdomain authentication to work properly. Without this, users won't be able to authenticate on organization subdomains.

The setup includes:

- Email/password authentication
- Admin plugin for user management
- Multi-session support
- API key authentication
- Session management integrated with RedwoodSDK
- Subdomain-compatible trusted origins

## Further Reading

- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/runtime-apis/secrets/)
- [Cloudflare DNS Management](https://developers.cloudflare.com/dns/)