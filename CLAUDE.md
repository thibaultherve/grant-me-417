# ReGranted Developer Guidelines

## Project Overview

**ReGranted** - Monorepo (React + NestJS + PostgreSQL)

### Stack

- **Client** (`/client`): React 19.1.1 (react-router 7.9.4), TypeScript, TailwindCSS 4.1.12, @tanstack/react-query 5.90.5, Shadcn UI, Zod 4
- **Server** (`/server`): NestJS, Prisma ORM, Passport.js + JWT, Zod validation
- **Shared** (`/shared`): Zod schemas (API contracts), inferred TypeScript types, shared constants
- **Database**: PostgreSQL (Railway)
- **Hosting**: Railway (React static + NestJS API + PostgreSQL)
- **Monorepo**: pnpm workspaces

### Architecture Summary

- **Prisma** = source of truth for **database schema** (tables, relations, migrations). Prisma-generated types are used only server-side in the data access layer.
- **Zod** = source of truth for **API contracts** (input/output DTOs). Zod schemas live in `/shared` and are used by both client (form validation) and server (request validation via NestJS pipes).
- **Mapping** between Prisma types (DB) and Zod schemas (API) happens in **NestJS services**. DTOs and DB models intentionally diverge.
- TypeScript types in `/shared` are inferred from Zod via `z.infer<typeof schema>`.

---

## Fundamental Development Principles

### 1. Database Interaction

- **Server**: All database access goes through **Prisma** in NestJS services/repositories
- **Client**: All data access goes through **REST API calls** to NestJS (never direct DB access)
- **Migrations**: Use `prisma migrate dev` for development, `prisma migrate deploy` for production
- **MCP Supabase**: Can still be used for ad-hoc SQL queries during development/debugging

### 2. Maximum Reuse of Existing Code

**GOLDEN RULE**: Before creating anything new, ALWAYS:

1. Search for existing functionality in the project
2. Review components/functions in the same directory
3. Follow patterns established in similar files
4. Reuse and adapt instead of recreating

**Practical examples**:

- Creating a UI component → check `client/src/components/`
- Adding a hook → check `client/src/hooks/`
- Adding a NestJS service → check existing modules in `server/src/`
- Adding a Zod schema → check `shared/src/schemas/`

### 3. Dynamic & Modular Code

- All code must be fully dynamic and modular
- **NO hardcoded** parameters, thresholds, URLs, paths, or credentials
- Load all values from configuration files (`.env` for secrets)
- Business logic must adapt automatically to configuration changes

### 4. Formatting, Linting & Type-checking

- **ALWAYS** after creating or editing files, run these checks and fix any errors before considering the task done:
  1. **Dead code detection**: `npx knip` (from root) — fix unused files, exports, and dependencies before linting
  2. **Client**: `cd client && npx eslint --fix <files> && npx tsc --noEmit`
  3. **Server**: `cd server && npx eslint --fix <files> && npx tsc --noEmit`
- Do NOT rely on manual formatting — the project's Prettier config (printWidth, trailing commas, union type formatting, etc.) must be enforced via tooling
- Fix all TypeScript errors (unused imports, type mismatches, missing types) — do NOT leave `TS6133`, `TS2322`, or any `TS*` errors behind

### 5. Clean Code & Maintenance

- **NEVER** leave unused code - ask for user approval before deletion
- **DRY Principle** - duplication is a liability

### 6. API & Error Handling

- **ALWAYS** handle all error cases in API responses
- Never return 500 unless it's a genuine internal server error
- **NEVER** simplify external API calls without understanding their constraints
- Never expose internal errors in API responses
- Use NestJS exception filters for consistent error response format

### 7. Up-to-Date Information & Documentation

**ALWAYS use current information for libraries, APIs, and best practices.**

#### Priority Order for Documentation:

1. **MCP Context7** (`mcp__context7__resolve-library-id` + `mcp__context7__query-docs`)
   - Use FIRST for any library documentation (React, NestJS, Prisma, etc.)
   - Provides indexed, structured documentation

2. **WebSearch** (`WebSearch` tool)
   - Use when Context7 doesn't have the library
   - Use for latest best practices and patterns (add "2025 2026" to queries)
   - Use for error messages and troubleshooting

3. **WebFetch** (`WebFetch` tool)
   - Use to fetch specific documentation pages found via WebSearch

**NEVER assume library APIs haven't changed. Always verify.**

### 8. Tailwind CSS v4 Canonical Classes

**ALWAYS use Tailwind v4 canonical (short) class names**, not legacy aliases:

