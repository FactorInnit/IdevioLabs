"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  Trash2,
} from "lucide-react";
import { GlassCard } from "../GlassCard";
import { cn } from "@/lib/utils";

type EventType = "appointment" | "deadline";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  type: EventType;
  notes?: string;
}

function storageKey(projectId: string) {
  return `idevio-calendar-${projectId}`;
}

function loadEvents(projectId: string): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(storageKey(projectId));
    if (raw) return JSON.parse(raw) as CalendarEvent[];
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

export function CalendarModule({
  projectId,
  projectName,
}: {
  projectId: string;
  projectName: string;
}) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState<EventType>("appointment");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setEvents(loadEvents(projectId));
  }, [projectId]);

  const persist = useCallback(
    (next: CalendarEvent[]) => {
      setEvents(next);
      localStorage.setItem(storageKey(projectId), JSON.stringify(next));
    },
    [projectId]
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
    };
    persist([...events, event]);
    setTitle("");
    setTime("");
    setNotes("");
  };

  const removeEvent = (id: string) => {
    persist(events.filter((e) => e.id !== id));
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
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    }
    return map;
  }, [events]);

  const upcoming = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return [...events]
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? "").localeCompare(b.time ?? ""));
  }, [events]);

  const selectedEvents = selectedDate ? eventsByDate[selectedDate] ?? [] : [];

  return (
    <div className="space-y-6">
      <GlassCard className="p-4" hover={false}>
        <p className="text-sm text-slate-600">
          Schedule <strong className="text-navy-900">appointments</strong> and track{" "}
          <strong className="text-navy-900">deadlines</strong> for {projectName}.
        </p>
      </GlassCard>

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
              const hasAppt = dayEvents.some((e) => e.type === "appointment");
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
                      {hasAppt && (
                        <span className="h-1 w-1 rounded-full bg-blue-400" />
                      )}
                      {hasDeadline && (
                        <span className="h-1 w-1 rounded-full bg-red-400" />
                      )}
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
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                            ev.type === "deadline"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-700"
                          )}
                        >
                          {ev.type}
                        </span>
                        <p className="mt-1 font-semibold text-navy-900">{ev.title}</p>
                        {ev.time && (
                          <p className="flex items-center gap-1 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {ev.time}
                          </p>
                        )}
                        {ev.notes && (
                          <p className="mt-1 text-xs text-slate-500">{ev.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => removeEvent(ev.id)}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
          <p className="mt-3 text-sm text-slate-500">No upcoming events. Add appointments or deadlines above.</p>
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
                    {ev.time ? ` · ${ev.time}` : ""} · {ev.type}
                  </p>
                </div>
                <button
                  onClick={() => removeEvent(ev.id)}
                  className="text-slate-300 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
