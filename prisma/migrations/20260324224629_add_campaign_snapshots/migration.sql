-- CreateTable
CREATE TABLE "CampaignSnapshot" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "platformAccountId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "date" DATE NOT NULL,
    "campaignId" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "adSetId" TEXT,
    "adSetName" TEXT,
    "spend" DECIMAL(12,2),
    "impressions" INTEGER,
    "clicks" INTEGER,
    "reach" INTEGER,
    "ctr" DECIMAL(8,4),
    "cpc" DECIMAL(10,4),
    "conversions" INTEGER,
    "conversionValue" DECIMAL(12,2),
    "roas" DECIMAL(8,4),
    "cpl" DECIMAL(10,4),
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CampaignSnapshot_clientId_date_idx" ON "CampaignSnapshot"("clientId", "date");

-- CreateIndex
CREATE INDEX "CampaignSnapshot_platformAccountId_date_idx" ON "CampaignSnapshot"("platformAccountId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignSnapshot_platformAccountId_date_campaignId_adSetId_key" ON "CampaignSnapshot"("platformAccountId", "date", "campaignId", "adSetId");

-- AddForeignKey
ALTER TABLE "CampaignSnapshot" ADD CONSTRAINT "CampaignSnapshot_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignSnapshot" ADD CONSTRAINT "CampaignSnapshot_platformAccountId_fkey" FOREIGN KEY ("platformAccountId") REFERENCES "PlatformAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;
