/*
  Warnings:

  - You are about to drop the column `address_id` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Order` table. All the data in the column will be lost.
  - Added the required column `addressId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "address_id",
DROP COLUMN "total",
ADD COLUMN     "addressId" TEXT NOT NULL;
