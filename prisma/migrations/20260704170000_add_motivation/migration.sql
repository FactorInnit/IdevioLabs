-- Daily motivation notification settings
CREATE TABLE "UserMotivationSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'random',
    "notifyTime" TEXT NOT NULL DEFAULT '08:00',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "browserNotify" BOOLEAN NOT NULL DEFAULT true,
    "lastNotifiedDate" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserMotivationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "UserMotivationSettings_userId_key" ON "UserMotivationSettings"("userId");
