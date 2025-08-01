CREATE EXTENSION IF NOT EXISTS postgis;
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'DEACTIVATED', 'SUSPENDED', 'PENDING', 'BLOCKED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED');

-- CreateEnum
CREATE TYPE "LogLevel" AS ENUM ('TRACE', 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL', 'SUCCESS');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'ADMIN', 'SYSTEM', 'ANONYMOUS');

-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('BMSP_SUPER_ADMIN', 'BMSP_ADMIN', 'BMSP_FINANCE_ADMIN', 'BMSP_VENUES_ADMIN', 'BMSP_REGIONAL_VENUES_ADMIN', 'BMSP_BOOKINGS_ADMIN', 'BMSP_CUSTOMER_CARE', 'VENUE_OWNER', 'SECONDARY_VENUE_NAME_MANAGER', 'VENUE_BOOKING_MANAGER', 'VENUE_OPERATIONS_MANAGER', 'ANONYMOUS', 'SYSTEM', 'USER');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH', 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RESET', 'INVITATION', 'ACCOUNT_LINKING');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "SlotType" AS ENUM ('CRICKET_MORNING', 'CRICKET_AFTERNOON', 'FOOTBALL_DAILY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'BOOKED', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "RecurrenceType" AS ENUM ('DAILY', 'WEEKLY', 'CUSTOM_DAYS');

-- CreateEnum
CREATE TYPE "EndCondition" AS ENUM ('NEVER', 'AFTER_OCCURRENCES', 'SPECIFIC_DATE');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "passwordLastChanged" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "passwordHistory" JSONB,
    "roleId" TEXT NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isPhoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isMfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaMethod" TEXT,
    "loginAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAttempt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "lockUntil" TIMESTAMP(3),
    "lastIPAddress" TEXT,
    "loginIPs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastUserAgent" TEXT,
    "geoLocationInfo" JSONB,
    "failedLoginIPs" JSONB,
    "notificationPrefs" JSONB NOT NULL DEFAULT '{}',
    "googleId" TEXT,
    "googleAccessToken" TEXT,
    "googleRefreshToken" TEXT,
    "googleAuthScope" TEXT,
    "appleId" TEXT,
    "lat" DECIMAL(9,6),
    "lng" DECIMAL(9,6),
    "location" TEXT,
    "geohash" CHAR(12),
    "point" geography(point),
    "panNumber" TEXT,
    "aadharNumber" TEXT,
    "panCardUrl" TEXT,
    "aadharCardUrl" TEXT,
    "rejectionReason" TEXT,
    "venueId" TEXT,
    "rankingGlobal" INTEGER,
    "rankingNational" INTEGER,
    "rankingState" INTEGER,
    "rankingDistrict" INTEGER,
    "rankingRegional" INTEGER,
    "rating" DOUBLE PRECISION,
    "profilePictureUrl" TEXT,
    "preferredLanguage" TEXT,
    "timezone" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "idDocsComplete" BOOLEAN NOT NULL DEFAULT false,
    "venueDetailsComplete" BOOLEAN NOT NULL DEFAULT false,
    "slotsCreated" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deactivatedBy" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" "LogLevel" NOT NULL,
    "message" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "module" TEXT,
    "correlationId" TEXT,
    "actorId" TEXT,
    "actorType" "ActorType" NOT NULL DEFAULT 'USER',
    "actorEmail" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "httpMethod" TEXT,
    "urlPath" TEXT,
    "statusCode" INTEGER,
    "action" TEXT NOT NULL,
    "resourceType" TEXT,
    "resourceId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "details" JSONB,
    "error" JSONB,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "RoleType" NOT NULL,
    "description" TEXT NOT NULL,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "status" "RoleStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "accountId" TEXT,
    "roleId" TEXT NOT NULL,
    "invitationId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "device" TEXT,
    "ipAddress" TEXT,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "role" "RoleType" NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "invitedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venue" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "zipCode" TEXT,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "geohash" CHAR(12) NOT NULL,
    "point" geography(point) NOT NULL,
    "sportTypes" TEXT[],
    "amenities" TEXT[],
    "accessibility" TEXT[],
    "capacity" INTEGER,
    "surfaceType" TEXT,
    "openHours" JSONB,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "website" TEXT,
    "photos" TEXT[],
    "videos" TEXT[],
    "documents" TEXT[],
    "performance" DOUBLE PRECISION,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "accountId" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Slot" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "isBooked" BOOLEAN NOT NULL DEFAULT false,
    "bookerId" TEXT,
    "bookedAt" TIMESTAMP(3),
    "cancellationPolicy" TEXT,
    "cancellationDeadline" INTEGER,
    "slotType" "SlotType" NOT NULL,
    "status" "SlotStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrencePattern" (
    "id" TEXT NOT NULL,
    "slotId" TEXT NOT NULL,
    "recurrenceType" "RecurrenceType" NOT NULL,
    "interval" INTEGER,
    "daysOfWeek" TEXT[],
    "endCondition" "EndCondition" NOT NULL,
    "occurrenceCount" INTEGER,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "RecurrencePattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrenceException" (
    "id" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "originalDate" TIMESTAMP(3) NOT NULL,
    "newDate" TIMESTAMP(3),
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "modificationNote" TEXT,

    CONSTRAINT "RecurrenceException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_phone_key" ON "Account"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_googleId_key" ON "Account"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_appleId_key" ON "Account"("appleId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_venueId_key" ON "Account"("venueId");

-- CreateIndex
CREATE INDEX "Account_email_idx" ON "Account"("email");

-- CreateIndex
CREATE INDEX "Account_phone_idx" ON "Account"("phone");

-- CreateIndex
CREATE INDEX "Account_googleId_idx" ON "Account"("googleId");

-- CreateIndex
CREATE INDEX "Account_appleId_idx" ON "Account"("appleId");

-- CreateIndex
CREATE INDEX "account_lat_lng_idx" ON "Account"("lat", "lng");

-- CreateIndex
CREATE INDEX "account_location_idx" ON "Account"("location");

-- CreateIndex
CREATE INDEX "Account_lastLoginAt_idx" ON "Account"("lastLoginAt");

-- CreateIndex
CREATE INDEX "Account_roleId_idx" ON "Account"("roleId");

-- CreateIndex
CREATE INDEX "Account_status_idx" ON "Account"("status");

-- CreateIndex
CREATE INDEX "Account_isLocked_idx" ON "Account"("isLocked");

-- CreateIndex
CREATE INDEX "Account_createdAt_idx" ON "Account"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");

-- CreateIndex
CREATE INDEX "AuditLog_level_idx" ON "AuditLog"("level");

-- CreateIndex
CREATE INDEX "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");

-- CreateIndex
CREATE INDEX "AuditLog_service_module_idx" ON "AuditLog"("service", "module");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_resourceType_resourceId_idx" ON "AuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AuditLog_actorId_action_idx" ON "AuditLog"("actorId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_ipAddress_idx" ON "AuditLog"("ipAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE INDEX "Role_name_idx" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_key_key" ON "Permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Token_token_key" ON "Token"("token");

-- CreateIndex
CREATE INDEX "Token_token_idx" ON "Token"("token");

-- CreateIndex
CREATE INDEX "Token_accountId_type_idx" ON "Token"("accountId", "type");

-- CreateIndex
CREATE INDEX "Token_roleId_idx" ON "Token"("roleId");

-- CreateIndex
CREATE INDEX "Token_expiresAt_idx" ON "Token"("expiresAt");

-- CreateIndex
CREATE INDEX "Token_isBlacklisted_idx" ON "Token"("isBlacklisted");

-- CreateIndex
CREATE INDEX "venue_lat_lng_idx" ON "Venue"("lat", "lng");

-- CreateIndex
CREATE INDEX "venue_geohash_idx" ON "Venue"("geohash");

-- CreateIndex
CREATE INDEX "venue_location_idx" ON "Venue"("location");

-- CreateIndex
CREATE INDEX "venue_sport_types_idx" ON "Venue"("sportTypes");

-- CreateIndex
CREATE INDEX "venue_status_idx" ON "Venue"("status");

-- CreateIndex
CREATE INDEX "slot_time_idx" ON "Slot"("startTime", "endTime");

-- CreateIndex
CREATE INDEX "slot_venue_idx" ON "Slot"("venueId");

-- CreateIndex
CREATE INDEX "slot_is_booked_idx" ON "Slot"("isBooked");

-- CreateIndex
CREATE INDEX "Slot_slotType_idx" ON "Slot"("slotType");

-- CreateIndex
CREATE UNIQUE INDEX "RecurrencePattern_slotId_key" ON "RecurrencePattern"("slotId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Token" ADD CONSTRAINT "Token_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Slot" ADD CONSTRAINT "Slot_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrencePattern" ADD CONSTRAINT "RecurrencePattern_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "Slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceException" ADD CONSTRAINT "RecurrenceException_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "RecurrencePattern"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
