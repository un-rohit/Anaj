# ANAJ — Agricultural Procurement Platform

**ANAJ (अनाज)** connects farmers with the ANAJ company for agricultural produce procurement.

- 🌾 **Farmer Android App** — React Native + Expo (Hindi-first, bilingual, offline-ready)
- 🌐 **Farmer Web Portal** — Next.js 15 (Live rates, phone OTP, produce selling, request tracking)
- 🖥️ **Admin Dashboard** — Next.js 15 (Owner & staff procurement operations, 12-stage workflow)
- 🔌 **Backend API** — Node.js + Express + PostgreSQL (Prisma, JWT, SHA-256 tokens)

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20.0.0 |
| npm | ≥ 10.0.0 |
| PostgreSQL | ≥ 15 |
| Android Studio | Latest (for Android emulator) |

---

## Quick Start

### 1. Clone and install

```bash
git clone <repo-url>
cd anaj
cp .env.example .env
# Fill in your DATABASE_URL and other secrets in .env
npm install
```

### 2. Set up the database

```bash
npm run db:generate       # Generate Prisma client
npm run db:migrate:dev    # Run migrations (creates all tables)
npm run db:seed           # Seed development data
```

### 3. Start all apps in development

```bash
npm run dev
```

Or individually:

```bash
cd apps/api && npm run dev      # Backend API on port 4000
cd apps/admin && npm run dev    # Farmer Web Portal & Admin Console on port 3000
cd apps/mobile && npm run dev   # Expo mobile app
```

---

## Development credentials (after seed)

| Account | Phone | Password / OTP | Portal Route |
|---------|-------|----------------|--------------|
| Owner / Staff | `9000000001` | `Dev@anaj2024!` | `/admin/login` |
| Farmer Web / Mobile | `9876543210` (or any 10-digit) | `123456` in dev mode | `/farmer/login` |

---

## Project Structure

```
anaj/
├── apps/
│   ├── mobile/     # React Native + Expo — Farmer Android app
│   ├── admin/      # Next.js 15 — Farmer Web Portal & Owner Admin Console
│   └── api/        # Express.js — REST API (port 4000)
├── packages/
│   ├── shared-types/       # TypeScript interfaces + 12-stage workflow
│   ├── shared-validation/  # Zod schemas (shared client/server)
│   └── config/             # TS, ESLint, Prettier base configs
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema
│   └── seed.ts              # Dev seed data (7 crops + owner)
└── docs/
    ├── architecture.md
    ├── database.md
    ├── api.md
    └── deployment.md
```

---

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start all apps in parallel |
| `npm run build` | Build all apps (SSG static pages + TypeScript compiles) |
| `npm run typecheck` | TypeScript check across all packages |
| `npm run lint` | ESLint across all packages |
| `npm run test` | Run all tests |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:migrate:dev` | Run DB migrations (development) |
| `npm run db:migrate:deploy` | Run DB migrations (production) |
| `npm run db:seed` | Seed development data |
| `npm run db:studio` | Open Prisma Studio |

---

## Language Support

The platform is fully bilingual: **Hindi (हिन्दी)** and **English**.

- Mobile app shows a **language selection screen** on first launch before login
- Default and fallback language is **Hindi**
- Preference persists in AsyncStorage; survives app restarts
- Language can be changed anytime from Settings / Profile
- Web platform (Farmer Portal & Admin) uses next-intl with URL-based locale routing (`/` = Hindi, `/en/...` = English)

### Translation files

| App | Hindi | English |
|-----|-------|---------|
| Mobile | `apps/mobile/src/i18n/locales/hi.json` | `apps/mobile/src/i18n/locales/en.json` |
| Web (Farmer + Admin) | `apps/admin/src/i18n/messages/hi.json` | `apps/admin/src/i18n/messages/en.json` |

---

## ⚠️ Important Notes

1. **Business email**: `anajsellkishan01@gamil.com` — domain `gamil.com` may be a typo for `gmail.com`. **Verify with the business owner before production.**
2. **OTP**: Real SMS OTP in production. Configure `SMS_PROVIDER` in `.env`.
3. **Rates**: Never hardcode. All rates managed through the admin dashboard.
4. **Procurement Policy**: Only ANAJ company purchases produce. Farmers cannot purchase or trade with each other.

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation, DB schema, i18n, monorepo | ✅ Complete |
| 2 | Backend API: auth, farmers, products, rates, requests, audit | ✅ Complete |
| 3 | Admin management console: metrics, rates, requests, audit logs | ✅ Complete |
| 4 | Farmer Web Portal: live rates, OTP login, sell form, request tracker | ✅ Complete |
| 5 | Farmer Android mobile app: bilingual auth, home, sell flow, history | ✅ Complete |
| 6 | Operations, end-to-end integration, and production readiness | ✅ Complete |
