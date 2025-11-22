-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENTE', 'FOTOGRAFO', 'ADMIN');

-- CreateEnum
CREATE TYPE "PedidoStatus" AS ENUM ('PENDENTE', 'PAGO', 'CANCELADO', 'REEMBOLSADO');

-- CreateEnum
CREATE TYPE "OrientacaoFoto" AS ENUM ('HORIZONTAL', 'VERTICAL', 'PANORAMICA', 'QUADRADO');

-- CreateEnum
CREATE TYPE "TipoTransacao" AS ENUM ('VENDA', 'COMISSAO', 'SAQUE', 'ESTORNO');

-- CreateEnum
CREATE TYPE "StatusSaque" AS ENUM ('PENDENTE', 'PROCESSADO', 'CANCELADO', 'FALHOU');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMPTZ(6),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CLIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fotografo" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "bio" TEXT,
    "cidade" TEXT,
    "especialidades" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "redesSociais" JSONB,
    "avatarUrl" TEXT,
    "bannerUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fotografo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colecao" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "capaUrl" TEXT,
    "fotografoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colecao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Foto" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "tags" TEXT[],
    "orientacao" "OrientacaoFoto" NOT NULL,
    "categoria" TEXT,
    "corPredominante" TEXT,
    "previewUrl" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "colecaoId" TEXT,
    "fotografoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Foto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Licenca" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "precoPadrao" DECIMAL(10,2) NOT NULL,
    "termos" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Licenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FotoLicenca" (
    "id" TEXT NOT NULL,
    "fotoId" TEXT NOT NULL,
    "licencaId" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FotoLicenca_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "PedidoStatus" NOT NULL DEFAULT 'PENDENTE',
    "checkoutSessionId" TEXT,
    "paymentProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemPedido" (
    "id" TEXT NOT NULL,
    "pedidoId" TEXT NOT NULL,
    "fotoId" TEXT NOT NULL,
    "licencaId" TEXT NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "downloadUrlAssinada" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ItemPedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" BIGINT,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" SERIAL NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Saldo" (
    "id" TEXT NOT NULL,
    "fotografoId" TEXT NOT NULL,
    "disponivel" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bloqueado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "chavePix" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Saldo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transacao" (
    "id" TEXT NOT NULL,
    "fotografoId" TEXT NOT NULL,
    "tipo" "TipoTransacao" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricao" TEXT,
    "pedidoId" TEXT,
    "saqueId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PROCESSADO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitacaoSaque" (
    "id" TEXT NOT NULL,
    "fotografoId" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "chavePix" TEXT NOT NULL,
    "status" "StatusSaque" NOT NULL DEFAULT 'PENDENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processadoEm" TIMESTAMP(3),
    "observacao" TEXT,

    CONSTRAINT "SolicitacaoSaque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Fotografo_userId_key" ON "Fotografo"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Fotografo_username_key" ON "Fotografo"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Colecao_slug_key" ON "Colecao"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Foto_slug_key" ON "Foto"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FotoLicenca_fotoId_licencaId_key" ON "FotoLicenca"("fotoId", "licencaId");

-- CreateIndex
CREATE INDEX "ItemPedido_pedidoId_idx" ON "ItemPedido"("pedidoId");

-- CreateIndex
CREATE INDEX "ItemPedido_fotoId_idx" ON "ItemPedido"("fotoId");

-- CreateIndex
CREATE INDEX "ItemPedido_licencaId_idx" ON "ItemPedido"("licencaId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_token_key" ON "verification_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token_identifier_token_key" ON "verification_token"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Saldo_fotografoId_key" ON "Saldo"("fotografoId");

-- CreateIndex
CREATE INDEX "Transacao_fotografoId_idx" ON "Transacao"("fotografoId");

-- CreateIndex
CREATE INDEX "Transacao_pedidoId_idx" ON "Transacao"("pedidoId");

-- CreateIndex
CREATE INDEX "SolicitacaoSaque_fotografoId_idx" ON "SolicitacaoSaque"("fotografoId");

-- CreateIndex
CREATE INDEX "SolicitacaoSaque_status_idx" ON "SolicitacaoSaque"("status");

-- AddForeignKey
ALTER TABLE "Fotografo" ADD CONSTRAINT "Fotografo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colecao" ADD CONSTRAINT "Colecao_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_colecaoId_fkey" FOREIGN KEY ("colecaoId") REFERENCES "Colecao"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoLicenca" ADD CONSTRAINT "FotoLicenca_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FotoLicenca" ADD CONSTRAINT "FotoLicenca_licencaId_fkey" FOREIGN KEY ("licencaId") REFERENCES "Licenca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemPedido" ADD CONSTRAINT "ItemPedido_licencaId_fkey" FOREIGN KEY ("licencaId") REFERENCES "Licenca"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Saldo" ADD CONSTRAINT "Saldo_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transacao" ADD CONSTRAINT "Transacao_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolicitacaoSaque" ADD CONSTRAINT "SolicitacaoSaque_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
