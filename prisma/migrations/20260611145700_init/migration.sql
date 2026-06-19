-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "total_amount" SET DEFAULT 0,
ALTER COLUMN "sub_total" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "color" TEXT,
ADD COLUMN     "size" INTEGER;
