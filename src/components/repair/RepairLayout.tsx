// src/components/repair/RepairLayout.tsx

"use client";

import * as React from "react";
import type { Component as RepairComponent, Event as RepairEvent, RepairRow } from "@/lib/repair/types";
import type { Turbine } from "@/lib/storage/db/types";
import { turbineStorage } from "@/lib/storage/db/storage";

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
  const [turbines, setTurbines] = React.useState<Turbine[]>([]);
  const [selectedTurbine, setSelectedTurbine] = React.useState<Turbine | null>(null);
  const [viewMode, setViewMode] = React.useState<"components" | "turbines">("components");

  // Load turbines from database
  React.useEffect(() => {
    const loadTurbines = async () => {
      try {
        const allTurbines = await turbineStorage.getAll();
        setTurbines(allTurbines);
      } catch (error) {
        console.error('Error loading turbines:', error);
        setTurbines([]);
      }
    };
    
    loadTurbines();
  }, []);

  // When the component changes, default to its first event (or null)
  React.useEffect(() => {
    if (selectedComponent && selectedComponent.events.length > 0) {
      setSelectedEvent(selectedComponent.events[0]);
    } else {
      setSelectedEvent(null);
    }
  }, [selectedComponent]);

  // When switching view modes, clear selections if needed
  React.useEffect(() => {
    if (viewMode === "turbines") {
      setSelectedComponent(null);
      setSelectedEvent(null);
    } else {
      setSelectedTurbine(null);
    }
  }, [viewMode]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* --- Top Row: Components | Events | Pre-Event --- */}
      <div className="grid gap-4 md:grid-cols-3" style={{ gridTemplateRows: '1fr' }}>
        <div className="min-h-0">
          <ComponentList
            components={components}
            turbines={turbines}
            selected={selectedComponent}
            selectedTurbine={selectedTurbine}
            onSelect={setSelectedComponent}
            onSelectTurbine={setSelectedTurbine}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </div>

        {viewMode === "components" && selectedComponent ? (
          <EventList
            events={selectedComponent.events}
            selected={selectedEvent}
            onSelect={setSelectedEvent}
            componentName={selectedComponent.name}
          />
        ) : viewMode === "turbines" && selectedTurbine ? (
          <div className="border rounded-lg p-3">
            <h3 className="font-semibold mb-2">Turbine: {selectedTurbine.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              {selectedTurbine.unit && <div>Unit: {selectedTurbine.unit}</div>}
              <div>Hours: {selectedTurbine.hours}</div>
              <div>Trips: {selectedTurbine.trips}</div>
              <div>Starts: {selectedTurbine.starts}</div>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-3 text-sm text-gray-500">
            {viewMode === "components" ? "No component selected" : "No turbine selected"}
          </div>
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
