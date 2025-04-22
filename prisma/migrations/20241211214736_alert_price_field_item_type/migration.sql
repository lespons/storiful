/*
  Warnings:

  - You are about to alter the column `price` on the `item_type_price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(9,3)`.

*/
-- AlterTable
ALTER TABLE "item_type_price" ALTER COLUMN "price" SET DATA TYPE DECIMAL(9,3);
