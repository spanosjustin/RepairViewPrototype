// src/components/repair/PreEventCard.tsx
"use client";

import * as React from "react";
import type { Event } from "@/lib/repair/types";

export default function PreEventCard({ event }: { event: Event | null }) {
  const pre = event?.preRepair;

  return (
    <div className="border rounded-lg p-4">
      <h2 className="text-center font-semibold mb-3">Pre-Event</h2>

      {!event ? (
        <p className="text-sm text-gray-500">No event selected</p>
      ) : !pre ? (
        <p className="text-sm text-gray-500">No pre-event data</p>
      ) : (
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <Label>Date</Label>
          <Value>{formatDate(pre.date)}</Value>

          <Label>Interval FH</Label>
          <Value>{num(pre.intervalFH)}</Value>

          <Label>Interval FS</Label>
          <Value>{num(pre.intervalFS)}</Value>

          <Label>Interval Trips</Label>
          <Value>{num(pre.intervalTrips)}</Value>
        </div>
      )}
    </div>
  );
}

/* helpers */
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-gray-600">{children}</div>;
}
function Value({ children }: { children: React.ReactNode }) {
  return <div className="font-medium">{children}</div>;
}
function num(n: number | null | undefined) {
  return typeof n === "number" && !Number.isNaN(n)
    ? new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n)
    : "—";
}
function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
