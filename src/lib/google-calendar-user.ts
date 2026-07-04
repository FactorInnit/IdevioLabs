import { prisma } from "@/lib/prisma";
import {
  fetchGoogleCalendarEvents,
  refreshGoogleCalendarAccessToken,
  type GoogleCalendarEvent,
} from "@/lib/google-calendar";

export async function getGoogleCalendarAccessToken(
  userId: string
): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { googleCalendarRefreshToken: true },
  });

  if (!user?.googleCalendarRefreshToken) return null;

  try {
    const tokens = await refreshGoogleCalendarAccessToken(user.googleCalendarRefreshToken);
    return tokens.access_token;
  } catch (error) {
    console.error("Google Calendar token refresh failed:", error);
    return null;
  }
}

export async function listUserGoogleCalendarEvents(
  userId: string,
  timeMin: string,
  timeMax: string
): Promise<GoogleCalendarEvent[]> {
  const accessToken = await getGoogleCalendarAccessToken(userId);
  if (!accessToken) return [];

  try {
    return await fetchGoogleCalendarEvents(accessToken, timeMin, timeMax);
  } catch (error) {
    console.error("Google Calendar fetch failed:", error);
    return [];
  }
}

export async function getGoogleCalendarStatus(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { googleCalendarRefreshToken: true, googleCalendarEmail: true },
    });

    return {
      connected: Boolean(user?.googleCalendarRefreshToken),
      email: user?.googleCalendarEmail ?? null,
    };
  } catch (error) {
    console.error("Google Calendar status error:", error);
    return { connected: false, email: null };
  }
}
