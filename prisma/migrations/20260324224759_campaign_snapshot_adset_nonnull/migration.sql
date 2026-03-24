/*
  Warnings:

  - Made the column `adSetId` on table `CampaignSnapshot` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "CampaignSnapshot" ALTER COLUMN "adSetId" SET NOT NULL,
ALTER COLUMN "adSetId" SET DEFAULT '';
