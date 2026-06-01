ALTER TABLE "User" ADD COLUMN "billPayPaused" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "User_billPayPaused_idx" ON "User"("billPayPaused");
