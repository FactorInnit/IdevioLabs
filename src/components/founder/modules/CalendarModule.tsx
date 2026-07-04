"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Link2,
  Plus,
  Trash2,
  Unplug,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { CalendlyEmbed } from "./CalendlyEmbed";
import {
  clearCalendlySettings,
  loadCalendlySettings,
  normalizeCalendlyUrl,
  saveCalendlySettings,
} from "@/lib/calendar-integrations";
import { cn } from "@/lib/utils";

type EventType = "appointment" | "deadline";
type EventSource = "local" | "google";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  endTime?: string;
  type: EventType;
  notes?: string;
  source: EventSource;
  externalUrl?: string;
}

function storageKey(projectId: string) {
  return `idevio-calendar-${projectId}`;
}

function loadEvents(projectId: string): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (raw) {
      return (JSON.parse(raw) as CalendarEvent[]).map((e) => ({
        ...e,
        source: "local" as const,
      }));
    }
  } catch {
    // ignore
  }
  return [];
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function monthLabel(year: number, month: number) {
  return new Date(year, month, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function monthRangeIso(year: number, month: number) {
  const from = new Date(year, month, 1);
  const to = new Date(year, month + 1, 0, 23, 59, 59);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function CalendarModule({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const params = useSearchParams();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [calendlyInput, setCalendlyInput] = useState("");
  const [showCalendly, setShowCalendly] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<EventType>("appointment");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setEvents(loadEvents(projectId));
    const calendly = loadCalendlySettings(projectId);
    if (calendly) {
      setCalendlyUrl(calendly.url);
      setCalendlyInput(calendly.url);
    }
  }, [projectId]);

  const loadGoogle = useCallback(async () => {
    const statusRes = await fetch("/api/calendar/google/status");
    if (!statusRes.ok) return;
    const status = await statusRes.json();
    setGoogleConnected(Boolean(status.connected));
    setGoogleEmail(status.email ?? null);

    if (!status.connected) {
      setGoogleEvents([]);
      return;
    }

    const range = monthRangeIso(viewYear, viewMonth);
    const eventsRes = await fetch(
      `/api/calendar/google/events?projectId=${projectId}&from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
    );
    if (!eventsRes.ok) return;
    const data = await eventsRes.json();
    setGoogleEvents(
      (data.events ?? []).map(
        (e: {
          id: string;
          title: string;
          date: string;
          time?: string;
          endTime?: string;
          notes?: string;
          externalUrl?: string;
        }) => ({
          ...e,
          type: "appointment" as EventType,
          source: "google" as const,
        })
      )
    );
  }, [projectId, viewYear, viewMonth]);

  useEffect(() => {
    loadGoogle();
  }, [loadGoogle]);

  useEffect(() => {
    const err = params.get("calendar_error");
    if (params.get("google_calendar") === "connected") {
      setStatusMessage("Google Calendar connected successfully.");
    } else if (err === "not_configured") {
      setStatusMessage(
        "Google Calendar is not configured on the server yet. Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel."
      );
    } else if (err === "db_setup") {
      setStatusMessage(
        "Database columns not found on the live Turso DB. Run both SQL lines below in the same database as Vercel TURSO_DATABASE_URL, then try again."
      );
    } else if (err === "google_denied") {
      setStatusMessage("Google Calendar connection was cancelled.");
    } else if (err === "google_failed") {
      setStatusMessage(
        "Google Calendar connection failed. Check that the Calendar API is enabled and the redirect URI matches exactly."
      );
    } else if (err) {
      setStatusMessage("Could not connect Google Calendar. Try again.");
    }
  }, [params]);

  const persist = useCallback(
    (next: CalendarEvent[]) => {
      const localOnly = next.filter((e) => e.source === "local");
      setEvents(localOnly);
      localStorage.setItem(storageKey(projectId), JSON.stringify(localOnly));
    },
    [projectId]
  );

  const allEvents = useMemo(
    () => [...events, ...googleEvents],
    [events, googleEvents]
  );

  const addEvent = () => {
    if (!selectedDate || !title.trim()) return;
    const event: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: title.trim(),
      date: selectedDate,
      time: time || undefined,
      type,
      notes: notes.trim() || undefined,
      source: "local",
    };
    persist([...events, event]);
    setTitle("");
    setTime("");
    setNotes("");
  };

  const removeEvent = (id: string) => {
    persist(events.filter((e) => e.id !== id));
  };

  const saveCalendly = () => {
    const saved = saveCalendlySettings(projectId, calendlyInput);
    if (!saved) {
      setStatusMessage("Enter a valid Calendly link (e.g. calendly.com/your-name/30min).");
      return;
    }
    setCalendlyUrl(saved.url);
    setShowCalendly(true);
    setStatusMessage("Calendly linked — book meetings below.");
  };

  const disconnectGoogle = async () => {
    await fetch("/api/calendar/google/disconnect", { method: "POST" });
    setGoogleConnected(false);
    setGoogleEmail(null);
    setGoogleEvents([]);
    setStatusMessage("Google Calendar disconnected.");
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const totalDays = daysInMonth(viewYear, viewMonth);
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const calendarCells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of allEvents) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [allEvents]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...allEvents]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
  }, [allEvents]);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return (
    <div className="space-y-6">
      <GlassCard className="p-4" hover={false}>
        <p className="text-sm text-slate-600">
          Schedule <strong className="text-navy-900">appointments</strong>, track{" "}
          <strong className="text-navy-900">deadlines</strong>, sync{" "}
          <strong className="text-navy-900">Google Calendar</strong>, and embed{" "}
          <strong className="text-navy-900">Calendly</strong> for {projectName}.
        </p>
      </GlassCard>

      {statusMessage && (
        <GlassCard
          className={cn(
            "px-4 py-3 text-sm",
            statusMessage.includes("successfully")
              ? "border-emerald-200/50 bg-emerald-50/80 text-emerald-800"
              : "border-amber-200/50 bg-amber-50/80 text-amber-900"
          )}
          hover={false}
        >
          {statusMessage}
        </GlassCard>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <GlassCard className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-navy-700" />
            <h2 className="font-display text-lg font-bold text-navy-900">Google Calendar</h2>
          </div>
          {googleConnected ? (
            <div>
              <p className="text-sm text-slate-600">
                Synced as <span className="font-semibold text-navy-900">{googleEmail}</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Events appear on your month view and upcoming list (read-only).
              </p>
              <button
                onClick={disconnectGoogle}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-navy-900/10 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-900/5"
              >
                <Unplug className="h-4 w-4" />
                Disconnect
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-600">
                Connect to pull in your real meetings alongside startup deadlines.
              </p>
              <a
                href={`/api/calendar/google/connect?projectId=${projectId}`}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Link2 className="h-4 w-4" />
                Connect Google Calendar
              </a>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
                In Google Cloud: enable Calendar API and add this redirect URI exactly:{" "}
                <code className="break-all rounded bg-navy-900/5 px-1">
                  https://ideviolabs.com/api/calendar/google/callback
                </code>
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                Turso SQL (run both in the DB linked to Vercel TURSO_DATABASE_URL):
              </p>
              <code className="mt-1 block break-all rounded bg-navy-900/5 px-2 py-1 text-[10px] text-slate-600">
                ALTER TABLE &quot;User&quot; ADD COLUMN &quot;googleCalendarRefreshToken&quot; TEXT;
                <br />
                ALTER TABLE &quot;User&quot; ADD COLUMN &quot;googleCalendarEmail&quot; TEXT;
              </code>
            </div>
          )}
        </GlassCard>

        <GlassCard className="p-5" hover={false}>
          <div className="mb-4 flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-navy-700" />
            <h2 className="font-display text-lg font-bold text-navy-900">Calendly</h2>
          </div>
          <p className="text-sm text-slate-600">
            Paste your Calendly scheduling link to let investors or customers book time with you.
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={calendlyInput}
              onChange={(e) => setCalendlyInput(e.target.value)}
              placeholder="https://calendly.com/your-name/30min"
              className="flex-1 rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
            />
            <button
              onClick={saveCalendly}
              className="rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Save
            </button>
          </div>
          {calendlyUrl && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => setShowCalendly((v) => !v)}
                className="text-sm font-semibold text-navy-700 hover:underline"
              >
                {showCalendly ? "Hide" : "Show"} booking widget
              </button>
              <button
                onClick={() => {
                  clearCalendlySettings(projectId);
                  setCalendlyUrl("");
                  setCalendlyInput("");
                  setShowCalendly(false);
                }}
                className="text-sm text-slate-400 hover:text-red-500"
              >
                Remove
              </button>
              {normalizeCalendlyUrl(calendlyUrl) && (
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-navy-600 hover:underline"
                >
                  Open in Calendly <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      {showCalendly && calendlyUrl && (
        <GlassCard className="overflow-hidden p-4" hover={false}>
          <h2 className="mb-3 font-display text-lg font-bold text-navy-900">Book a meeting</h2>
          <CalendlyEmbed url={calendlyUrl} />
        </GlassCard>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <GlassCard className="p-6" hover={false}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-navy-700" />
              <h2 className="font-display text-lg font-bold text-navy-900">Month view</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="rounded-lg p-1 hover:bg-navy-900/5">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="min-w-[140px] text-center text-sm font-semibold text-navy-900">
                {monthLabel(viewYear, viewMonth)}
              </span>
              <button onClick={nextMonth} className="rounded-lg p-1 hover:bg-navy-900/5">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-blue-400" /> Appointment
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" /> Deadline
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Google
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />;
              const key = dateKey(viewYear, viewMonth, day);
              const dayEvents = eventsByDate[key] ?? [];
              const hasDeadline = dayEvents.some((e) => e.type === "deadline");
              const hasAppt = dayEvents.some((e) => e.type === "appointment" && e.source === "local");
              const hasGoogle = dayEvents.some((e) => e.source === "google");
              const isSelected = selectedDate === key;
              const isToday = key === new Date().toISOString().slice(0, 10);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(key)}
                  className={cn(
                    "relative flex h-11 flex-col items-center justify-center rounded-lg text-xs font-medium transition",
                    isSelected
                      ? "bg-navy-900 text-white"
                      : "bg-navy-900/5 text-navy-800 hover:bg-navy-900/10",
                    isToday && !isSelected && "ring-2 ring-navy-400"
                  )}
                >
                  {day}
                  {dayEvents.length > 0 && (
                    <span className="absolute bottom-1 flex gap-0.5">
                      {hasAppt && <span className="h-1 w-1 rounded-full bg-blue-400" />}
                      {hasDeadline && <span className="h-1 w-1 rounded-full bg-red-400" />}
                      {hasGoogle && <span className="h-1 w-1 rounded-full bg-emerald-500" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6" hover={false}>
          <h2 className="font-display text-lg font-bold text-navy-900">
            {selectedDate ? `Add to ${selectedDate}` : "Select a date"}
          </h2>
          {selectedDate && (
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (e.g. Investor call)"
                className="w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
                />
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EventType)}
                  className="rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
                >
                  <option value="appointment">Appointment</option>
                  <option value="deadline">Deadline</option>
                </select>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (optional)"
                rows={2}
                className="w-full rounded-xl border border-navy-900/10 px-3 py-2 text-sm"
              />
              <button
                onClick={addEvent}
                disabled={!title.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-navy-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add event
              </button>

              {selectedEvents.length > 0 && (
                <ul className="mt-4 space-y-2 border-t border-navy-900/6 pt-4">
                  {selectedEvents.map((ev) => (
                    <li
                      key={ev.id}
                      className="flex items-start justify-between rounded-xl border border-navy-900/6 p-3"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                              ev.source === "google"
                                ? "bg-emerald-100 text-emerald-700"
                                : ev.type === "deadline"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                            )}
                          >
                            {ev.source === "google" ? "Google" : ev.type}
                          </span>
                        </div>
                        <p className="mt-1 font-semibold text-navy-900">{ev.title}</p>
                        {ev.time && (
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {ev.time}
                            {ev.endTime ? ` – ${ev.endTime}` : ""}
                          </p>
                        )}
                        {ev.notes && (
                          <p className="mt-1 text-xs text-slate-500">{ev.notes}</p>
                        )}
                        {ev.externalUrl && (
                          <a
                            href={ev.externalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-flex items-center gap-1 text-xs text-navy-600 hover:underline"
                          >
                            Open in Google Calendar <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                      {ev.source === "local" && (
                        <button
                          onClick={() => removeEvent(ev.id)}
                          className="text-slate-300 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6" hover={false}>
        <h2 className="font-display text-lg font-bold text-navy-900">Upcoming</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            No upcoming events. Add deadlines, connect Google Calendar, or share your Calendly link.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {upcoming.slice(0, 12).map((ev) => (
              <li
                key={ev.id}
                className="flex items-center justify-between rounded-xl border border-navy-900/6 px-4 py-3"
              >
                <div>
                  <p className="font-semibold text-navy-900">{ev.title}</p>
                  <p className="text-xs text-slate-500">
                    {ev.date}
                    {ev.time ? ` · ${ev.time}` : ""} ·{" "}
                    {ev.source === "google" ? "Google Calendar" : ev.type}
                  </p>
                </div>
                {ev.source === "local" ? (
                  <button
                    onClick={() => removeEvent(ev.id)}
                    className="text-slate-300 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : ev.externalUrl ? (
                  <a
                    href={ev.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-navy-500 hover:text-navy-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
