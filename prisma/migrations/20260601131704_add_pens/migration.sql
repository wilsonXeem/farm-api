-- AlterTable
ALTER TABLE "Mortality" ADD COLUMN     "penId" TEXT;

-- AlterTable
ALTER TABLE "Production" ADD COLUMN     "penId" TEXT;

-- CreateTable
CREATE TABLE "Pen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalBirds" INTEGER NOT NULL DEFAULT 100,
    "farmId" TEXT NOT NULL,
    "workerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pen_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pen" ADD CONSTRAINT "Pen_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pen" ADD CONSTRAINT "Pen_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Production" ADD CONSTRAINT "Production_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mortality" ADD CONSTRAINT "Mortality_penId_fkey" FOREIGN KEY ("penId") REFERENCES "Pen"("id") ON DELETE SET NULL ON UPDATE CASCADE;
