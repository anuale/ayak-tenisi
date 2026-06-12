# Ayak Tenisi Skor - Development Guide

## Tech Stack
- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- shadcn/ui components
- Prisma ORM v7 (PostgreSQL) with `@prisma/adapter-pg`
- Auth.js v5 (next-auth@beta) - email/password credentials
- Lucide React icons
- PWA: @serwist/next

## Useful Commands
```bash
# Development
npm run dev                # Start dev server (port 3000)
npm run build              # Production build
npm run lint               # Run ESLint

# Database
npx prisma generate        # Generate Prisma client
npx prisma db push         # Push schema to database (dev only)
npx prisma migrate dev     # Create new migration
npx prisma studio          # Open Prisma Studio

# Docker
docker compose up -d       # Start PostgreSQL + App
docker compose down        # Stop services
```

## Project Structure
```
src/
├── app/                    # App Router pages
│   ├── layout.tsx          # Root layout (fonts, SessionProvider, PWA meta)
│   ├── page.tsx            # Dashboard (/)
│   ├── login/              # Login page
│   ├── register/           # Register page
│   ├── api/
│   │   ├── auth/[...nextauth]/  # Auth.js route handler
│   │   └── register/       # User registration API
│   └── globals.css         # Design tokens + global styles
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # TopAppBar, BottomNavBar
│   └── providers/          # SessionProvider
├── lib/
│   ├── db.ts               # Prisma client singleton
│   ├── auth.ts             # Auth.js configuration
│   └── auth-types.ts       # TypeScript module augmentation
└── generated/prisma/       # Generated Prisma client (gitignored)
```

## Design Tokens (Apex Court)
- Background: #0e1511 (OLED-optimized dark)
- Team A: #4edea3 (neon emerald green)
- Team B: #ec6a06 (vibrant orange)
- Glassmorphism: backdrop-blur-xl + semi-transparent surfaces
- Fonts: Anybody (scores/headings), Inter (UI), JetBrains Mono (stats)

## Game Rules (Ayak Tenisi)
- 2v2 or 3v3, played over a net, foot only
- Each side gets max 3 passes, 3rd pass must go to opponent's side
- Best of 5 sets, each set 10 points
- 5th set (tiebreaker) is 15 points
- Points table: 3 points per win, goal difference tracked
