-- UserUsage
CREATE TABLE "UserUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "aiMonth" TEXT NOT NULL DEFAULT '',
    "aiMessageCount" INTEGER NOT NULL DEFAULT 0,
    "validatorMonth" TEXT NOT NULL DEFAULT '',
    "validatorRunCount" INTEGER NOT NULL DEFAULT 0,
    "digestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "UserUsage_userId_key" ON "UserUsage"("userId");

-- ProjectHabits
CREATE TABLE "ProjectHabits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "dataJson" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProjectHabits_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ProjectHabits_projectId_key" ON "ProjectHabits"("projectId");

-- WeeklyReview
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TEXT NOT NULL,
    "wins" TEXT NOT NULL DEFAULT '',
    "blockers" TEXT NOT NULL DEFAULT '',
    "nextFocus" TEXT NOT NULL DEFAULT '',
    "habitPct" INTEGER NOT NULL DEFAULT 0,
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL,
    CONSTRAINT "WeeklyReview_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "WeeklyReview_projectId_weekStart_key" ON "WeeklyReview"("projectId", "weekStart");

-- Node assignments
ALTER TABLE "WorkflowNode" ADD COLUMN "assigneeUserId" TEXT;
ALTER TABLE "WorkflowNode" ADD COLUMN "assigneeName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "WorkflowNode" ADD COLUMN "assigneeEmail" TEXT NOT NULL DEFAULT '';
