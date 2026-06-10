-- Remove qtyPerUnit from FeedFormulaIngredient (make it nullable first for existing data)
ALTER TABLE "FeedFormulaIngredient" DROP COLUMN IF EXISTS "qtyPerUnit";

-- Create FeedBatchIngredient table
CREATE TABLE "FeedBatchIngredient" (
    "id"        TEXT NOT NULL,
    "batchId"   TEXT NOT NULL,
    "stockId"   TEXT NOT NULL,
    "qty"       DOUBLE PRECISION NOT NULL,
    "costUsed"  DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedBatchIngredient_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "FeedBatchIngredient" ADD CONSTRAINT "FeedBatchIngredient_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "FeedBatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FeedBatchIngredient" ADD CONSTRAINT "FeedBatchIngredient_stockId_fkey"
  FOREIGN KEY ("stockId") REFERENCES "Stock"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
