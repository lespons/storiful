-- CreateTable
CREATE TABLE "order_item_progress" (
    "id" TEXT NOT NULL,
    "progress" INTEGER,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "order_item_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "order_item_progress_itemId_key" ON "order_item_progress"("itemId");

-- AddForeignKey
ALTER TABLE "order_item_progress" ADD CONSTRAINT "order_item_progress_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "item_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
