// src/components/repair/RepairLayout.tsx

"use client";

import * as React from "react";
import type { Component as RepairComponent, Event as RepairEvent, RepairRow } from "@/lib/repair/types";

import { MOCK_COMPONENTS, MOCK_REPAIR_ROWS } from "@/lib/repair/mock";

import ComponentList from "./ComponentList";
import EventList from "./EventList";
import PreEventCard from "./PreEventDetails";
import RepairMatrix from "./RepairMatrix";

type RepairLayoutProps = {
  components?: RepairComponent[];
  repairRows?: RepairRow[];
};

export default function RepairLayout({
  components = MOCK_COMPONENTS,
  repairRows = MOCK_REPAIR_ROWS,
}: RepairLayoutProps) {
  const [selectedComponent, setSelectedComponent] = React.useState<RepairComponent | null>(
    components.length > 0 ? components[0] : null
  );
  const [selectedEvent, setSelectedEvent] = React.useState<RepairEvent | null>(
    components.length > 0 && components[0].events.length > 0 ? components[0].events[0] : null
  );

  // When the component changes, default to its first event (or null)
  React.useEffect(() => {
    if (selectedComponent && selectedComponent.events.length > 0) {
      setSelectedEvent(selectedComponent.events[0]);
    } else {
      setSelectedEvent(null);
    }
  }, [selectedComponent]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* --- Top Row: Components | Events | Pre-Event --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <ComponentList
          components={components}
          selected={selectedComponent}
          onSelect={setSelectedComponent}
        />

        {selectedComponent ? (
          <EventList
            events={selectedComponent.events}
            selected={selectedEvent}
            onSelect={setSelectedEvent}
          />
        ) : (
          <div className="border rounded-lg p-3 text-sm text-gray-500">No component selected</div>
        )}

        <PreEventCard event={selectedEvent} />
      </div>

      {/* --- Bottom Row: Repair Matrix --- */}
      <div>
        <RepairMatrix rows={repairRows} />
      </div>
    </div>
  );
}
