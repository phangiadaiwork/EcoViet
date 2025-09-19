/*
  Warnings:

  - A unique constraint covering the columns `[doctorId]` on the table `Doctor_User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clinicId]` on the table `Doctor_User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[specializationId]` on the table `Doctor_User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Doctor_User_doctorId_key" ON "Doctor_User"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_User_clinicId_key" ON "Doctor_User"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_User_specializationId_key" ON "Doctor_User"("specializationId");
