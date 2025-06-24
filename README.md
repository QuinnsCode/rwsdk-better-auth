# Standard RedwoodSDK Starter with Better Auth

This "standard starter" is the recommended implementation for RedwoodSDK with Better Auth integration. You get a Typescript project with:

- Vite
- Database (Prisma via D1)
- Session Management (via DurableObjects)
- Better Auth with email/password authentication
- Admin, multi-session, and API key plugins
- Storage (via R2)

## Creating your project

```shell
npx create-rwsdk my-project-name
cd my-project-name
pnpm install
```

## Standard Setup

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

## Better Auth Integration Steps

### 1. Install Better Auth

```shell
pnpm add better-auth
```

### 2. Create Better Auth Configuration

Create `@/app/lib/auth.ts` with your auth configuration:

```typescript
import { betterAuth } from "better-auth"
import { admin } from "better-auth/plugins/admin"
import { multiSession } from "better-auth/plugins/multi-session" 
import { apiKey } from "better-auth/plugins/api-key"

export const auth = betterAuth({
  database: {
    // Your database configuration
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    admin(),
    multiSession(),
    apiKey()
  ],
  // Additional configuration...
})
```

### 3. Create Auth Client

Create `@/app/lib/auth-client.ts` for client-side auth utilities:

```typescript
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  // Client configuration
})

// Export any additional client utilities you need
```

### 4. Update Database Schema

Add Better Auth models to your Prisma schema. Include the required tables for:
- User authentication
- Sessions
- Admin functionality
- Multi-session support
- API keys

### 5. Update Worker Routes

Add Better Auth routes to your `worker.tsx`:

```typescript
// Add auth endpoints to handle Better Auth requests
// Include routes for signin, signup, admin functions, etc.
```

### 6. Migrate Database

Run the database migrations:

```shell
pnpm migrate:new "adding better auth models"
pnpm migrate:dev
```

### 7. Update UI Components

**Rename existing components:**
- Move standard starter auth components to `oldnameTutorial` in the user folder

**Add new Better Auth components:**
- Create new components in the user folder that use `auth-client.ts`
- Implement signin/signup forms
- Add session management components
- Create admin dashboard components

### 8. Add Admin Testing

Create an admin page and component for testing the admin plugin functionality.

## Plugin Configuration

This setup includes:

- **Admin Plugin**: Provides admin user management capabilities
- **Multi-Session Plugin**: Allows users to have multiple active sessions
- **API Key Plugin**: Enables API key-based authentication
- **Email/Password**: Standard email and password authentication

## Running the dev server

```shell
pnpm dev
```

Point your browser to the URL displayed in the terminal (e.g. `http://localhost:5173/`). You should see your application with Better Auth integration.

## Deploying your app

Follow the standard deployment process, ensuring that:

1. All Better Auth environment variables are set in Cloudflare Workers
2. Database migrations have been applied to production
3. Admin users are properly configured

## Environment Variables

Make sure to set up the required environment variables for Better Auth:

```env
BETTER_AUTH_SECRET=your-secret-key
# Add other required environment variables
```

## Troubleshooting

### Common Migration Issues

If you encounter "table already exists" errors during migration:

1. Check existing database schema
2. Modify migration to use `ALTER TABLE` instead of `CREATE TABLE` if needed
3. Use `CREATE TABLE IF NOT EXISTS` for conditional table creation

### Auth Setup Issues

- Verify all Better Auth routes are properly configured in worker.tsx
- Ensure database models match Better Auth requirements
- Check that client and server configurations are aligned

## Further Reading

- [Better Auth Documentation](https://better-auth.com/docs)
- [RedwoodSDK Documentation](https://docs.rwsdk.com/)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/runtime-apis/secrets/)