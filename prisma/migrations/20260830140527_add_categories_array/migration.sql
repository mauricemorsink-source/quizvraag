-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "categories" TEXT[] DEFAULT ARRAY[]::TEXT[];
