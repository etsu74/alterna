# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is ALTERNA Light Dashboard - a Next.js 15 application for monitoring investment opportunities and performance from MDM's ALTERNA digital securities service. The system uses Supabase for backend services including PostgreSQL, Storage, Edge Functions, and Row Level Security.

## Development Commands

### Essential Commands
```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint
```

### Environment Setup
- Copy `.env.example` to `.env.local` and configure Supabase credentials
- Required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (safe for client exposure)
  - `SUPABASE_SERVICE_ROLE_KEY` - Server-only service role key (never expose to client)

## Architecture Overview

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (TanStack Query) for server state
- **Theme**: next-themes for dark/light mode support

### Backend Stack
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Anonymous access with RLS policies
- **Storage**: Supabase Storage with private buckets and signed URLs
- **Functions**: Supabase Edge Functions for RSS processing
- **Scheduler**: Supabase Cron for automated data collection

### Key Directories
```
app/                    # Next.js App Router pages
├── layout.tsx         # Root layout with tab navigation
├── page.tsx           # Home page (news timeline)
├── protected/         # Protected routes
├── auth/              # Authentication pages
└── api/               # API routes
components/            # React components
├── ui/                # shadcn/ui base components
├── tutorial/          # Tutorial components
├── auth-button.tsx    # Authentication UI
├── hero.tsx           # Landing page hero
└── theme-switcher.tsx # Dark/light mode toggle
lib/                   # Utility libraries
├── supabase/          # Supabase client configurations
│   ├── client.ts      # Client-side Supabase client
│   ├── server.ts      # Server-side Supabase client
│   └── middleware.ts  # Auth middleware
└── utils.ts           # Utility functions
```

## Security Architecture

### Service Role Management
- `lib/supabase/server.ts` - Server-side client with service role access
- Always uses `import "server-only"` to prevent client exposure
- API routes using service role must set `export const runtime = "nodejs"`

### Row Level Security (RLS)
- News tables (`al_tr_events`, `al_tr_performance`) - Anonymous SELECT allowed
- Snapshot table (`al_offering_snaps`) - Service role only, no public access
- Storage buckets are private with service role-only policies

### Signed URL Pattern
- Private images served via signed URLs generated server-side
- API endpoint: `GET /api/snapshots` returns signed URLs for secure image access
- Signed URLs expire after 1 hour for security

## Data Model

### Core Tables
- `sources_raw` - Raw RSS data storage
- `al_tr_events` - Normalized investment events (URL column has UNIQUE constraint)
- `al_tr_performance` - Performance tracking data
- `al_offering_snaps` - Private snapshot management

### Event Types
- `NEW_LISTING` - New investment opportunities
- `REDEMPTION` - Redemption and distribution info
- `RESULT` - Lottery and performance results
- `REVIEW` - Reviews and reputation info

### Subscription Methods
- `FCFS` - First Come, First Served
- `DRAW` - Lottery system

## Development Patterns

### Component Structure
- Use TypeScript throughout
- Follow shadcn/ui patterns for consistent UI components
- Implement proper error boundaries for robust error handling
- Use React Query for all server state management

### API Development
- API routes in `app/api/` follow REST conventions
- Service role APIs require `runtime = "nodejs"`
- Always implement proper error handling and logging
- Use signed URLs for private resource access

### Styling Guidelines
- Use Tailwind CSS with utility classes
- Follow shadcn/ui component patterns
- Implement responsive design for mobile/desktop
- Support dark/light theme switching

## Testing Strategy

Currently using the Next.js and Supabase starter template foundation. When implementing tests:
- Use Jest + React Testing Library for component tests
- Test RLS policies and security boundaries
- Verify signed URL generation and expiration
- Test responsive design across devices

## Deployment

### Environment Variables
Set these in your deployment environment:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never client-exposed)

### Build Process
The application builds to static exports where possible, with server-side rendering for authenticated routes and API functionality.

## Key Implementation Notes

1. **Security First**: Never expose service role keys to client-side code
2. **Performance**: Use React Query caching and Next.js Image optimization
3. **Compliance**: Respect robots.txt and rate limiting when fetching external data
4. **User Experience**: Implement loading states and error boundaries throughout
5. **Responsive Design**: Ensure mobile-first approach with desktop optimization

## URGENT: Security Vulnerabilities Discovered (2025-09-13)

⚠️ **CRITICAL SECURITY ISSUES FOUND - MUST FIX IMMEDIATELY**

Security testing revealed multiple critical vulnerabilities in the current Supabase configuration:

### 🚨 Critical Issues Found:
1. **DELETE Access**: Anonymous users can delete records from `al_tr_events` table
2. **Snapshot Access**: Anonymous users can read private `al_offering_snaps` table
3. **Storage Listing**: Anonymous users can list files in private storage buckets

### 🔧 Required Immediate Actions:
1. **Fix RLS Policies**: Restrict DELETE and UPDATE permissions for anonymous users
2. **Secure Snapshot Table**: Remove anonymous SELECT access from `al_offering_snaps`
3. **Lock Storage Buckets**: Configure storage policies to deny anonymous listing
4. **Re-run Security Tests**: Verify all vulnerabilities are resolved

### 📍 Next Development Session Priority:
**START WITH SECURITY FIXES BEFORE ANY OTHER DEVELOPMENT**

Security test script available at: `test-security.js`
Current vulnerabilities make the system unsafe for production deployment.

---

## Common Tasks

### Adding New Components
1. Create component in `components/` directory
2. Follow TypeScript typing patterns
3. Use Tailwind CSS for styling
4. Add to component exports if reusable

### Adding API Routes
1. Create in `app/api/` following REST patterns
2. Set `runtime = "nodejs"` if using service role
3. Implement proper error handling
4. Use appropriate Supabase client (client vs service role)

### Database Changes
1. Use Supabase migration system
2. Update RLS policies as needed
3. Verify security boundaries after changes
4. Test both anonymous and service role access patterns