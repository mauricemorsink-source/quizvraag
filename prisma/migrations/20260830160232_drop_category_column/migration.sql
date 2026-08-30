-- DropIndex
DROP INDEX "Question_category_idx";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "category";

-- CreateIndex
CREATE INDEX "Question_categories_idx" ON "Question"("categories");
