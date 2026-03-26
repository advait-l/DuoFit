-- CreateTable
CREATE TABLE "FitnessSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workoutDays" TEXT NOT NULL DEFAULT '',
    "runDays" TEXT NOT NULL DEFAULT '',
    "dailySteps" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FitnessSchedule_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "FitnessSchedule_userId_key" ON "FitnessSchedule"("userId");
