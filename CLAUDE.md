# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**Grant Me 417** is a React SPA for tracking work hours for Working Holiday Visa 417 holders in Australia. The application helps backpackers calculate and track their "specified work" hours to qualify for second or third Working Holiday Visas.

### Learning Context

This is a **learning project** - the developer's first solo React project being built for educational purposes and portfolio development.

- **Code Language**: ALL code, comments, variable names, function names, and documentation files MUST be in English only
- **Communication Language**: The developer communicates primarily in French. Claude should respond in French for terminal/CLI interactions and explanations, but all code and documentation must remain in English

---

## ⚠️ MANDATORY Documentation Usage

For ALL React questions and solutions, you MUST use the configured MCP servers BEFORE proposing any code or solution.

### Configured MCP Servers

#### 1. docs-mcp-server (React Official Documentation)

- **MCP Server Name**: `docs-mcp-server`
- **Type**: SSE server on http://localhost:6280/sse
- **Purpose**: Access official React documentation from react.dev
- **Library Parameter**: `library: "react"` (ALWAYS use "react" as library name)
- **Tool Function**: `mcp__docs-mcp-server__search_docs`
- **Usage**: React APIs, hooks, components, official patterns, React 19+ features
- **Status**: Requires local server running
- **Example Call**:
  ```
  mcp__docs-mcp-server__search_docs({
    library: "react",
    query: "useEffect hook patterns",
    limit: 3
  })
  ```

#### 2. bulletproof-react Docs (Project Architecture)

- **MCP Server Name**: `bulletproof-react Docs` (note the space in the name)
- **Type**: Remote GitMCP server
- **Source**: https://github.com/alan2207/bulletproof-react
- **Purpose**: Architecture patterns, project structure, best practices
- **Usage**: Feature-based architecture, folder conventions, state management, API layers
- **Status**: Remote server (always available)
- **Access Method**: Use ReadMcpResourceTool or ListMcpResourcesTool with server name "bulletproof-react Docs"
- **Example Call**:
  ```
  ListMcpResourcesTool({
    server: "bulletproof-react Docs"
  })
  ```

### Mandatory Workflow

**BEFORE proposing ANY solution or code:**

1. **Step 1**: Use **"bulletproof-react Docs"** MCP to search for:

   - Project structure patterns
   - Code organization best practices
   - Feature-based architecture
   - Folder structure conventions
   - Testing patterns
   - State management approaches
   - API layer patterns

2. **Step 2**: Use **"docs-mcp-server"** MCP to search for:

   - React API verification (ensure APIs exist in React 19+)
   - Official examples from react.dev
   - Hook usage patterns
   - Component patterns
   - Performance best practices

3. **Step 3**: Synthesize both sources to create a solution that:

   - Follows bulletproof-react architecture
   - Uses current React 19+ APIs correctly
   - Implements official React best practices

4. **Step 4**: Propose your solution with citations

### Response Format Template

For EVERY React request, you MUST follow this format:

```
I will first consult the documentation via the configured MCP servers...

Step 1: Checking bulletproof-react for architectural best practices...
[Use ListMcpResourcesTool or ReadMcpResourceTool with server: "bulletproof-react Docs"]
[Show search query and results]

Step 2: Checking React official documentation for API details...
[Use mcp__docs-mcp-server__search_docs with library: "react"]
[Show search query and results]

Step 3: Synthesizing findings...
[combine insights from both sources]

Based on the documentation:
- From bulletproof-react: [specific architecture/pattern used]
- From React docs: [specific API/pattern used]

[provide solution with code]

Sources:
- bulletproof-react: [specific file/section referenced]
- React docs: [specific page/API referenced]
```

### ⚠️ CRITICAL RULES

**NEVER:**

- ❌ Propose code based solely on training data
- ❌ Skip MCP server consultation
- ❌ Use deprecated React patterns
- ❌ Ignore bulletproof-react architecture patterns
- ❌ Respond without citing sources from both MCP servers
- ❌ Use `library: "bulletproof-react"` with docs-mcp-server (wrong!)
- ❌ Confuse the two MCP servers

**ALWAYS:**

- ✅ Use ListMcpResourcesTool/ReadMcpResourceTool with `server: "bulletproof-react Docs"` FIRST for architecture
- ✅ Use mcp__docs-mcp-server__search_docs with `library: "react"` SECOND for React APIs
- ✅ Verify APIs exist in React 19+
- ✅ Follow bulletproof-react folder structure
- ✅ Cite sources from both MCP servers
- ✅ Start responses with documentation consultation

### MCP Server Priorities

When information conflicts:

1. **Architecture/Structure**: Prefer bulletproof-react Docs
2. **React APIs/Syntax**: Prefer docs-mcp-server (official docs)
3. **Best Practices**: Combine both sources intelligently

