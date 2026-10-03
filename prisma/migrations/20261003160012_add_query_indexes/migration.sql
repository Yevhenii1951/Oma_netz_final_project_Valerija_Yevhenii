-- Query indexes for the read paths the app actually uses, plus a database-level
-- guarantee that one user cannot redeem the same reward twice.
--
-- The unique index below would fail on an environment that already holds
-- duplicate redemptions (created before this constraint existed), so the
-- duplicates are collapsed first. Nothing in the app reads more than one
-- redemption per pair, so keeping the oldest row is behaviour-preserving.

DELETE FROM "redemptions" a
USING "redemptions" b
WHERE a."userId" = b."userId"
  AND a."rewardId" = b."rewardId"
  AND a."id" > b."id";

-- CreateIndex
CREATE INDEX "messages_chatId_createdAt_idx" ON "messages"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE INDEX "offers_requestId_status_idx" ON "offers"("requestId", "status");

-- CreateIndex
CREATE INDEX "offers_helperId_createdAt_idx" ON "offers"("helperId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ratings_helperId_idx" ON "ratings"("helperId");

-- CreateIndex
CREATE INDEX "ratings_authorId_idx" ON "ratings"("authorId");

-- CreateIndex
CREATE INDEX "redemptions_userId_idx" ON "redemptions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "redemptions_userId_rewardId_key" ON "redemptions"("userId", "rewardId");

-- CreateIndex
CREATE INDEX "requests_status_createdAt_idx" ON "requests"("status", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "requests_seniorId_createdAt_idx" ON "requests"("seniorId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "rewards_isActive_idx" ON "rewards"("isActive");

-- CreateIndex
CREATE INDEX "users_role_helperStatus_createdAt_idx" ON "users"("role", "helperStatus", "createdAt");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

