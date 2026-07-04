-- Add Google Calendar integration fields to User
ALTER TABLE "User" ADD COLUMN "googleCalendarRefreshToken" TEXT;
ALTER TABLE "User" ADD COLUMN "googleCalendarEmail" TEXT;
