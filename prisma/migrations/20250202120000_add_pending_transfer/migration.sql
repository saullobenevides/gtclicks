-- CreateTable
CREATE TABLE "PendingTransfer" (
    "id" TEXT NOT NULL,
    "fotografoId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "chargeId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "itemPedidoId" TEXT,
    "descricao" TEXT,
    "processedAt" TIMESTAMP(3),
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingTransfer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PendingTransfer_fotografoId_processedAt_idx" ON "PendingTransfer"("fotografoId", "processedAt");

-- AddForeignKey
ALTER TABLE "PendingTransfer" ADD CONSTRAINT "PendingTransfer_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
