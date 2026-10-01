-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('INICIADA', 'CONCLUIDA', 'TROCADA');

-- CreateTable
CREATE TABLE "PracticeEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conteudoId" TEXT NOT NULL,
    "tipo" "EventType" NOT NULL,
    "dia" TEXT NOT NULL,
    "gostou" BOOLEAN,
    "intensidadePercebida" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PracticeEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PracticeEvent_userId_dia_idx" ON "PracticeEvent"("userId", "dia");

-- CreateIndex
CREATE INDEX "PracticeEvent_userId_conteudoId_idx" ON "PracticeEvent"("userId", "conteudoId");

-- AddForeignKey
ALTER TABLE "PracticeEvent" ADD CONSTRAINT "PracticeEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
