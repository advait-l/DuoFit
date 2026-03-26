/*
  Warnings:

  - You are about to drop the column `description` on the `MealLog` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MealLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mealType" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT '',
    "notes" TEXT,
    "calories" INTEGER,
    "logDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MealLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MealLog" ("calories", "createdAt", "id", "logDate", "mealType", "updatedAt", "userId") SELECT "calories", "createdAt", "id", "logDate", "mealType", "updatedAt", "userId" FROM "MealLog";
DROP TABLE "MealLog";
ALTER TABLE "new_MealLog" RENAME TO "MealLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
