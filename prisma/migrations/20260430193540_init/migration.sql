/*
  Warnings:

  - You are about to drop the column `isbn` on the `Book` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Book_isbn_key";

-- AlterTable
ALTER TABLE "Book" DROP COLUMN "isbn";
