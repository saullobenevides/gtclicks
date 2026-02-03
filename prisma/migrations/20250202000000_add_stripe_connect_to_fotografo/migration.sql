-- AlterTable
ALTER TABLE "Fotografo" ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeOnboarded" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Fotografo_stripeAccountId_key" ON "Fotografo"("stripeAccountId");
