-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('MUZIEKRONDE', 'PLAATJESRONDE', 'INTRORONDE', 'OVERIGE');

-- CreateTable
CREATE TABLE "RoundIdea" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "roundType" "RoundType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoundIdea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoundIdea_roundType_idx" ON "RoundIdea"("roundType");
