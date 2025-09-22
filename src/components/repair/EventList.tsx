// src/components/repair/EventList.tsx

"use client";

import * as React from "react";
import type { Event } from "@/lib/repair/types";

type EventListProps = {
  events: Event[];
  selected: Event | null;
  onSelect: (e: Event) => void;
};

export default function EventList({ events, selected, onSelect }: EventListProps) {
  if (!events?.length) {
    return (
      <div className="border rounded-lg p-3 text-sm text-gray-500">
        No events for this component
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-3">
      <h2 className="font-semibold mb-2 text-center">Events</h2>

      <ul className="space-y-2">
        {events.map((evt) => {
          const isSelected = selected?.id === evt.id;
          return (
            <li key={evt.id}>
              <button
                onClick={() => onSelect(evt)}
                className={`w-full rounded px-3 py-2 text-left transition
                  ${isSelected ? "bg-blue-600 text-white" : "hover:bg-gray-100"}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{evt.name}</span>
                  <span className={`text-xs ${isSelected ? "opacity-90" : "text-gray-500"}`}>
                    {formatDate(evt.date)}
                  </span>
                </div>

                <div className={`mt-1 text-xs ${isSelected ? "opacity-95" : "text-gray-600"}`}>
                  FH: {evt.intervalFH} • FS: {evt.intervalFS} • Trips: {evt.intervalTrips}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}
