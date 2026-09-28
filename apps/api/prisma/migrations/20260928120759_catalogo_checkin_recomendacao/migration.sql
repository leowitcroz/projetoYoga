-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "modalidade" TEXT NOT NULL,
    "duracaoMin" INTEGER NOT NULL,
    "nivelTecnico" INTEGER NOT NULL,
    "demandaFisica" INTEGER NOT NULL,
    "area" TEXT NOT NULL,
    "aprovado" BOOLEAN NOT NULL DEFAULT false,
    "objetivos" JSONB NOT NULL,
    "caracteristicas" JSONB NOT NULL,
    "seguranca" JSONB NOT NULL,
    "ayurveda" JSONB,
    "trilhaId" TEXT,
    "ordemTrilha" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "sono" TEXT NOT NULL,
    "energia" TEXT NOT NULL,
    "corpo" TEXT NOT NULL,
    "dor" TEXT NOT NULL,
    "regiaoDaDor" TEXT,
    "estresse" TEXT NOT NULL,
    "digestao" TEXT NOT NULL,
    "humor" TEXT NOT NULL,
    "tempo" INTEGER NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "dia" TEXT NOT NULL,
    "principalId" TEXT,
    "alternativaId" TEXT,
    "estadoFuncional" TEXT NOT NULL,
    "versaoConfig" TEXT NOT NULL,
    "auditoria" JSONB NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Content_aprovado_idx" ON "Content"("aprovado");

-- CreateIndex
CREATE INDEX "Content_trilhaId_ordemTrilha_idx" ON "Content"("trilhaId", "ordemTrilha");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckin_userId_dia_key" ON "DailyCheckin"("userId", "dia");

-- CreateIndex
CREATE INDEX "Recommendation_userId_dia_idx" ON "Recommendation"("userId", "dia");

-- AddForeignKey
ALTER TABLE "DailyCheckin" ADD CONSTRAINT "DailyCheckin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
