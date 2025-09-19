/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,clinicId,specializationId]` on the table `Doctor_User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Doctor_User_clinicId_key";

-- DropIndex
DROP INDEX "Doctor_User_doctorId_key";

-- DropIndex
DROP INDEX "Doctor_User_specializationId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_User_doctorId_clinicId_specializationId_key" ON "Doctor_User"("doctorId", "clinicId", "specializationId");
