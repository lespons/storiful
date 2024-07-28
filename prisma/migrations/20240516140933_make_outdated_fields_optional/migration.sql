-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_createdById_fkey";

-- AlterTable
ALTER TABLE "orders" ALTER COLUMN "createdAt" DROP NOT NULL,
ALTER COLUMN "completed" DROP NOT NULL,
ALTER COLUMN "createdById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orderStatesHistory" ADD CONSTRAINT "orderStatesHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
