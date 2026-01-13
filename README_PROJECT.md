# ResAid Web Application

## Project Overview

ResAid is a modern SaaS application that helps job seekers apply faster and answer better using AI grounded in their resume data.

## Stack

### Frontend
- **Next.js 16.1** (App Router)
- **TypeScript**
- **Tailwind CSS 4**
- **shadcn/ui** (UI components)
- **Framer Motion** (animations)
- **Lucide React** (icons)

### Backend (Next Steps)
- **Next.js API Routes / Server Actions**
- **PostgreSQL** (database)
- **Prisma ORM**
- **Clerk** or **NextAuth** (authentication)

## Project Structure

```
resaid-web/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/
│   │   └── button.tsx      # shadcn button component
│   └── resume-upload.tsx   # Resume upload component
├── lib/
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── postcss.config.mjs
```

## Features Implemented

✅ **Landing Page**
- Hero section with animated gradient text
- Feature cards (Lightning Fast, AI-Powered, Always Honest)
- Resume upload section
- Call-to-action (CTA) sections
- Responsive navigation bar
- Footer

✅ **Resume Upload Component**
- Drag-and-drop file upload
- File type validation (PDF, DOCX, DOC)
- File preview with size display
- Loading state
- Disabled state management

✅ **Design System**
- Modern, clean UI
- Dark mode support via Tailwind
- Smooth animations with Framer Motion
- Accessible components with shadcn/ui

## Getting Started

### Installation

```bash
cd resaid-web
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## Next Steps

### Phase 1: Backend Setup
1. Set up database schema with Prisma
2. Create resume parsing API endpoint
3. Implement authentication (Clerk recommended)
4. Create dashboard for users

### Phase 2: AI Integration
1. Integrate resume parsing library
2. Create resume JSON schema
3. Build AI scoring endpoint
4. Build AI answer generation endpoint

### Phase 3: Chrome Extension
1. Create extension manifest
2. Build autofill functionality
3. Connect to backend API
4. Add authentication to extension

### Phase 4: Polish
1. User onboarding flow
2. Resume versioning
3. Application tracking
4. Analytics

## Key Components

### ResumeUpload Component
Location: `components/resume-upload.tsx`

Features:
- Drag-and-drop support
- File validation
- Loading states
- Visual feedback

### Button Component
From shadcn/ui with multiple variants:
- `default` - Primary button
- `outline` - Secondary button
- `ghost` - Tertiary button

## TypeScript Configuration

All components use TypeScript with strict type checking enabled. Type definitions are included for:
- React components
- Event handlers
- Form inputs

## Tailwind CSS Configuration

Using Tailwind CSS v4 with:
- Custom CSS variables for theming
- Dark mode support
- Responsive design utilities
- Animation utilities from tw-animate-css

## Environment Setup

No environment variables required for local development.

For production, you'll need:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_AUTH_PROVIDER` - Auth provider config
- Database connection strings
- AI API keys

## Git Repository

Git repository initialized with `.gitignore` configured for Next.js.

## Development Tips

1. **Hot Reload**: Changes to files automatically refresh in the browser
2. **TypeScript**: Type errors appear in terminal
3. **Linting**: Run `npm run lint` to check code quality
4. **Component Library**: Use `npx shadcn@latest add [component]` to add more components

## Architecture Decision Record

### Why Next.js?
- Fast iteration with App Router
- Server Actions reduce API boilerplate
- Built-in SEO support for landing pages
- Excellent DX for full-stack development
- Easy deployment to Vercel

### Why Tailwind + shadcn/ui?
- Rapid UI development
- Consistent design system
- Accessibility built-in
- Easy to customize with CSS variables

### Why Framer Motion?
- Smooth, performant animations
- Simple API for common patterns
- Great for building engaging UIs

## Deployment

Ready to deploy to:
- **Vercel** (recommended) - Native Next.js support
- **AWS** (Amplify, Lambda, etc.)
- **Azure** (App Service, Functions)
- **Self-hosted** (Docker, Kubernetes)

## Support

For questions about:
- **Next.js**: https://nextjs.org/docs
- **Tailwind**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion/

---

**Project Status**: MVP Phase - Core landing page & upload UI ✅
