/*
  Warnings:

  - The values [REEMBOLSADO] on the enum `PedidoStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `categoria` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `colecaoId` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `corPredominante` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `downloads` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `originalUrl` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `views` on the `Foto` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `FotoLicenca` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `Fotografo` table. All the data in the column will be lost.
  - You are about to drop the column `bannerUrl` on the `Fotografo` table. All the data in the column will be lost.
  - You are about to drop the column `cidade` on the `Fotografo` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Fotografo` table. All the data in the column will be lost.
  - You are about to drop the column `especialidades` on the `Fotografo` table. All the data in the column will be lost.
  - You are about to drop the column `redesSociais` on the `Fotografo` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Fotografo` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ItemPedido` table. All the data in the column will be lost.
  - You are about to drop the column `downloadUrlAssinada` on the `ItemPedido` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `ItemPedido` table. All the data in the column will be lost.
  - You are about to drop the column `precoUnitario` on the `ItemPedido` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Licenca` table. All the data in the column will be lost.
  - You are about to drop the column `descricao` on the `Licenca` table. All the data in the column will be lost.
  - You are about to drop the column `precoPadrao` on the `Licenca` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Licenca` table. All the data in the column will be lost.
  - You are about to drop the column `checkoutSessionId` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `clienteId` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `paymentProvider` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Pedido` table. All the data in the column will be lost.
  - You are about to drop the column `chavePix` on the `Saldo` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Saldo` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Saldo` table. All the data in the column will be lost.
  - You are about to drop the column `chavePix` on the `SolicitacaoSaque` table. All the data in the column will be lost.
  - You are about to drop the column `observacao` on the `SolicitacaoSaque` table. All the data in the column will be lost.
  - You are about to drop the column `processadoEm` on the `SolicitacaoSaque` table. All the data in the column will be lost.
  - You are about to drop the column `pedidoId` on the `Transacao` table. All the data in the column will be lost.
  - You are about to drop the column `saqueId` on the `Transacao` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Transacao` table. All the data in the column will be lost.
  - You are about to drop the `Colecao` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `accounts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_token` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[s3Key]` on the table `Foto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `formato` to the `Foto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `height` to the `Foto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `Foto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tamanhoBytes` to the `Foto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `width` to the `Foto` table without a default value. This is not possible if the table is not empty.
  - The required column `downloadToken` was added to the `ItemPedido` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `precoPago` to the `ItemPedido` table without a default value. This is not possible if the table is not empty.
  - Made the column `termos` on table `Licenca` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `userId` to the `Pedido` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `SolicitacaoSaque` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo` on the `Transacao` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "FotoStatus" AS ENUM ('PENDENTE', 'PUBLICADA', 'REJEITADA');

-- AlterEnum
BEGIN;
CREATE TYPE "PedidoStatus_new" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO');
ALTER TABLE "public"."Pedido" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "status" TYPE "PedidoStatus_new" USING ("status"::text::"PedidoStatus_new");
ALTER TYPE "PedidoStatus" RENAME TO "PedidoStatus_old";
ALTER TYPE "PedidoStatus_new" RENAME TO "PedidoStatus";
DROP TYPE "public"."PedidoStatus_old";
ALTER TABLE "Pedido" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Colecao" DROP CONSTRAINT "Colecao_fotografoId_fkey";

-- DropForeignKey
ALTER TABLE "Foto" DROP CONSTRAINT "Foto_colecaoId_fkey";

-- DropForeignKey
ALTER TABLE "Fotografo" DROP CONSTRAINT "Fotografo_userId_fkey";

-- DropForeignKey
ALTER TABLE "Pedido" DROP CONSTRAINT "Pedido_clienteId_fkey";

-- DropForeignKey
ALTER TABLE "Saldo" DROP CONSTRAINT "Saldo_fotografoId_fkey";

-- DropForeignKey
ALTER TABLE "SolicitacaoSaque" DROP CONSTRAINT "SolicitacaoSaque_fotografoId_fkey";

-- DropForeignKey
ALTER TABLE "Transacao" DROP CONSTRAINT "Transacao_fotografoId_fkey";

-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropIndex
DROP INDEX "Foto_slug_key";

-- DropIndex
DROP INDEX "ItemPedido_fotoId_idx";

-- DropIndex
DROP INDEX "ItemPedido_licencaId_idx";

-- DropIndex
DROP INDEX "ItemPedido_pedidoId_idx";

-- DropIndex
DROP INDEX "SolicitacaoSaque_fotografoId_idx";

-- DropIndex
DROP INDEX "SolicitacaoSaque_status_idx";

-- DropIndex
DROP INDEX "Transacao_fotografoId_idx";

-- DropIndex
DROP INDEX "Transacao_pedidoId_idx";

-- AlterTable
ALTER TABLE "Foto" DROP COLUMN "categoria",
DROP COLUMN "colecaoId",
DROP COLUMN "corPredominante",
DROP COLUMN "downloads",
DROP COLUMN "likes",
DROP COLUMN "originalUrl",
DROP COLUMN "slug",
DROP COLUMN "updatedAt",
DROP COLUMN "views",
ADD COLUMN     "exifData" JSONB,
ADD COLUMN     "formato" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL,
ADD COLUMN     "status" "FotoStatus" NOT NULL DEFAULT 'PENDENTE',
ADD COLUMN     "tamanhoBytes" INTEGER NOT NULL,
ADD COLUMN     "width" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FotoLicenca" DROP COLUMN "createdAt";

-- AlterTable
ALTER TABLE "Fotografo" DROP COLUMN "avatarUrl",
DROP COLUMN "bannerUrl",
DROP COLUMN "cidade",
DROP COLUMN "createdAt",
DROP COLUMN "especialidades",
DROP COLUMN "redesSociais",
DROP COLUMN "updatedAt",
ADD COLUMN     "chavePix" TEXT;

-- AlterTable
ALTER TABLE "ItemPedido" DROP COLUMN "createdAt",
DROP COLUMN "downloadUrlAssinada",
DROP COLUMN "expiresAt",
DROP COLUMN "precoUnitario",
ADD COLUMN     "downloadToken" TEXT NOT NULL,
ADD COLUMN     "downloadsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "precoPago" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Licenca" DROP COLUMN "createdAt",
DROP COLUMN "descricao",
DROP COLUMN "precoPadrao",
DROP COLUMN "updatedAt",
ALTER COLUMN "termos" SET NOT NULL;

-- AlterTable
ALTER TABLE "Pedido" DROP COLUMN "checkoutSessionId",
DROP COLUMN "clienteId",
DROP COLUMN "paymentProvider",
DROP COLUMN "updatedAt",
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Saldo" DROP COLUMN "chavePix",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "SolicitacaoSaque" DROP COLUMN "chavePix",
DROP COLUMN "observacao",
DROP COLUMN "processadoEm",
ALTER COLUMN "valor" SET DATA TYPE DECIMAL(65,30),
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Transacao" DROP COLUMN "pedidoId",
DROP COLUMN "saqueId",
DROP COLUMN "status",
DROP COLUMN "tipo",
ADD COLUMN     "tipo" TEXT NOT NULL;

-- DropTable
DROP TABLE "Colecao";

-- DropTable
DROP TABLE "accounts";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "users";

-- DropTable
DROP TABLE "verification_token";

-- DropEnum
DROP TYPE "StatusSaque";

-- DropEnum
DROP TYPE "TipoTransacao";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrinho" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Carrinho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemCarrinho" (
    "id" TEXT NOT NULL,
    "carrinhoId" TEXT NOT NULL,
    "fotoId" TEXT NOT NULL,
    "licencaId" TEXT NOT NULL,

    CONSTRAINT "ItemCarrinho_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Carrinho_userId_key" ON "Carrinho"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ItemCarrinho_carrinhoId_fotoId_licencaId_key" ON "ItemCarrinho"("carrinhoId", "fotoId", "licencaId");

-- CreateIndex
CREATE UNIQUE INDEX "Foto_s3Key_key" ON "Foto"("s3Key");

-- AddForeignKey
ALTER TABLE "Fotografo" ADD CONSTRAINT "Fotografo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrinho" ADD CONSTRAINT "Carrinho_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCarrinho" ADD CONSTRAINT "ItemCarrinho_carrinhoId_fkey" FOREIGN KEY ("carrinhoId") REFERENCES "Carrinho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCarrinho" ADD CONSTRAINT "ItemCarrinho_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemCarrinho" ADD CONSTRAINT "ItemCarrinho_licencaId_fkey" FOREIGN KEY ("licencaId") REFERENCES "Licenca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saldo" ADD CONSTRAINT "Saldo_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoSaque" ADD CONSTRAINT "SolicitacaoSaque_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
