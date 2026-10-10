-- Set isolated schema for ANAJ
CREATE SCHEMA IF NOT EXISTS anaj;
SET search_path TO anaj;

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('HI', 'EN');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'PROCUREMENT_MANAGER', 'COLLECTION_STAFF', 'QUALITY_INSPECTOR', 'ACCOUNTS_STAFF');

-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('KG', 'QUINTAL');

-- CreateEnum
CREATE TYPE "SellRequestStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'COLLECTION_SCHEDULED', 'COLLECTED', 'QUALITY_CHECK', 'WEIGHED', 'APPROVED_FOR_PAYMENT', 'PARTIALLY_PAID', 'PAID', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateEnum
CREATE TYPE "CollectionStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "QualityResult" AS ENUM ('PASSED', 'FAILED', 'CONDITIONAL');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(15) NOT NULL,
    "passwordHash" VARCHAR(255),
    "role" "UserRole" NOT NULL DEFAULT 'ADMIN',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "language" "Language" NOT NULL DEFAULT 'HI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmers" (
    "id" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "profilePhotoUrl" VARCHAR(1000),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "language" "Language" NOT NULL DEFAULT 'HI',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer_addresses" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "village" VARCHAR(100) NOT NULL,
    "postOffice" VARCHAR(100) NOT NULL,
    "district" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pinCode" VARCHAR(6) NOT NULL,

    CONSTRAINT "farmer_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_records" (
    "id" TEXT NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "otpHash" VARCHAR(255) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "farmerId" TEXT,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "imageUrl" VARCHAR(1000),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "allowedUnits" "Unit"[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_translations" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),

    CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_rates" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ratePerQuintal" DECIMAL(10,2) NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" VARCHAR(500),
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchase_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_requests" (
    "id" TEXT NOT NULL,
    "reference" VARCHAR(20) NOT NULL,
    "farmerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" "SellRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "requestedQuantity" DECIMAL(10,3) NOT NULL,
    "requestedUnit" "Unit" NOT NULL,
    "acceptedQuantity" DECIMAL(10,3),
    "collectedQuantity" DECIMAL(10,3),
    "finalQuantity" DECIMAL(10,3),
    "expectedPricePerQuintal" DECIMAL(10,2),
    "agreedRateId" TEXT,
    "agreedRatePerQuintal" DECIMAL(10,2),
    "applicableDeductions" DECIMAL(10,2),
    "finalPayableAmount" DECIMAL(12,2),
    "collectionAddress" VARCHAR(500),
    "preferredCollectionDate" TIMESTAMP(3),
    "quality" VARCHAR(500),
    "notes" VARCHAR(1000),
    "processedById" TEXT,
    "rejectionReason" VARCHAR(500),
    "clientRequestId" VARCHAR(36),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sell_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sell_request_photos" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sell_request_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "actualDate" TIMESTAMP(3),
    "address" VARCHAR(500) NOT NULL,
    "assignedStaffId" TEXT,
    "status" "CollectionStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" VARCHAR(1000),
    "cancelReason" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quality_inspections" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "grade" VARCHAR(50),
    "moisturePercent" DECIMAL(5,2),
    "notes" VARCHAR(1000),
    "inspectedById" TEXT,
    "result" "QualityResult",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weighments" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "grossWeightKg" DECIMAL(10,3),
    "tareWeightKg" DECIMAL(10,3),
    "netWeightKg" DECIMAL(10,3),
    "weighedById" TEXT,
    "notes" VARCHAR(1000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weighments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weighment_deductions" (
    "id" TEXT NOT NULL,
    "weighmentId" TEXT NOT NULL,
    "reason" VARCHAR(200) NOT NULL,
    "amountKg" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "weighment_deductions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" VARCHAR(20) NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" DECIMAL(12,2) NOT NULL,
    "notes" VARCHAR(1000),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "sellRequestId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentReference" VARCHAR(200),
    "paymentDate" TIMESTAMP(3),
    "paymentMethod" VARCHAR(50),
    "notes" VARCHAR(500),
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "platform" VARCHAR(20) NOT NULL DEFAULT 'android',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "actorType" VARCHAR(20) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entityType" VARCHAR(100) NOT NULL,
    "entityId" VARCHAR(36) NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" VARCHAR(45),
    "userAgent" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_settings" (
    "id" TEXT NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer_notes" (
    "id" TEXT NOT NULL,
    "farmerId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "farmer_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "farmers_phone_key" ON "farmers"("phone");

-- CreateIndex
CREATE INDEX "farmers_phone_idx" ON "farmers"("phone");

-- CreateIndex
CREATE INDEX "farmers_isActive_idx" ON "farmers"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_addresses_farmerId_key" ON "farmer_addresses"("farmerId");

-- CreateIndex
CREATE INDEX "farmer_addresses_district_idx" ON "farmer_addresses"("district");

-- CreateIndex
CREATE INDEX "farmer_addresses_pinCode_idx" ON "farmer_addresses"("pinCode");

-- CreateIndex
CREATE INDEX "otp_records_phone_idx" ON "otp_records"("phone");

-- CreateIndex
CREATE INDEX "otp_records_expiresAt_idx" ON "otp_records"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_farmerId_idx" ON "refresh_tokens"("farmerId");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_isActive_idx" ON "products"("isActive");

-- CreateIndex
CREATE INDEX "products_sortOrder_idx" ON "products"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "product_translations_productId_language_key" ON "product_translations"("productId", "language");

-- CreateIndex
CREATE INDEX "purchase_rates_productId_isActive_idx" ON "purchase_rates"("productId", "isActive");

-- CreateIndex
CREATE INDEX "purchase_rates_effectiveFrom_idx" ON "purchase_rates"("effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "sell_requests_reference_key" ON "sell_requests"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "sell_requests_clientRequestId_key" ON "sell_requests"("clientRequestId");

-- CreateIndex
CREATE INDEX "sell_requests_farmerId_idx" ON "sell_requests"("farmerId");

-- CreateIndex
CREATE INDEX "sell_requests_status_idx" ON "sell_requests"("status");

-- CreateIndex
CREATE INDEX "sell_requests_productId_idx" ON "sell_requests"("productId");

-- CreateIndex
CREATE INDEX "sell_requests_createdAt_idx" ON "sell_requests"("createdAt");

-- CreateIndex
CREATE INDEX "sell_requests_reference_idx" ON "sell_requests"("reference");

-- CreateIndex
CREATE INDEX "sell_request_photos_sellRequestId_idx" ON "sell_request_photos"("sellRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "collections_sellRequestId_key" ON "collections"("sellRequestId");

-- CreateIndex
CREATE INDEX "collections_scheduledDate_idx" ON "collections"("scheduledDate");

-- CreateIndex
CREATE INDEX "collections_status_idx" ON "collections"("status");

-- CreateIndex
CREATE UNIQUE INDEX "quality_inspections_sellRequestId_key" ON "quality_inspections"("sellRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "weighments_sellRequestId_key" ON "weighments"("sellRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_orderNumber_key" ON "purchase_orders"("orderNumber");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_sellRequestId_key" ON "purchase_orders"("sellRequestId");

-- CreateIndex
CREATE INDEX "payments_sellRequestId_idx" ON "payments"("sellRequestId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paymentDate_idx" ON "payments"("paymentDate");

-- CreateIndex
CREATE INDEX "notifications_farmerId_isRead_idx" ON "notifications"("farmerId", "isRead");

-- CreateIndex
CREATE INDEX "notifications_sentAt_idx" ON "notifications"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_token_key" ON "device_tokens"("token");

-- CreateIndex
CREATE INDEX "device_tokens_farmerId_idx" ON "device_tokens"("farmerId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "company_settings_key_key" ON "company_settings"("key");

-- CreateIndex
CREATE INDEX "farmer_notes_farmerId_idx" ON "farmer_notes"("farmerId");

-- AddForeignKey
ALTER TABLE "farmer_addresses" ADD CONSTRAINT "farmer_addresses_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_translations" ADD CONSTRAINT "product_translations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_rates" ADD CONSTRAINT "purchase_rates_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_rates" ADD CONSTRAINT "purchase_rates_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_requests" ADD CONSTRAINT "sell_requests_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_requests" ADD CONSTRAINT "sell_requests_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_requests" ADD CONSTRAINT "sell_requests_agreedRateId_fkey" FOREIGN KEY ("agreedRateId") REFERENCES "purchase_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_requests" ADD CONSTRAINT "sell_requests_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sell_request_photos" ADD CONSTRAINT "sell_request_photos_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "sell_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "sell_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "sell_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weighments" ADD CONSTRAINT "weighments_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "sell_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weighment_deductions" ADD CONSTRAINT "weighment_deductions_weighmentId_fkey" FOREIGN KEY ("weighmentId") REFERENCES "weighments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "sell_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sellRequestId_fkey" FOREIGN KEY ("sellRequestId") REFERENCES "sell_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_notes" ADD CONSTRAINT "farmer_notes_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer_notes" ADD CONSTRAINT "farmer_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

