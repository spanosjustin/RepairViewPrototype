// src/components/repair/RepairLayout.tsx

"use client";

import * as React from "react";
import type { Component, Event, RepairRow } from "@/lib/repair/types";

import { MOCK_COMPONENTS, MOCK_REPAIR_ROWS } from "@/lib/repair/mock";

// (Later you’ll import these real components instead of divs)
import ComponentList from "./ComponentList";
import EventList from "./EventList";
import EventDetails from "./EventDetails";
import RepairMatrix from "./RepairMatrix";

type RepairLayoutProps = {
  components?: Component[];
  repairRows?: RepairRow[];
};

export default function RepairLayout({
  components = MOCK_COMPONENTS,
  repairRows = MOCK_REPAIR_ROWS,
}: RepairLayoutProps) {
  // Track selected component + event
  const [selectedComponent, setSelectedComponent] = React.useState<Component | null>(
    components.length > 0 ? components[0] : null
  );
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(
    selectedComponent?.events[0] ?? null
  );

  // When component changes, reset selected event
  React.useEffect(() => {
    if (selectedComponent) {
      setSelectedEvent(selectedComponent.events[0] ?? null);
    }
  }, [selectedComponent]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* --- Top Row: Components + Events --- */}
      <div className="grid grid-cols-2 gap-4">
        <ComponentList
          components={components}
          selected={selectedComponent}
          onSelect={setSelectedComponent}
        />
        {selectedComponent && (
          <EventList
            events={selectedComponent.events}
            selected={selectedEvent}
            onSelect={setSelectedEvent}
          />
        )}
      </div>

      {/* --- Middle Row: Event Details --- */}
      <div>
        {selectedEvent ? (
          <EventDetails event={selectedEvent} />
        ) : (
          <div className="p-4 border rounded text-sm text-gray-500">
            No event selected
          </div>
        )}
      </div>

      {/* --- Bottom Row: Repair Matrix --- */}
      <div>
        <RepairMatrix rows={repairRows} />
      </div>
    </div>
  );
}