### Verification Checklist

Before finalizing ANY response:

- [ ] Consulted bulletproof-react Docs MCP for architecture
- [ ] Consulted docs-mcp-server MCP for React APIs
- [ ] Code follows bulletproof-react structure
- [ ] APIs verified in React 19+ via docs-mcp-server
- [ ] Both sources cited with specific references
- [ ] Response started with documentation consultation

### Quick Reference: MCP Tool Usage

**For bulletproof-react architecture:**
```javascript
// List available resources
ListMcpResourcesTool({ server: "bulletproof-react Docs" })

// Read specific resource
ReadMcpResourceTool({
  server: "bulletproof-react Docs",
  uri: "resource-uri-from-list"
})
```

**For React official documentation:**
```javascript
// Search React docs
mcp__docs-mcp-server__search_docs({
  library: "react",  // ALWAYS "react", never "bulletproof-react"
  query: "your search query",
  limit: 3
})
```

---

## Technology Stack

### Frontend

- **React 19.1.0** - Latest React with modern hooks and features
- **Vite 7.0.0** - Build tooling with ESM and fast HMR
- **React Router 7.6.3** - Client-side routing with nested routes
- **Tailwind CSS 4.1.11** - Utility-first styling with CSS variables
- **shadcn/ui** - Modern component design system (see `components.json`)
- **Lucide React 0.525.0** - 1000+ customizable icons
- **Recharts 3.0.2** - Professional charts and data visualization

### Backend & Database

- **Supabase** - Authentication, PostgreSQL database, real-time subscriptions
- **PostgreSQL** - 47 migrations with comprehensive schema
- **Row Level Security (RLS)** - Secure multi-user data access
- **PostgreSQL Functions** - Complex business logic and calculations
- **Auto-triggers** - Data consistency and progress updates

### Development Tools

- **Package Manager**: pnpm
- **Language**: JavaScript (JSX, not TypeScript initially)
- **Validation**: Zod for runtime validation
- **Environment Variables**:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

---

## Project Architecture

### Architectural Patterns

**Multi-Context State Management:**

- `AuthContext` + `AuthContextProvider` for authentication state
- `VisaContext` + `VisaProvider` for visa selection and switching
- Protected routes with `ProtectedRoute` components

**Database Schema (4 main tables):**

- `user_profiles` - User account information
- `user_visas` - Visa records for each user
- `employers` - Employer information
- `work_entries` - Individual work hour entries

**Database Features:**

- Foreign key relationships maintaining referential integrity
- Generated columns for calculated fields
- Check constraints for business rule enforcement
- RLS policies for secure data access

### File Structure (Bulletproof React Pattern)

Follow feature-based architecture:

```
src/
├── features/           # Feature modules
│   ├── auth/          # Authentication feature
│   ├── work-entries/  # Work tracking feature
│   └── visas/         # Visa management feature
├── components/        # Shared components
├── lib/              # Utilities and configurations
├── hooks/            # Custom hooks
└── contexts/         # Context providers
```

### Import Aliasing

- `@/` points to `src/` directory via Vite config
- Example: `import { Button } from '@/components/ui/button'`

---

## Development Guidelines

### shadcn/ui Components - MANDATORY

**ALWAYS use shadcn CLI to install components. NEVER create them manually.**

```bash
npx shadcn@latest add [component-name]
```

**Component Usage Rules:**

- ✅ Use shadcn/ui components for ALL UI elements whenever possible
- ✅ Prioritize shadcn/ui over custom components
- ✅ Only create custom components when shadcn/ui doesn't provide functionality
- ✅ Always check shadcn/ui library FIRST before writing custom UI code
- ✅ Maintain design consistency using shadcn/ui design system

### Data Validation Strategy

**Use Zod for ALL validation:**

- Create reusable schemas that mirror database structure
- Validate data BEFORE sending to Supabase
- Use Zod for type inference
- Validate all form inputs and API data

### Mobile-First Design - MANDATORY

**This application MUST be designed mobile-first.**

**Core Principles:**

- **Target Devices**: Smartphones (375px, 360px widths)
- **Mobile-First Responsive**: Mobile design is primary, desktop is enhancement
- **Mobile Native Feel**: App-like experience with mobile UI patterns

**Responsive Strategy:**

- Design for mobile first (375px viewport)
- Add responsive enhancements for tablet (768px+)
- Minimal adaptations for desktop (1024px+)

### Development Commands

```bash
pnpm dev       # Start development server
pnpm build     # Build production bundle
pnpm lint      # Run ESLint
pnpm preview   # Preview production build
```

### Form Handling

