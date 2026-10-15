-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "tema" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "capaUrl" TEXT,
    "professor" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'RASCUNHO',
    "autorId" TEXT,
    "comentarioRevisao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" TEXT NOT NULL,
    "cursoId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "ordem" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'video',
    "duracaoMin" INTEGER NOT NULL DEFAULT 10,
    "videoProvedor" TEXT,
    "videoId" TEXT,
    "texto" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "concluidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_tema_idx" ON "Course"("tema");

-- CreateIndex
CREATE INDEX "Lesson_cursoId_ordem_idx" ON "Lesson"("cursoId", "ordem");

-- CreateIndex
CREATE INDEX "LessonEvent_userId_idx" ON "LessonEvent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonEvent_userId_lessonId_key" ON "LessonEvent"("userId", "lessonId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_autorId_fkey" FOREIGN KEY ("autorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lesson" ADD CONSTRAINT "Lesson_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonEvent" ADD CONSTRAINT "LessonEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonEvent" ADD CONSTRAINT "LessonEvent_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
