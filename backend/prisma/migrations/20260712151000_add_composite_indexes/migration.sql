-- CreateIndex
CREATE INDEX "VaultItem_userId_websiteName_idx" ON "VaultItem"("userId", "websiteName");

-- CreateIndex
CREATE INDEX "VaultItem_userId_favorite_idx" ON "VaultItem"("userId", "favorite");
