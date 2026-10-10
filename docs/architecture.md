# ANAJ Architecture

## System Overview

ANAJ is a three-tier application in a monorepo:

```
Farmer (Android) ──► API (Express/Node) ──► PostgreSQL
Admin (Next.js)  ──► API (Express/Node) ──► PostgreSQL
```

All apps share types and validation schemas through internal packages.

---

## Application Boundaries

### apps/mobile — Farmer Android App
- React Native + Expo
- Expo Router (file-based navigation)
- i18next + react-i18next for Hindi/English
- Zustand for language and auth global state
- TanStack Query for API caching
- AsyncStorage for non-sensitive state (language preference)
- expo-secure-store for auth tokens

### apps/admin — Owner Admin Dashboard
- Next.js App Router
- next-intl for server-side i18n (Hindi default, English via /en/ URL prefix)
- Tailwind CSS + shadcn/ui components
- TanStack Query for client-side server state
- All admin permissions enforced on the backend

### apps/api — REST Backend
- Express.js with TypeScript
- Versioned routes: /api/v1/...
- Prisma ORM + PostgreSQL
- JWT auth (short-lived access + long-lived refresh tokens)
- OTP via configurable SMS provider (never stores plaintext OTP)
- Structured logging with Pino
- Rate limiting, CORS, Helmet security headers
- Centralized error handling with consistent response format

---

## Shared Packages

### packages/shared-types
TypeScript interfaces and enums used by all apps.
- No runtime dependencies — types only
- Includes: Farmer, Product, SellRequest, PurchaseRate, enums, API response wrappers
- Status transition map: SELL_REQUEST_TRANSITIONS

### packages/shared-validation
Zod schemas for forms and API request validation.
- Used on mobile forms AND backend request validation
- Prevents inconsistency between client and server validation rules
- Includes schemas for: OTP, farmer registration, sell requests, product management

### packages/config
Shared base configs for TypeScript, ESLint, Prettier.

---

## i18n Architecture

### Mobile
```
AsyncStorage[@anaj/language]
        │
        ▼
resolveInitialLanguage()
        │
        ├── null → isFirstLaunch = true → language-select screen
        │
        └── 'HI'/'EN' → initI18n(lang) → render app
                                │
                                ▼
                        i18next (hi.json / en.json)
                                │
                                ▼
                        useTranslation() in all components
```

Language switch (runtime):
```
User taps language option
        │
        ▼
switchLanguage(lang)
        │
        ├── i18n.changeLanguage(locale)   ← instant UI re-render
        └── AsyncStorage.setItem(...)     ← persisted for next launch
```

### Admin
URL-based locale routing via next-intl:
- `/` → Hindi (default locale, no prefix)
- `/en/...` → English

Language preference saved in localStorage by LanguageSwitcher component.

---

## Security Architecture

### Authentication
- Farmers: OTP-only (no password). Phone number verified on each new session.
- Staff: Phone/email + password (bcrypt hashed, never stored plaintext).
- Both: JWT access token (15 min) + refresh token (30 days, stored hashed in DB).
- Mobile: tokens stored in expo-secure-store (Android Keystore-backed).
- OTPs: hashed with bcrypt before storage, never logged.

### Authorization
- Backend enforces role-based access control on every endpoint.
- Farmer endpoints check that the requesting farmer can only access their own data.
- Admin role hierarchy: OWNER > ADMIN > PROCUREMENT_MANAGER > COLLECTION_STAFF / QUALITY_INSPECTOR / ACCOUNTS_STAFF.
- Hiding buttons in the admin UI is supplementary only; never the primary control.

### Data Protection
- Procurement rates are locked on SellRequest at acceptance (agreedRatePerQuintal column).
- Changing the current product rate does not alter any existing accepted request.
- Sensitive fields (phone, financial data) are never exposed in audit logs.
- HTTPS in production; CORS restricted to known origins.

---

## Procurement Workflow

```
SUBMITTED → UNDER_REVIEW → ACCEPTED → COLLECTION_SCHEDULED
         → COLLECTED → QUALITY_CHECK → WEIGHED
         → APPROVED_FOR_PAYMENT → PARTIALLY_PAID → PAID

At any point (before PAID): → REJECTED / CANCELLED
```

Valid transitions are defined in `shared-types/src/index.ts: SELL_REQUEST_TRANSITIONS`.
The backend validates every transition request against this map.
Farmers cannot change the status; only authorized staff can.

---

## Database Design Principles

1. UUIDs for all externally exposed IDs
2. `Decimal(10,2)` for monetary values, `Decimal(10,3)` for weights
3. Separate quantity columns for each stage (requested, accepted, collected, final)
4. `agreedRatePerQuintal` is copied to SellRequest at acceptance — immutable thereafter
5. OTPs stored as bcrypt hash (never plaintext)
6. Refresh tokens stored as hash
7. Audit logs capture before/after JSON for sensitive changes
8. Soft-delete pattern where needed (isActive flag)
9. Indexed on: farmerId, status, productId, createdAt, reference, phone
