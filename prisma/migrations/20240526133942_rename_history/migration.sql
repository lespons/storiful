-- AlterTable
ALTER TABLE "order_states_history" RENAME CONSTRAINT "orderStatesHistory_pkey" TO "order_states_history_pkey";

-- RenameForeignKey
ALTER TABLE "order_states_history" RENAME CONSTRAINT "orderStatesHistory_orderId_fkey" TO "order_states_history_orderId_fkey";

-- RenameForeignKey
ALTER TABLE "order_states_history" RENAME CONSTRAINT "orderStatesHistory_userId_fkey" TO "order_states_history_userId_fkey";
