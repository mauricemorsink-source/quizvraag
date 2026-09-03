-- AlterTable
ALTER TABLE "Draft" ALTER COLUMN "category" DROP NOT NULL;

-- AlterTable
ALTER TABLE "RoundIdea" ADD COLUMN     "answer" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "mediaUrl" TEXT;
