# DuoFit - AGENTS.md

Codebase guidelines for agentic coding agents.

## Project Overview

DuoFit is a couples fitness and nutrition accountability app built with:
- Next.js 16 App Router
- TypeScript (strict mode)
- Prisma with libsql/Turso (SQLite locally)
- Tailwind CSS 4
- Radix UI primitives
- Lucide React icons

## Build/Lint/Test Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Prisma generate + production build
npm run lint         # ESLint with next/core-web-vitals
npx tsc --noEmit     # TypeScript type checking

# Database
npx prisma generate              # Generate Prisma client
npx prisma migrate dev --name <name>  # Create migration
npx prisma studio               # Open database GUI
```

**Note:** No test framework configured. Ask user if tests needed.

## Code Style

### General
- **NO COMMENTS** unless explicitly requested
- TypeScript strict mode - all code type-safe
- Prefer `const` over `let`
- Arrow functions for callbacks/handlers
- `async/await` over `.then()` chains

### Imports
Order imports (blank lines between groups):
1. React/Next.js imports
2. Third-party libraries
3. `@/` alias imports
4. `@/generated/prisma/client` types

```typescript
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChecklistItem } from "@/generated/prisma/client";
```

### TypeScript
- `interface` for object types, `type` for unions
- Export shared types from `src/types/index.ts`
- Avoid `any` - use `unknown` when needed
- Explicit return types for exported functions

### Components
- Default export for components: `export default function Name()`
- `"use client"` at top of client components
- Server components default (no directive)
- Props interface inline or same file
- Destructure props in signature
- Tailwind only - no CSS modules/styled-components

```tsx
"use client";

export default function Button({ variant = "primary", children }: Props) {
  return <button className="rounded-lg px-4 py-2">{children}</button>;
}
```

### API Routes
- Location: `src/app/api/[resource]/route.ts`
- Export async functions: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- Use `NextRequest`/`NextResponse` from `next/server`
- Always check auth: `getSession(req)` for protected routes
- Return `{ error: "message" }` with status codes
- Use 201 for POST creation success

```typescript
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const data = await prisma.model.findMany();
  return NextResponse.json(data);
}
```

### Prisma
- Import client from `@/lib/prisma`
- Types from `@/generated/prisma/client`
- Use `cuid()` for IDs (schema default)
- Use `include`/`select` for efficient queries

```typescript
import { prisma } from "@/lib/prisma";
import { User } from "@/generated/prisma/client";

const user = await prisma.user.findUnique({
  where: { id },
  select: { id: true, name: true },
});
```

### Error Handling
```typescript
// Expected absence
const user = await prisma.user.findUnique({ where: { id } });
if (!user) return null;

// Recovery attempt
try {
  return await fetchData();
} catch {
  return null;
}

// Log errors in development
try {
  await saveItem();
} catch (error) {
  console.error("Failed:", error);
}
```

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `user-card.tsx` |
| Components | PascalCase | `UserCard` |
| Functions | camelCase | `getUserData` |
| Variables | camelCase | `userName` |
| Constants | SCREAMING_SNAKE_CASE | `DAY_NAMES` |
| Types/Interfaces | PascalCase + suffix | `UserDTO`, `ButtonProps` |

## Directory Structure

```
src/
├── app/
│   ├── (app)/          # Protected routes
│   ├── (auth)/         # Auth routes
│   ├── api/            # API handlers
│   └── layout.tsx
├── components/
│   ├── ui/             # Reusable primitives
│   └── [feature]/      # Feature components
├── lib/
│   ├── prisma.ts       # Database client
│   ├── auth.ts         # Auth helpers
│   ├── dates.ts        # Date utilities
│   └── utils.ts        # cn() helper
├── types/index.ts      # Shared types
└── generated/          # Prisma generated
```

## Tailwind CSS

### Colors
- `brand-*` (indigo shades) - primary/current user
- `partner-*` (amber shades) - partner
- Semantic: `foreground`, `background`, `muted`, `destructive`

### Utilities
```typescript
// Use cn() for conditional classes
import { cn } from "@/lib/utils";

<div className={cn("base-class", isActive && "active-class")} />
```

### Common Patterns
- `rounded-lg` - rounded corners
- `px-4 py-2` - button padding
- `text-sm font-medium` - labels
- `text-muted-foreground` - secondary text

## Security

- Never expose JWT_SECRET, TURSO_AUTH_TOKEN
- Always validate auth in protected routes
- Use httpOnly cookies for sessions
- Never commit .env files

## Environment Variables

Required (production):
- `JWT_SECRET`
- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`

Local dev uses SQLite fallback.

## Common Tasks

### Add API route
1. Create `src/app/api/[resource]/route.ts`
2. Export async functions for HTTP methods
3. Import `getSession` from `@/lib/auth`, `prisma` from `@/lib/prisma`

### Add component
1. Create in `src/components/[feature]/` or `src/components/ui/`
2. Add `"use client"` if using hooks
3. Export as default function

### Add page
1. Protected: `src/app/(app)/[route]/page.tsx`
2. Auth: `src/app/(auth)/[route]/page.tsx`
3. Server components default for data fetching