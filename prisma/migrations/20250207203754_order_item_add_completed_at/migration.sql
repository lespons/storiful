-- AlterTable
ALTER TABLE "order_items" ADD COLUMN     "completedAt" TIMESTAMP(3);

-- UpdateTable
UPDATE order_items
SET "completedAt" = (SELECT date FROM order_states_history WHERE "orderId" = order_items."orderId" AND state = 'COMPLETED')
WHERE completed = TRUE;
