# Real Estate Agent Portal - Copilot Instructions

## Project Overview
A Real Estate Agent Portal built with Nuxt 4 + Vue 3 for agents and internal staff to manage profiles, access secure PDF documents, and track inspection history.

## Tech Stack
- **Frontend/Backend**: Nuxt 4 + Vue 3 + TypeScript
- **Styling**: Tailwind CSS + Nuxt UI
- **Database**: Supabase Postgres
- **Storage**: Supabase Storage (private bucket for PDFs)
- **Deployment**: Vercel
- **Auth**: Stub authentication with session cookies

## Project Structure
```
/
├── components/          # Vue components (UI, layout, forms)
├── composables/         # Vue composables (auth, api, utils)
├── layouts/             # Page layouts (admin, agent, auth)
├── middleware/          # Route middleware (auth guards)
├── pages/               # File-based routing pages
├── server/
│   ├── api/            # Nitro API routes
│   ├── middleware/     # Server middleware
│   └── utils/          # Server utilities (db, storage)
├── types/              # TypeScript type definitions
├── utils/              # Shared utilities
└── public/             # Static assets
```

## User Roles
- **Admin**: Full access to all agents, documents, inspections
- **Agent**: Read-only access to their own data

## Key Environment Variables
```
ADMIN_PASSWORD=         # Password for admin login
AGENT_PASSCODE=         # Shared passcode for agent login
SUPABASE_URL=           # Supabase project URL
SUPABASE_KEY=           # Supabase anon key
SUPABASE_SERVICE_KEY=   # Supabase service role key
```

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build

## Coding Guidelines
- Use TypeScript strict mode
- Follow Vue 3 Composition API patterns
- Use Nuxt auto-imports for components and composables
- Server routes should validate auth and role permissions
- PDFs must only be served via signed URLs from server
- Always log sensitive operations to audit log
