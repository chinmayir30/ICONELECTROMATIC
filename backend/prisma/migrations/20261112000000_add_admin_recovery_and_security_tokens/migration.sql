-- CreateEnum
CREATE TYPE "SecurityTokenType" AS ENUM ('RECOVERY_EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "recoveryEmail" TEXT,
ADD COLUMN     "recoveryEmailVerifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "AdminSecurityToken" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "type" "SecurityTokenType" NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "payload" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminSecurityToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSecurityToken_tokenHash_key" ON "AdminSecurityToken"("tokenHash");

-- CreateIndex
CREATE INDEX "AdminSecurityToken_adminUserId_type_expiresAt_idx" ON "AdminSecurityToken"("adminUserId", "type", "expiresAt");

-- CreateIndex
CREATE INDEX "AdminSecurityToken_tokenHash_expiresAt_idx" ON "AdminSecurityToken"("tokenHash", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_recoveryEmail_key" ON "AdminUser"("recoveryEmail");

-- AddForeignKey
ALTER TABLE "AdminSecurityToken" ADD CONSTRAINT "AdminSecurityToken_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
