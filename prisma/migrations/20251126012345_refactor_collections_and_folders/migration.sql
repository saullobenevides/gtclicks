/*
  Warnings:

  - You are about to drop the column `exifData` on the `Foto` table. All the data in the column will be lost.
  - Added the required column `colecaoId` to the `Foto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Foto" DROP COLUMN "exifData",
ADD COLUMN     "aperture" TEXT,
ADD COLUMN     "camera" TEXT,
ADD COLUMN     "colecaoId" TEXT NOT NULL,
ADD COLUMN     "focalLength" TEXT,
ADD COLUMN     "folder" TEXT,
ADD COLUMN     "iso" INTEGER,
ADD COLUMN     "lens" TEXT,
ADD COLUMN     "likes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shutterSpeed" TEXT;

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fotoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
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

    CONSTRAINT "Colecao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_fotoId_key" ON "Like"("userId", "fotoId");

-- CreateIndex
CREATE UNIQUE INDEX "Colecao_slug_key" ON "Colecao"("slug");

-- AddForeignKey
ALTER TABLE "Foto" ADD CONSTRAINT "Foto_colecaoId_fkey" FOREIGN KEY ("colecaoId") REFERENCES "Colecao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_fotoId_fkey" FOREIGN KEY ("fotoId") REFERENCES "Foto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colecao" ADD CONSTRAINT "Colecao_fotografoId_fkey" FOREIGN KEY ("fotografoId") REFERENCES "Fotografo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
