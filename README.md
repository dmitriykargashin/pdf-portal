# Real Estate Agent Portal

A modern web application for real estate agents and internal staff to manage profiles, access secure PDF documents, and track inspection history.

## 🚀 Tech Stack

- **Framework**: Nuxt 4 + Vue 3 + TypeScript
- **Styling**: Tailwind CSS + Nuxt UI v4
- **Database**: Turso (libSQL) - Serverless SQLite
- **Storage**: In-memory file storage (for demo; use S3/R2 for production)
- **Deployment**: Vercel

## 🗄️ Database

This application uses **Turso** (libSQL), a serverless SQLite database that works perfectly with Vercel's serverless functions. The database is automatically initialized with seed data on first connection.

### Demo Credentials

**Admin Login:**
- Password: `admin123`

**Agent Login:**
- Email: `david.thompson@cityproperties.com`
- Passcode: `agent123`

## 📋 Features

### Admin Dashboard
- View key metrics (total agents, inspections, documents)
- Recent activity feed
- Quick navigation to all sections

### Agent Management
- Create, edit, and delete agent profiles
- View agent details with tabs for Profile, Documents, and Inspections
- Documents linked to inspections for each agent

### Document Management
- Upload PDF documents through inspection pages
- Documents are linked to specific inspections
- Categorize documents (W9, Agreement, Insurance, Inspection Reports, Other)
- View documents inline with PDF viewer
- Download documents directly

### Inspection Tracking
- Schedule and manage property inspections
- Track inspection status (scheduled, completed, canceled)
- Upload documents to inspections
- View all documents for an inspection

### Agent Portal (for Agents)
- View own profile information (read-only)
- Access personal documents
- View inspection history with detail pages
- View and download documents for each inspection

### Security Features
- Role-based access control (Admin vs Agent)
- Session-based authentication with cookies
- Agents can only access their own data
- Audit logging for sensitive operations

## 🔧 Quick Start

### Prerequisites

- Node.js 18+
- npm
- Turso CLI (optional, for database management)

### Installation

```bash
# Clone and install
git clone <repository-url>
cd pdf-portal
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Turso credentials

# Start development server
npm run dev
```

Visit `http://localhost:3000` and login with the demo credentials above.

### Setting up Turso Database

1. **Create a Turso account** at [turso.tech](https://turso.tech)
2. **Create a database**:
   ```bash
   turso db create re-database
   ```
3. **Get your database URL and auth token**:
   ```bash
   turso db show re-database --url
   turso db tokens create re-database
   ```
4. **Add credentials to `.env`**:
   ```
   TURSO_DATABASE_URL=libsql://your-database-url.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   ```

The database tables and seed data are created automatically on first request.

## 📁 Project Structure

```
/
├── app/
│   ├── assets/css/         # Global CSS styles
│   ├── composables/        # Vue composables (useAuth, useAgents, etc.)
│   ├── layouts/            # Page layouts (default, auth)
│   ├── middleware/         # Route middleware (auth guards)
│   ├── pages/              # File-based routing
│   │   ├── admin/          # Admin pages
│   │   │   ├── agents/     # Agent management
│   │   │   ├── inspections/# Inspection management
│   │   │   └── audit.vue   # Audit log
│   │   ├── portal/         # Agent portal pages
│   │   │   ├── inspections/# Agent inspection views
│   │   │   ├── documents.vue
│   │   │   └── index.vue
│   │   └── login.vue       # Login page
│   └── types/              # TypeScript type definitions
├── server/
│   ├── api/                # Nitro API routes
│   │   ├── agents/         # Agent CRUD endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   ├── audit/          # Audit log endpoint
│   │   ├── dashboard/      # Dashboard stats endpoint
│   │   ├── documents/      # Document management endpoints
│   │   └── inspections/    # Inspection CRUD endpoints
│   └── utils/              # Server utilities
│       ├── jsonDb.ts       # Database wrapper (uses Turso)
│       ├── tursoDb.ts      # Turso database operations
│       ├── session.ts      # Session management
│       └── audit.ts        # Audit logging
└── .env.example            # Environment variable template
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Login (admin or agent)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/session` - Get current session

### Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create agent (admin only)
- `GET /api/agents/:id` - Get agent by ID
- `PUT /api/agents/:id` - Update agent (admin only)
- `DELETE /api/agents/:id` - Delete agent (admin only)

### Documents
- `GET /api/documents` - List documents (filter by agentId, inspectionId)
- `POST /api/documents` - Upload document (with inspectionId)
- `GET /api/documents/:id/url` - Get document URL for viewing
- `DELETE /api/documents/:id` - Delete document (admin only)

### Inspections
- `GET /api/inspections` - List inspections (filter by agentId, status)
- `POST /api/inspections` - Create inspection (admin only)
- `GET /api/inspections/:id` - Get inspection by ID
- `PUT /api/inspections/:id` - Update inspection (admin only)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/activity` - Get recent activity

### Audit
- `GET /api/audit` - Get audit logs (admin only)

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run typecheck
```


## 🚀 Deploying to Vercel

1. **Push your code to GitHub**

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and import your repository
   - Vercel will auto-detect Nuxt and configure the build

3. **Create Vercel Blob Storage**:
   - In Vercel Dashboard, go to **Storage** tab
   - Click **Create** → **Blob**
   - Name it (e.g., "pdf-portal-files")
   - Connect it to your project
   - The `BLOB_READ_WRITE_TOKEN` will be automatically added to your project

4. **Configure Environment Variables** in Vercel Dashboard → Settings → Environment Variables:
   ```
   ADMIN_PASSWORD=your-secure-admin-password
   AGENT_PASSCODE=your-secure-agent-passcode
   TURSO_DATABASE_URL=libsql://your-database.turso.io
   TURSO_AUTH_TOKEN=your-turso-auth-token
   ```
   Note: `BLOB_READ_WRITE_TOKEN` is auto-added when you connect Blob storage.

5. **Deploy!** Vercel will build and deploy automatically

### Storage

- **Database**: Turso (libSQL) - Serverless SQLite database
- **File Storage**: Vercel Blob - Persistent file storage for PDF uploads
  - Free tier: 1GB storage, 1GB bandwidth/month
  - Files persist across deployments and cold starts

## 📄 License

MIT
