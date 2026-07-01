"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Clock, Plus } from "lucide-react";
import { DAY_LABELS } from "@/lib/constants";
import { cn, parseJson } from "@/lib/utils";
import type { ReminderData } from "@/lib/types";

interface ReminderPanelProps {
  projectId: string;
  reminders: ReminderData[];
  onRefresh: () => void;
}

export function ReminderPanel({
  projectId,
  reminders,
  onRefresh,
}: ReminderPanelProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  const toggleReminder = async (reminder: ReminderData) => {
    await fetch(`/api/projects/${projectId}/reminders`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: reminder.id, enabled: !reminder.enabled }),
    });
    onRefresh();
  };

  const addReminder = async () => {
    await fetch(`/api/projects/${projectId}/reminders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Daily check-in",
        message: "Review your startup roadmap and update progress.",
        time: "09:00",
        days: [1, 2, 3, 4, 5],
      }),
    });
    onRefresh();
  };

  useEffect(() => {
    if (permission !== "granted" || reminders.length === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      for (const reminder of reminders) {
        if (!reminder.enabled || reminder.time !== currentTime) continue;
        const days = parseJson<number[]>(reminder.days, []);
        if (!days.includes(currentDay)) continue;

        const key = `reminder-${reminder.id}-${now.toDateString()}-${currentTime}`;
        if (localStorage.getItem(key)) continue;

        new Notification(reminder.title, { body: reminder.message });
        localStorage.setItem(key, "1");
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [permission, reminders]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900">
            <BellRing className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-navy-950">Daily reminders</h3>
            <p className="text-xs text-slate-500">Stay on schedule</p>
          </div>
        </div>
        {permission !== "granted" && (
          <button
            onClick={requestPermission}
            className="rounded-lg border border-navy-200 bg-navy-50 px-3 py-1.5 text-xs font-semibold text-navy-800 transition hover:bg-navy-100"
          >
            Enable alerts
          </button>
        )}
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => {
          const days = parseJson<number[]>(reminder.days, []);
          return (
            <div
              key={reminder.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                reminder.enabled
                  ? "border-navy-200 bg-navy-50/50"
                  : "border-slate-200 bg-slate-50 opacity-60"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-navy-950">{reminder.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {reminder.message}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                    <Clock className="h-3 w-3" />
                    {reminder.time}
                    <span className="text-slate-300">·</span>
                    {days.map((d) => DAY_LABELS[d]).join(", ")}
                  </div>
                </div>
                <button
                  onClick={() => toggleReminder(reminder)}
                  className={cn(
                    "rounded-lg p-2 transition",
                    reminder.enabled
                      ? "bg-navy-900 text-white"
                      : "bg-slate-200 text-slate-500"
                  )}
                >
                  <Bell className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addReminder}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-medium text-slate-600 transition hover:border-navy-400 hover:text-navy-800"
      >
        <Plus className="h-4 w-4" />
        Add reminder
      </button>
    </div>
  );
}
