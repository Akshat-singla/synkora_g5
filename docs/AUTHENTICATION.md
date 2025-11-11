# Authentication Implementation

This document describes the authentication and authorization system implemented for the Synkora platform.

## Overview

The authentication system uses NextAuth.js v4 with the following features:
- Email/password authentication with bcrypt hashing
- Google OAuth authentication
- JWT-based sessions (30-day expiration)
- Role-based access control (Owner, Editor, Viewer)
- Protected routes and API endpoints

## Setup

### Environment Variables

Add the following to your `.env` file:

```env
# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

Generate a secret key:
```bash
openssl rand -base64 32
```

### Database

The authentication system uses the following Prisma models:
- `User` - User accounts
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `TeamMember` - Team membership with roles
- `Role` enum - OWNER, EDITOR, VIEWER

## Usage

### Client-Side Authentication

#### Using the useAuth Hook

```typescript
import { useAuth } from "@/hooks/use-auth";

function MyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please sign in</div>;

  return <div>Welcome, {user.name}!</div>;
}
```

#### Sign In/Out

```typescript
import { signIn, signOut } from "next-auth/react";

// Sign in with credentials
await signIn("credentials", {
  email: "user@example.com",
  password: "password",
  callbackUrl: "/dashboard",
});

// Sign in with Google
await signIn("google", { callbackUrl: "/dashboard" });

// Sign out
await signOut({ callbackUrl: "/login" });
```

### Server-Side Authentication

#### In API Routes

```typescript
import { requireAuth } from "@/lib/auth-utils";

export async function GET() {
  try {
    const user = await requireAuth();
    // User is authenticated
    return NextResponse.json({ userId: user.id });
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
```

#### In Server Components

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }

  return <div>Protected content</div>;
}
```

## Authorization

### Role-Based Access Control

The system supports three roles:
- **OWNER**: Full access (create, read, update, delete)
- **EDITOR**: Read and write access
- **VIEWER**: Read-only access

### Checking Permissions

#### Client-Side

```typescript
import { canEdit, isOwner } from "@/hooks/use-auth";
import { Role } from "@prisma/client";

const userRole: Role = "EDITOR";

if (canEdit(userRole)) {
  // Show edit button
}

if (isOwner(userRole)) {
  // Show delete button
}
```

#### Server-Side

```typescript
import { requireProjectRole } from "@/lib/auth-utils";
import { Role } from "@prisma/client";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    
    // Require OWNER or EDITOR role
    await requireProjectRole(user.id, params.id, [Role.OWNER, Role.EDITOR]);
    
    // User has permission, proceed with update
    // ...
  } catch (error) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }
}
```

## Protected Routes

The middleware automatically protects the following routes:
- `/dashboard/*` - Requires authentication
- `/projects/*` - Requires authentication
- `/teams/*` - Requires authentication

Unauthenticated users are redirected to `/login`.

## API Route Guards

Use the provided guard functions for consistent authorization:

```typescript
import { withAuth, withProjectAuth } from "@/lib/api-guards";
import { Role } from "@prisma/client";

// Simple authentication check
export const GET = withAuth(async (userId, request) => {
  // userId is guaranteed to exist
  return NextResponse.json({ userId });
});

// Project-level authorization
export const PATCH = async (
  request: Request,
  { params }: { params: { projectId: string } }
) => {
  return withProjectAuth(
    params.projectId,
    [Role.OWNER, Role.EDITOR],
    async (userId, projectId, role) => {
      // User has required role for this project
      return NextResponse.json({ success: true });
    }
  );
};
```

## Registration Flow

1. User submits registration form
2. Form data is validated with Zod
3. Password is hashed with bcrypt (cost factor: 12)
4. User record is created in database
5. User is automatically signed in
6. User is redirected to dashboard

## Login Flow

1. User submits login form
2. Credentials are verified against database
3. Password is compared using bcrypt
4. JWT session token is created (30-day expiration)
5. User is redirected to dashboard

## Security Features

- Passwords hashed with bcrypt (cost factor: 12)
- JWT tokens with 30-day expiration
- CSRF protection via NextAuth.js
- Secure session cookies (httpOnly)
- Role-based access control
- Protected API routes
- Input validation with Zod

## Testing

To test the authentication system:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000`

3. Register a new account at `/register`

4. Sign in at `/login`

5. Access the protected dashboard at `/dashboard`

## Troubleshooting

### "Unauthorized" errors
- Ensure `NEXTAUTH_SECRET` is set in `.env`
- Check that the database is running
- Verify Prisma migrations are up to date

### Google OAuth not working
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Check that the redirect URI is configured in Google Console
- Ensure `NEXTAUTH_URL` matches your application URL

### Session not persisting
- Clear browser cookies
- Check that `NEXTAUTH_SECRET` hasn't changed
- Verify database session table exists
