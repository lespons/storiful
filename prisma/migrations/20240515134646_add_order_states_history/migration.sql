/*
  Warnings:

  - A unique constraint covering the columns `[lastStateId]` on the table `orders` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderStates" AS ENUM ('CREATED', 'COMPLETED', 'SENT');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "lastStateId" TEXT;

-- CreateTable
CREATE TABLE "orderStatesHistory" (
    "id" TEXT NOT NULL,
    "state" "OrderStates" NOT NULL DEFAULT 'CREATED',
    "date" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "orderStatesHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_lastStateId_key" ON "orders"("lastStateId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_lastStateId_fkey" FOREIGN KEY ("lastStateId") REFERENCES "orderStatesHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderStatesHistory" ADD CONSTRAINT "orderStatesHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
