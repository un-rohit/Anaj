# ANAJ — Agricultural Procurement Platform

**ANAJ (अनाज)** connects farmers with the ANAJ company for agricultural produce procurement.

- 🌾 **Farmer Android App** — React Native + Expo (Hindi-first, bilingual)
- 🖥️ **Admin Dashboard** — Next.js (owner and staff)
- 🔌 **Backend API** — Node.js + Express + PostgreSQL (Prisma)

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
cd apps/admin && npm run dev    # Admin website on port 3000
cd apps/mobile && npm run dev   # Expo mobile app
```

---

## Development credentials (after seed)

| Account | Phone | Password / OTP |
|---------|-------|----------------|
| Owner (admin web) | `9000000001` | `Dev@anaj2024!` |
| Sample farmer (mobile) | `9876543210` | OTP bypass in dev |

---

## Project Structure

```
anaj/
├── apps/
│   ├── mobile/     # React Native + Expo — Farmer Android app
│   ├── admin/      # Next.js — Owner admin dashboard
│   └── api/        # Express.js — REST API (port 4000)
├── packages/
│   ├── shared-types/       # TypeScript interfaces + enums
│   ├── shared-validation/  # Zod schemas (shared client/server)
│   └── config/             # TS, ESLint, Prettier base configs
├── prisma/
│   ├── schema.prisma        # PostgreSQL schema
│   └── seed.ts              # Dev seed data
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
| `npm run build` | Build all apps |
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
- Language can be changed anytime from Settings
- Admin website uses next-intl with URL-based locale routing (`/` = Hindi, `/en/...` = English)

### Translation files

| App | Hindi | English |
|-----|-------|---------|
| Mobile | `apps/mobile/src/i18n/locales/hi.json` | `apps/mobile/src/i18n/locales/en.json` |
| Admin | `apps/admin/src/i18n/messages/hi.json` | `apps/admin/src/i18n/messages/en.json` |

---

## ⚠️ Important Notes

1. **Business email**: `anajsellkishan01@gamil.com` — domain `gamil.com` may be a typo for `gmail.com`. **Verify with the business owner before production.**
2. **OTP**: Real SMS OTP in production. Configure `SMS_PROVIDER` in `.env`.
3. **Rates**: Never hardcode. All rates managed through the admin dashboard.
4. **Production**: Do not use seed data in production. Do not commit `.env` files.

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation, DB schema, i18n, monorepo | ✅ Complete |
| 2 | Backend API: auth, farmers, products, rates, requests | ✅ Complete |
| 3 | Admin website: all modules | 🔜 Next |
| 4 | Farmer mobile app: all screens | 🔜 Planned |
| 5 | Procurement operations: quality, payment | 🔜 Planned |
| 6 | Production readiness, testing, deployment | 🔜 Planned |
