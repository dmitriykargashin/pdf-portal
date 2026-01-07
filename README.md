# Real Estate Agent Portal

A modern web application for real estate agents and internal staff to manage profiles, access secure PDF documents, and track inspection history.

## 🚀 Tech Stack

- **Framework**: Nuxt 4 + Vue 3 + TypeScript
- **Styling**: Tailwind CSS + Nuxt UI
- **Database**: JSON files (demo mode) / Supabase Postgres (production)
- **Storage**: Local public folder (demo mode) / Supabase Storage (production)
- **Deployment**: Vercel

## 🎯 Demo Mode

This application runs in **demo mode** by default, using JSON files stored in `public/db/` for data persistence and `public/uploads/` for file storage. This allows you to run the full application without any external services.

**Demo Credentials:**
- **Admin**: Password `admin123`
- **Agent**: Use any Agent ID from the list + passcode `agent123`

**Sample Agents for Agent Login:**
- Sarah Johnson: `a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d`
- Michael Chen: `b2c3d4e5-f6a7-5b6c-9d0e-1f2a3b4c5d6e`
- Emily Rodriguez: `c3d4e5f6-a7b8-6c7d-0e1f-2a3b4c5d6e7f`

## 📋 Features

### Admin Dashboard
- View key metrics (total agents, inspections, documents)
- Recent activity feed
- Quick actions for common tasks

### Agent Management
- Create, edit, and delete agent profiles
- Search and filter agents
- View agent details with tabs for profile, documents, and inspections

### Document Management
- Secure PDF upload and storage
- Categorize documents (W9, Agreement, Insurance, Inspection Reports, Other)
- View documents inline with PDF viewer
- Download with signed URLs (short TTL for security)

### Inspection Tracking
- Schedule and manage property inspections
- Auto-populate agent information
- Track inspection status (scheduled, completed, canceled)

### Agent Portal
- Agents can view their own profile (read-only)
- Access their documents
- View their inspection history

### Security
- Role-based access control (Admin vs Agent)
- Private storage bucket for PDFs
- Signed URLs for secure document access
- Audit logging for sensitive operations

## 🔧 Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Quick Start (Demo Mode)

```bash
# Clone and install
git clone <repository-url>
cd pdf-portal
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` and login with:
- **Admin**: Password `admin123`
- **Agent**: Agent ID + Passcode `agent123`

### Production Setup (with Supabase)

See the "Supabase Setup" section below for connecting to a real database.

### 1. Clone and Install

```bash
git clone <repository-url>
cd pdf-portal
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema:
   - Copy contents of `supabase/schema.sql` and run in SQL Editor
3. Run the seed data (optional):
   - Copy contents of `supabase/seed.sql` and run in SQL Editor
4. Create a storage bucket:
   - Go to Storage → New bucket
   - Name: `documents`
   - Public: OFF (unchecked)

### 3. Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Fill in the values:

```env
# Authentication
ADMIN_PASSWORD=your-admin-password
AGENT_PASSCODE=your-agent-passcode

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

Find your Supabase keys:
- Go to Project Settings → API
- Copy the `URL`, `anon public` key, and `service_role` key

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔐 Authentication

This prototype uses stub authentication:

### Admin Login
- Password: Set via `ADMIN_PASSWORD` environment variable
- Default: `admin123`

### Agent Login
- Select agent from dropdown (or enter agent ID)
- Passcode: Set via `AGENT_PASSCODE` environment variable
- Default: `agent123`

## 📁 Project Structure

```
/
├── app/
│   ├── assets/css/         # Global CSS styles
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables (auth, api, utils)
│   ├── layouts/            # Page layouts (default, auth)
│   ├── middleware/         # Route middleware (auth guards)
│   ├── pages/              # File-based routing pages
│   └── types/              # TypeScript type definitions
├── server/
│   ├── api/                # Nitro API routes
│   │   ├── agents/         # Agent CRUD endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── audit/          # Audit log endpoint
│   │   ├── dashboard/      # Dashboard stats endpoint
│   │   ├── documents/      # Document management endpoints
│   │   └── inspections/    # Inspection CRUD endpoints
│   └── utils/              # Server utilities (db, storage, session)
├── supabase/
│   ├── schema.sql          # Database schema
│   ├── seed.sql            # Sample data
│   └── storage.sql         # Storage bucket config
└── public/                 # Static assets
```

## 🚀 Deployment (Vercel)

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `ADMIN_PASSWORD`
   - `AGENT_PASSCODE`
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Deploy!

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Agents
- `GET /api/agents` - List agents
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents` - Upload document
- `GET /api/documents/:id/url` - Get signed URL
- `DELETE /api/documents/:id` - Delete document

### Inspections
- `GET /api/inspections` - List inspections
- `POST /api/inspections` - Create inspection
- `GET /api/inspections/:id` - Get inspection
- `PUT /api/inspections/:id` - Update inspection

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard stats
- `GET /api/dashboard/activity` - Get recent activity

### Audit
- `GET /api/audit` - Get audit logs

## 🛡️ Security Considerations

- PDFs are stored in a private Supabase Storage bucket
- Document access requires authentication
- Signed URLs expire after 60 seconds
- Role-based access control on all endpoints
- Audit logging for sensitive operations
- Admin-only access for create/update/delete operations
- Agents can only access their own data

## 📜 License

MIT
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
