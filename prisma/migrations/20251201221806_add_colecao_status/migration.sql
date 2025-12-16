-- CreateEnum
CREATE TYPE "ColecaoStatus" AS ENUM ('RASCUNHO', 'PUBLICADA');

-- AlterTable
ALTER TABLE "Colecao" ADD COLUMN     "status" "ColecaoStatus" NOT NULL DEFAULT 'RASCUNHO';
