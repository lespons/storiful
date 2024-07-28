/*
  Warnings:

  - You are about to drop the column `completed` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `completedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `completedById` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `createdById` on the `orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_completedById_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_createdById_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "completed",
DROP COLUMN "completedAt",
DROP COLUMN "completedById",
DROP COLUMN "createdAt",
DROP COLUMN "createdById";
