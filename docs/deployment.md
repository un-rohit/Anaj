# ANAJ — Cloud Deployment & Infrastructure Guide

This guide details how to deploy the entire ANAJ agricultural procurement platform to production cloud services:

1. **Cloud Database:** Supabase PostgreSQL (`rcpwboqmcqzrcpyomfmu`, AWS `ap-south-1`, isolated `anaj` schema)
2. **Backend REST API:** Render.com Web Service (`@anaj/api`, Node.js 20)
3. **Web Applications (Farmer Portal & Admin Console):** Vercel (`@anaj/admin`, Next.js 15)
4. **Farmer Mobile Application:** Expo Application Services / EAS (`@anaj/mobile`, Android APK)

---

## 🏛️ Architecture Overview

```mermaid
graph TD
    subgraph Cloud Database [Supabase PostgreSQL - Mumbai ap-south-1]
        DB[(Schema: anaj)]
        DB_TABLES[21 Tables, Enums, Indexes, Seed Data]
    end

    subgraph Backend API [Render.com Web Service]
        API[Express REST API - /api/v1]
        API -->|Port 5432 / 6543 pooled| DB
    end

    subgraph Web Portal [Vercel Global Edge]
        WEB_FARMER[Farmer Web Portal: /]
        WEB_ADMIN[Owner Admin Console: /admin]
        WEB_FARMER -->|HTTPS / REST| API
        WEB_ADMIN -->|HTTPS / REST| API
    end

    subgraph Mobile Application [Android Devices]
        APP[ANAJ Farmer APK]
        APP -->|HTTPS / REST| API
    end
```

---

## Step 1: Database Setup & Credentials

All 21 database tables, enums, indexes, and initial seed data (7 core crops and owner account `NK.PATEL`) have been provisioned in your connected Supabase database under the isolated `anaj` schema.

### Getting Your Supabase Database Password
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Open project: **`rcpwboqmcqzrcpyomfmu`**.
3. Go to **Settings** (gear icon) → **Database**.
4. If you already know your password, use it. Otherwise, click **Reset database password** and copy the new password.

### Connection String Format
Replace `[YOUR_SUPABASE_PASSWORD]` in your `.env` and deployment environment variables:

```bash
# Session Pooler (Recommended for Prisma & Render)
DATABASE_URL="postgresql://postgres.rcpwboqmcqzrcpyomfmu:[YOUR_SUPABASE_PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?schema=anaj"
```

---

## Step 2: Deploy Backend REST API to Render

### Option A: Using Blueprint (`render.yaml`)
1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) → Click **New +** → **Blueprint**.
3. Select your GitHub repository (`Anaj`).
4. Render will automatically detect [`render.yaml`](../render.yaml) and configure the `anaj-api` service.
5. In the prompted environment variables, set:
   - `DATABASE_URL`: Your Supabase connection string with `schema=anaj`.
   - `CORS_ORIGINS`: `https://[your-vercel-domain].vercel.app,http://localhost:3000`
6. Click **Apply**.

### Option B: Manual Web Service Creation
1. Click **New +** → **Web Service**.
2. Select your repository.
3. Configure the following:
   - **Name:** `anaj-api`
   - **Region:** `Singapore` (closest to Mumbai `ap-south-1`)
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:**
     ```bash
     npm install && npx prisma generate && npx turbo run build --filter=@anaj/api...
     ```
   - **Start Command:**
     ```bash
     node apps/api/dist/index.js
     ```
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `DATABASE_URL`: `postgresql://postgres.rcpwboqmcqzrcpyomfmu:[PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:5432/postgres?schema=anaj`
   - `JWT_ACCESS_SECRET`: `[Click Generate or provide 32+ character random string]`
   - `JWT_REFRESH_SECRET`: `[Click Generate or provide 32+ character random string]`
   - `JWT_ACCESS_EXPIRES_IN`: `15m`
   - `JWT_REFRESH_EXPIRES_IN`: `30d`
   - `CORS_ORIGINS`: `*` (or your Vercel URL)
   - `SMS_PROVIDER`: `fast2sms`
   - `SMS_API_KEY`: `[Your Fast2SMS API key if using real SMS]`

Your deployed API will be live at:
`https://anaj-api.onrender.com/api/v1`

---

## Step 3: Deploy Web Portal to Vercel

The web application contains both the **Farmer Web Portal** (`/`) and the **Owner Management Console** (`/admin`).

1. Go to [Vercel Dashboard](https://vercel.com/) → Click **Add New...** → **Project**.
2. Select your `Anaj` repository.
3. In the configuration screen:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and choose `apps/admin`.
   - **Build Command:** Leave default (`next build`) or `npx turbo run build --filter=@anaj/admin...`.
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://[your-render-api-name].onrender.com/api/v1`
   - `NEXTAUTH_SECRET`: `[Random 32-character string]`
   - `NEXTAUTH_URL`: `https://[your-vercel-domain].vercel.app`
5. Click **Deploy**.

Once deployed:
- **Farmer Web Portal:** `https://[your-domain].vercel.app/`
- **Farmer Login:** `https://[your-domain].vercel.app/farmer/login`
- **Farmer Sell Produce:** `https://[your-domain].vercel.app/farmer/sell`
- **Admin Management Console:** `https://[your-domain].vercel.app/admin`

---

## Step 4: Build Android APK for Farmers (EAS Build)

The farmer Android app can be compiled into a standalone `.apk` that farmers can install directly without Google Play.

1. Install EAS CLI globally (if not already installed):
   ```bash
   npm install -g eas-cli
   ```
2. Log into your Expo account:
   ```bash
   eas login
   ```
3. In `apps/mobile/.env` or EAS secrets, set:
   ```bash
   EXPO_PUBLIC_API_URL="https://[your-render-api-name].onrender.com/api/v1"
   ```
4. Run the preview build from `apps/mobile`:
   ```bash
   cd apps/mobile
   eas build -p android --profile preview
   ```
5. Once EAS completes the cloud build, it will generate a QR code and a direct `.apk` download link. Share this link with farmers.

---

## Step 5: Verification & Production Smoke Tests

### 1. Test Backend API Live
```bash
curl https://[your-render-api].onrender.com/api/v1/company/info
```
Expected response:
```json
{
  "success": true,
  "data": {
    "name": "ANAJ",
    "brandName": "अनाज",
    "ownerName": "NK.PATEL",
    "phone": "7061654008"
  }
}
```

### 2. Test OpenAPI Documentation
Open: `https://[your-render-api].onrender.com/api/v1/openapi.json`

### 3. Test Admin Portal Login
- URL: `https://[your-vercel-domain].vercel.app/admin/login`
- Mobile: `9000000001`
- Password: `Dev@anaj2024!`

### 4. Test Farmer Produce Sale
- URL: `https://[your-vercel-domain].vercel.app/`
- Select Gehu (Wheat), enter 25 Quintals, and verify estimated payout calculation (25 × ₹2,200 = ₹55,000).
