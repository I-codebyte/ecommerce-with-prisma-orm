-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "userId" TEXT NOT NULL DEFAULT 'created before adding the field';

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
