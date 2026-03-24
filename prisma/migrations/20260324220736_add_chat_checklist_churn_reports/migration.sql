-- AlterEnum
ALTER TYPE "AlertType" ADD VALUE 'BUDGET_WARNING';

-- CreateTable
CREATE TABLE "ClientChat" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientChatMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyChecklist" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChurnRiskScore" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "score" INTEGER NOT NULL,
    "factors" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChurnRiskScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReport" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "weekStart" DATE NOT NULL,
    "content" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientChat_clientId_key" ON "ClientChat"("clientId");

-- CreateIndex
CREATE INDEX "ClientChatMessage_chatId_createdAt_idx" ON "ClientChatMessage"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "WeeklyChecklist_managerId_weekStart_idx" ON "WeeklyChecklist"("managerId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyChecklist_managerId_weekStart_key" ON "WeeklyChecklist"("managerId", "weekStart");

-- CreateIndex
CREATE INDEX "ChurnRiskScore_clientId_weekStart_idx" ON "ChurnRiskScore"("clientId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "ChurnRiskScore_clientId_weekStart_key" ON "ChurnRiskScore"("clientId", "weekStart");

-- CreateIndex
CREATE INDEX "WeeklyReport_clientId_weekStart_idx" ON "WeeklyReport"("clientId", "weekStart");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReport_clientId_weekStart_key" ON "WeeklyReport"("clientId", "weekStart");

-- AddForeignKey
ALTER TABLE "ClientChat" ADD CONSTRAINT "ClientChat_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientChatMessage" ADD CONSTRAINT "ClientChatMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "ClientChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientChatMessage" ADD CONSTRAINT "ClientChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyChecklist" ADD CONSTRAINT "WeeklyChecklist_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChurnRiskScore" ADD CONSTRAINT "ChurnRiskScore_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyReport" ADD CONSTRAINT "WeeklyReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
