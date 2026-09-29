-- Papéis do sistema (ADM-01, ADM-10)
CREATE TYPE "Role" AS ENUM ('ALUNO', 'PROFESSOR', 'MASTER', 'ADMIN');

ALTER TABLE "User" ADD COLUMN "papel" "Role" NOT NULL DEFAULT 'ALUNO';

-- Fluxo de aprovação do conteúdo (ADM-06)
CREATE TYPE "ContentStatus" AS ENUM ('RASCUNHO', 'EM_REVISAO', 'APROVADO', 'DEVOLVIDO');

ALTER TABLE "Content" ADD COLUMN "status" "ContentStatus" NOT NULL DEFAULT 'RASCUNHO';
ALTER TABLE "Content" ADD COLUMN "autorId" TEXT;
ALTER TABLE "Content" ADD COLUMN "comentarioRevisao" TEXT;

-- O que já estava aprovado continua aprovado: a coluna antiga vira status.
UPDATE "Content" SET "status" = 'APROVADO' WHERE "aprovado" = true;

DROP INDEX "Content_aprovado_idx";
ALTER TABLE "Content" DROP COLUMN "aprovado";

CREATE INDEX "Content_status_idx" ON "Content"("status");
CREATE INDEX "Content_autorId_idx" ON "Content"("autorId");

ALTER TABLE "Content" ADD CONSTRAINT "Content_autorId_fkey"
  FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
