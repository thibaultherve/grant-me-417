# GET GRANTED 417

Web application to help Working Holiday Visa (417) holders in Australia track their work hours, manage employers, and monitor visa compliance requirements.

## Tech Stack

| Layer       | Technology                                                 |
| ----------- | ---------------------------------------------------------- |
| **Client**  | React 19, TypeScript, Vite 7, TailwindCSS 4, Shadcn UI     |
| **Server**  | NestJS 11, Prisma ORM, Passport.js + JWT                   |
| **Shared**  | Zod 4 schemas, inferred TypeScript types, shared constants |
| **DB**      | PostgreSQL (Railway)                                       |
| **Hosting** | Railway                                                    |

## Monorepo Structure

```
get-granted-417/
├── client/          # React SPA (@get-granted/client)
├── server/          # NestJS API (@get-granted/server)
├── shared/          # Zod schemas & types (@get-granted/shared)
└── pnpm-workspace.yaml
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9

## Getting Started

```bash
# Install dependencies
pnpm install

# Build the shared package first
pnpm build:shared

# Start development servers
pnpm dev:client    # React frontend (Vite)
pnpm dev:server    # NestJS backend (watch mode)
```

## Environment Variables

Copy the example files and fill in your values:

```bash
cp client/.env.example client/.env
```

### Client (`client/.env`)

## Scripts

```bash
# Development
pnpm dev:client          # Start React dev server
pnpm dev:server          # Start NestJS in watch mode

# Build
pnpm build               # Build all packages
pnpm build:client        # Build React app
pnpm build:server        # Build NestJS app
pnpm build:shared        # Build shared package

# Test
pnpm test                # Run all tests

# Lint
pnpm lint                # Lint all packages

# Prisma (from server)
pnpm --filter server prisma:generate   # Generate Prisma client
pnpm --filter server prisma:migrate    # Run migrations
pnpm --filter server prisma:studio     # Open Prisma Studio
```

## Architecture

- **Prisma** is the source of truth for the **database schema** (migrations, relations)
- **Zod** (in `/shared`) is the source of truth for **API contracts** (DTOs, validation)
- NestJS services handle the mapping between Prisma models and Zod DTOs
- The client never accesses the database directly — all data flows through REST API calls

## License

Private — All rights reserved.