| Legacy (DO NOT use)         | Canonical (USE this)         |
|-----------------------------|------------------------------|
| `flex-shrink-0`             | `shrink-0`                   |
| `flex-grow`                 | `grow`                       |
| `overflow-ellipsis`         | `text-ellipsis`              |
| `data-[placeholder]:...`   | `data-placeholder:...`       |
| `data-[disabled]:...`      | `data-disabled:...`          |
| `min-w-[8rem]`             | `min-w-32`                   |
| `max-w-[280px]`            | `max-w-70`                   |
| `h-[var(--custom)]`        | `h-(--custom)`               |
| `min-w-[var(--custom)]`    | `min-w-(--custom)`           |

When a Tailwind utility has a numeric equivalent (e.g., `[8rem]` = `32` in the default scale), prefer the numeric form. For CSS variables, use the `(--var)` syntax instead of `[var(--var)]`.

### 9. UI Design Quality (Frontend)

Pour toute creation de composant UI significatif (pages, modals, forms, dashboards, cards), utilise le skill `frontend-design:frontend-design` pour garantir un design distinctif et production-ready.

---

## Core Architecture

### Client (React 19.1.1) - `/client`

- **Routing**: react-router 7.9.4 with lazy loading
- **State**: @tanstack/react-query for server state, React hooks for local state
- **Styling**: Tailwind CSS + Shadcn UI
- **Forms**: react-hook-form + Zod validation (schemas from `/shared`)
- **API Client**: Fetch/Axios wrapper with JWT interceptor and refresh token rotation
- **Tests**: Vitest + React Testing Library

### Server (NestJS) - `/server`

- **Pattern**: Module-based (Controller → Service → Repository/Prisma)
- **Auth**: Passport.js (Local + JWT strategies), access token (15min) + refresh token (7d)
- **Validation**: Zod schemas from `/shared` via ZodValidationPipe
- **ORM**: Prisma with connection pooling
- **Tests**: Jest + @nestjs/testing (unit + integration)
- **Security**: Helmet, CORS, @nestjs/throttler for rate limiting

### Shared Package - `/shared`

- **Schemas**: Zod schemas for all API DTOs (input + output)
- **Types**: TypeScript types inferred from Zod via `z.infer<>`
- **Constants**: Business rules (WHV 417 visa rules, industry enum, eligible countries)

### Database & Environment

- **PostgreSQL**: Hosted on Railway
- **ORM**: Prisma (schema in `server/prisma/schema.prisma`)
- **Migrations**: Prisma Migrate
- **Configuration**: `.env` for secrets (per package)

### Logging Strategy

- **Dev**: Verbose (Info level) with full data structures
- **Prod**: Clean (Info/Warn/Error)
- **Retries**: NEVER log `ERROR` on retryable failures - use `Warn`

### Security

- **Secrets**: NEVER commit `.env`
- **Auth**: JWT tokens (access + refresh), bcrypt password hashing
- **Authorization**: NestJS guards + service-level ownership checks (replaces Supabase RLS)
- **API**: Helmet headers, CORS, rate limiting on auth endpoints

---

## Testing Strategy

### Backend (Jest)

- **Unit Tests**: Services, business logic (visa progress calculations, validation rules)
- **Integration Tests**: Controllers with database (use test database, seed/cleanup per test)
- **Location**: `server/src/**/*.spec.ts` (unit), `server/test/**/*.e2e-spec.ts` (integration)
- **Coverage**: All business logic MUST be tested (visa progress engine, auth, CRUD operations)

### Frontend (Vitest + React Testing Library)

- **Unit Tests**: Utility functions, hooks, pure logic
- **Component Tests**: React components with RTL (user interaction, rendering)
- **Integration Tests**: API hooks with MSW (mock service worker) for API mocking
- **Location**: `client/src/**/*.test.ts(x)`
- **Coverage**: All critical user flows (auth, CRUD, form validation)

### Testing Rules

- **Write tests alongside code** - every new feature/module must include tests
- **Test behavior, not implementation** - focus on what the code does, not how
- **No snapshot tests** unless explicitly requested
- **Mock external dependencies** (DB, API calls) in unit tests; use real DB in integration tests

---

## CI/CD (GitHub Actions)

### Pipeline (runs on every PR and push to main)

1. **Lint**: ESLint for client + server
2. **Type-check**: `tsc --noEmit` for client + server + shared
3. **Test**: Run all unit + integration tests (client Vitest, server Jest)
4. **Build**: Verify build passes for client + server
5. **Deploy**: Auto-deploy to Railway on merge to main

### Workflow Files

- `.github/workflows/ci.yml` - Lint, type-check, test, build (on PR)
- `.github/workflows/deploy.yml` - Deploy to Railway (on push to main)

### Rules