- Use FormData with custom validation utilities
- Validate with Zod before submission
- Consistent error handling with user-friendly messages

---

## Working Holiday Visa 417 - Business Context

### Application Purpose

Grant Me 417 helps Working Holiday Visa (WHV) 417 holders track "specified work" to qualify for visa extensions. The name represents "Grant Me" (getting your visa granted) with "417" referencing the Working Holiday Visa subclass 417.

### Target Users

**International backpackers** (not Australian citizens) who hold Working Holiday Visas and work in Australia.

**Eligible Countries/Territories (19 total):**

- European: Belgium, Cyprus, Denmark, Estonia, Finland, France, Germany, Ireland, Italy, Malta, Netherlands, Norway, Sweden, UK
- Asian: Hong Kong, Japan, South Korea, Taiwan
- Other: Canada

**NOT Eligible for WHV 417** (must use subclass 462):
Argentina, Austria, Chile, China, Czech Republic, Hungary, Indonesia, Israel, Luxembourg, Malaysia, Peru, Poland, Portugal, San Marino, Singapore, Slovakia, Slovenia, Spain, Thailand, Turkey, USA, Uruguay, Vietnam

### Specified Work Requirements

**Second WHV (2nd year):**

- Duration: 88 calendar days (3 months minimum)
- Work Type: "Specified work" in eligible industries/regional areas
- Can be continuous or accumulated

**Third WHV (3rd year):**

- Duration: 179 calendar days (6 months minimum)
- Work Type: "Specified work" in eligible industries/regional areas
- Important: Cannot be completed in less than 6 calendar months total period

### Eligible Industries (ANZSIC Classification)

1. **Plant and Animal Cultivation** - Agriculture, farming, fruit picking, livestock
2. **Fishing and Pearling** - Commercial fishing, aquaculture, pearl diving
3. **Tree Farming and Felling** - Forestry, logging, tree cultivation
4. **Mining** - All mining sector activities
5. **Construction** - All construction sector activities
6. **Hospitality & Tourism** - Chef, guest services, dive instructor, tour guide (Northern Australia & Remote areas only, from June 2021)
7. **Bushfire Recovery Work** - Land/property restoration, wildlife care, support services
8. **Critical COVID-19 Work** - Medical, aged care, disability care, childcare, food processing

### Key Statistics

- **19 eligible countries/territories** for WHV 417
- **~150,000+ annual applicants** across all nationalities
- **Demographics**: Europeans (60%), Canadians (20%), Asians (20%)
- **Highest volume**: UK, Germany, France, Ireland, Canada, Japan

---

## Future Implementations

### Internationalization (i18n)

**Priority Languages:**

- **Tier 1**: German, French, Italian
- **Tier 2**: Dutch, Swedish, Danish, Norwegian

**Implementation Plan:**

- React i18next
- Subdirectory URLs (/de/, /fr/)
- Browser detection with English fallback

### Progressive Enhancement

- **Initial**: Simple useState/useContext
- **Future**: React Query/SWR for server state
- **Future**: Advanced state management as needed

---

## Troubleshooting MCP Servers

### docs-mcp-server not connecting

Ensure the server is running locally:

```bash
npx @arabold/docs-mcp-server@latest --protocol http --host 0.0.0.0 --port 6280
```

Verify connection: http://localhost:6280

### bulletproof-react Docs not available

This uses GitMCP remote server and should work automatically. If issues persist, check network connectivity.

### Verify MCP Status

In Claude Code:

```bash
/mcp
```

You should see:

- ✅ docs-mcp-server: connected
- ✅ bulletproof-react Docs: connected

---

## Common Development Patterns

### Feature Creation

1. Search bulletproof-react Docs: "features folder structure"
2. Search docs-mcp-server: relevant React APIs
3. Implement following both patterns

### Component Creation

1. Search bulletproof-react Docs: "components organization"
2. Search docs-mcp-server: "component patterns" or relevant hooks
3. Create component following both sources

### State Management

1. Search bulletproof-react Docs: "state management patterns"
2. Search docs-mcp-server: "context api" or "useReducer"
3. Implement following both guidelines

### API Integration

1. Search bulletproof-react Docs: "api layer patterns"
2. Search docs-mcp-server: "data fetching" or "useEffect"
3. Create API layer following both patterns

---

## ⚠️ IMPORTANT - Git Commit Policy

**NEVER create commits or push to repository without explicit user authorization.**

Claude Code must ALWAYS ask for permission before:
- Running `git add`
- Running `git commit`
- Running `git push`
- Making any git operations that modify history

---

**Remember**: This is a learning project. Always consult documentation via MCP servers, follow bulletproof-react architecture, use React 19+ features, and maintain mobile-first responsive design.
