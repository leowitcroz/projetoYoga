-- CreateTable
CREATE TABLE "Track" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "totalAulas" INTEGER NOT NULL,
    "preRequisitoId" TEXT,
    "autorId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Track_autorId_idx" ON "Track"("autorId");

-- CreateIndex
CREATE INDEX "Track_preRequisitoId_idx" ON "Track"("preRequisitoId");

-- Antes da trilha virar tabela, ela era um texto digitado em cada pratica.
-- As praticas do catalogo ja apontam para "TRILHA-MOB-01", que nao existe em
-- lugar nenhum: sem este passo, a chave estrangeira abaixo recusa a migracao.
-- Cada identificador que ja estava em uso vira uma trilha, com o proprio
-- identificador como nome provisorio e o total de aulas que ela ja tem --
-- nada se perde, e o professor renomeia no painel.
INSERT INTO "Track" ("id", "nome", "totalAulas", "criadoEm", "atualizadoEm")
SELECT "trilhaId", "trilhaId", COUNT(*)::int, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "Content"
WHERE "trilhaId" IS NOT NULL
GROUP BY "trilhaId";

-- A ordem passa a ser responsabilidade da trilha, entao ela precisa estar
-- inteira: 1, 2, 3... sem buraco e sem repeticao. Quem estiver sem numero
-- entra no fim, pela data de criacao.
WITH ordenadas AS (
  SELECT "id", ROW_NUMBER() OVER (
    PARTITION BY "trilhaId"
    ORDER BY "ordemTrilha" NULLS LAST, "criadoEm", "id"
  ) AS posicao
  FROM "Content"
  WHERE "trilhaId" IS NOT NULL
)
UPDATE "Content" SET "ordemTrilha" = ordenadas.posicao
FROM ordenadas WHERE "Content"."id" = ordenadas."id";

-- AddForeignKey
ALTER TABLE "Content" ADD CONSTRAINT "Content_trilhaId_fkey" FOREIGN KEY ("trilhaId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_preRequisitoId_fkey" FOREIGN KEY ("preRequisitoId") REFERENCES "Track"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Track" ADD CONSTRAINT "Track_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