- **PRs must pass CI** before merge
- **No skipping tests** in CI pipeline
- **Server integration tests** use a dedicated test database (Railway or in-memory PG)

---

## Development Process

### Before Implementation

1. Understand the full context of the request
2. Identify affected components and services
3. Evaluate dependencies and side effects
4. Plan all steps using TodoWrite

### Ask Clarifying Questions

If not clearly defined, clarify:

- Where should the new code be placed?
- What level of input validation is expected?
- What error scenarios should be handled?
- Are there performance or scalability constraints?

### Validation with User

**Approval required at key checkpoints**:

1. Before starting major work
2. After preparing implementation plan
3. If architectural decisions are needed

---

## Naming Conventions

- **JS/TS**: camelCase for variables, PascalCase for classes/types/components
- **Files**: kebab-case for all packages (client, server, shared)
- **NestJS**: `{name}.module.ts`, `{name}.controller.ts`, `{name}.service.ts`, `{name}.repository.ts`
- **Tests**: `{name}.spec.ts` (Jest/backend), `{name}.test.ts(x)` (Vitest/frontend)

---

## Git & Commits

- **NEVER** include `Co-Authored-By` footer in commits
- Use `commits` skill for automated commit creation following Conventional Commits
- Follow commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`

---

## Client Feature Structure Convention

Chaque feature dans `client/src/features/{feature}/` DOIT suivre cette structure :

```
features/{feature}/
├── api/                   # Server State (donnees serveur)
│   ├── {feature}.ts       # Fonctions API pures (fetch, create, update, delete via REST)
│   └── use-{feature}.ts   # React Query UNIQUEMENT (useQuery, useMutation)
│
├── hooks/                 # Client State (etat local UI)
│   └── use-{xxx}.ts       # Custom hooks (useState, useCallback, useReducer, Context)
│
├── schemas/               # Validation Zod UNIQUEMENT (ou re-export from @shared)
│   └── index.ts           # Schemas Zod + types derives (z.infer<>)
│
├── types/                 # Types TypeScript purs
│   └── index.ts           # Interfaces, types (entites, DTOs, state)
│
├── utils/                 # Fonctions utilitaires pures
│   ├── {domain}-helpers.ts
│   ├── {domain}-validation.ts
│   └── {domain}-calculations.ts
│
├── constants/             # Constantes (optionnel)
│   └── index.ts
│
└── components/            # Composants React UI
    └── {component}.tsx
```

### Regles de placement

| Le code utilise...                          | → Va dans      |
| ------------------------------------------- | -------------- |
| `useQuery` / `useMutation` (React Query)    | `api/`         |
| `useState` / `useReducer` / `useCallback`   | `hooks/`       |
| `createContext` / `useContext`              | `hooks/`       |
| `z.object()` / `z.string()` (Zod)           | `schemas/`     |
| `interface` / `type` (TS pur)               | `types/`       |
| Fonctions pures (calculs, formatage)        | `utils/`       |
| Appels REST API (sans React Query)          | `api/`         |

---

## Server Module Structure Convention

Chaque module NestJS dans `server/src/{module}/` suit cette structure :

```
{module}/
├── {module}.module.ts       # NestJS module definition
├── {module}.controller.ts   # HTTP endpoints (thin, delegates to service)
├── {module}.service.ts      # Business logic
├── {module}.repository.ts   # Prisma data access (optional, for complex queries)
├── dto/                     # Re-exports from @shared or module-specific DTOs
│   └── index.ts
└── __tests__/               # Module-specific tests
    ├── {module}.service.spec.ts
    └── {module}.controller.spec.ts
```

### NestJS Rules

- **Controllers**: Thin - validate input (ZodPipe), call service, return response
- **Services**: All business logic lives here. Services own the mapping Prisma ↔ DTO
- **Repositories**: Optional, only when Prisma queries are complex (raw SQL, transactions)
- **Guards**: `JwtAuthGuard` on all protected routes, ownership checks in services
- **Pipes**: `ZodValidationPipe` with schemas from `@shared`

---

## Common Commands

```bash
# Setup (from root)
pnpm install

# Start Dev
pnpm --filter client dev        # React frontend
pnpm --filter server start:dev  # NestJS backend (watch mode)

# Build
pnpm --filter client build
pnpm --filter server build

# Test
pnpm --filter client test       # Vitest
pnpm --filter server test       # Jest unit tests
pnpm --filter server test:e2e   # Jest integration tests

# Prisma
pnpm --filter server prisma:generate   # Generate Prisma client
pnpm --filter server prisma:migrate    # Run migrations
pnpm --filter server prisma:studio     # Open Prisma Studio

# Lint
pnpm --filter client lint
pnpm --filter server lint
```
