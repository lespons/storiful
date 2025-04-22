-- CreateEnum
CREATE TYPE "ItemTypePriceType" AS ENUM ('BUY', 'SELL');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "price" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "item_type_price" (
    "id" TEXT NOT NULL,
    "itemTypeId" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "type" "ItemTypePriceType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_type_price_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "item_type_price" ADD CONSTRAINT "item_type_price_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "item_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;
