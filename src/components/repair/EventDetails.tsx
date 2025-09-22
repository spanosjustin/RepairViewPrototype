// src/components/repair/EventDetails.tsx

"use client";

import * as React from "react";
import type { Event } from "@/lib/repair/types";

type EventDetailsProps = {
  event: Event;
};

export default function EventDetails({ event }: EventDetailsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Current Event */}
      <section className="border rounded-lg p-4">
        <h2 className="text-center font-semibold mb-3">Event Details</h2>

        <div className="grid grid-cols-2 gap-y-2 text-sm">
          <Label>Event</Label>
          <Value>{event.name}</Value>

          <Label>Date</Label>
          <Value>{formatDate(event.date)}</Value>

          <Label>Interval FH</Label>
          <Value>{num(event.intervalFH)}</Value>

          <Label>Interval FS</Label>
          <Value>{num(event.intervalFS)}</Value>

          <Label>Interval Trips</Label>
          <Value>{num(event.intervalTrips)}</Value>
        </div>
      </section>

      {/* Pre-Repair (optional) */}
      {event.preRepair ? (
        <section className="border rounded-lg p-4">
          <h2 className="text-center font-semibold mb-3">Pre-Repair Event</h2>

          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <Label>Date</Label>
            <Value>{formatDate(event.preRepair.date)}</Value>

            <Label>Interval FH</Label>
            <Value>{num(event.preRepair.intervalFH)}</Value>

            <Label>Interval FS</Label>
            <Value>{num(event.preRepair.intervalFS)}</Value>

            <Label>Interval Trips</Label>
            <Value>{num(event.preRepair.intervalTrips)}</Value>
          </div>
        </section>
      ) : (
        <section className="border rounded-lg p-4">
          <h2 className="text-center font-semibold mb-3">Pre-Repair Event</h2>
          <p className="text-sm text-gray-500">No pre-repair data.</p>
        </section>
      )}
    </div>
  );
}

/** tiny helpers */
function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-gray-600">{children}</div>;
}
function Value({ children }: { children: React.ReactNode }) {
  return <div className="font-medium">{children}</div>;
}
function num(n: number | null | undefined) {
  if (typeof n !== "number" || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
