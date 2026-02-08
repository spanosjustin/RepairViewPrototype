// src/components/repair/ComponentList.tsx

"use client";

import * as React from "react";
import type { Component } from "@/lib/repair/types";
import type { Turbine } from "@/lib/storage/db/types";
import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ComponentInfoCard from "@/components/inventory/ComponentInfoCard";

type ComponentListProps = {
  components: Component[];
  turbines?: Turbine[];
  selected: Component | null;
  selectedTurbine?: Turbine | null;
  onSelect: (c: Component) => void;
  onSelectTurbine?: (t: Turbine) => void;
  viewMode?: "components" | "turbines";
  onViewModeChange?: (mode: "components" | "turbines") => void;
};

// Helper function to map repair component to inventory component format
function mapRepairComponentToInventory(component: Component) {
  // Get the latest event for intervals, or use defaults
  const latestEvent = component.events.length > 0 ? component.events[0] : null;
  
  return {
    componentName: component.name,
    componentType: component.type === "fuel" ? "Fuel Liner" : "Comb Liner",
    hours: latestEvent?.intervalFH || "###",
    starts: latestEvent?.intervalFS || "###", 
    trips: latestEvent?.intervalTrips || "###",
  };
}

export default function ComponentList({
  components,
  turbines = [],
  selected,
  selectedTurbine = null,
  onSelect,
  onSelectTurbine,
  viewMode = "components",
  onViewModeChange,
}: ComponentListProps) {
  // Split into groups by type (fuel / comb)
  const fuel = components.filter((c) => c.type === "fuel");
  const comb = components.filter((c) => c.type === "comb");

  const handleViewModeChange = (mode: "components" | "turbines") => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  return (
    <div className="border rounded-lg p-3 flex flex-col max-h-[500px]">
      <div className="flex-shrink-0 mb-2">
        <h2 className="font-semibold text-center mb-2">
          {viewMode === "components" ? "Components" : "Turbines"}
        </h2>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleViewModeChange("components")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "components"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Components
          </button>
          <button
            onClick={() => handleViewModeChange("turbines")}
            className={`px-3 py-1 text-sm rounded ${
              viewMode === "turbines"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Turbines
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {viewMode === "components" ? (
          <>
            <div className="mb-3">
              <h3 className="text-sm font-medium text-gray-600">Fuel Liners</h3>
              <ul className="space-y-1 mt-1">
                {fuel.map((c) => (
                  <li key={c.id}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onSelect(c)}
                        className={`flex-1 text-left px-2 py-1 rounded ${
                          selected?.id === c.id
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {c.name}
                      </button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className={`ml-2 p-1 rounded hover:bg-blue-100 ${
                              selected?.id === c.id ? "text-blue-600 hover:bg-blue-500" : "text-blue-200 hover:bg-blue-100"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Info size={18} />
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          className="
                            p-0
                            w-[95vw]
                            max-w-[1100px]
                            sm:max-w-[1100px]
                            md:max-w-[1100px]
                          "
                        >
                          <DialogHeader className="px-6 pt-6">
                            <DialogTitle>Component Details</DialogTitle>
                          </DialogHeader>

                          {/* scrollable body so tall cards don't overflow the screen */}
                          <div className="px-6 pb-6 max-h-[80vh] overflow-auto">
                            <div className="w-full">
                              <ComponentInfoCard item={mapRepairComponentToInventory(c)} />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600">Comb Liners</h3>
              <ul className="space-y-1 mt-1">
                {comb.map((c) => (
                  <li key={c.id}>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onSelect(c)}
                        className={`flex-1 text-left px-2 py-1 rounded ${
                          selected?.id === c.id
                            ? "bg-blue-600 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {c.name}
                      </button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button
                            className={`ml-2 p-1 rounded hover:bg-blue-100 ${
                              selected?.id === c.id ? "text-blue-600 hover:bg-blue-500" : "text-blue-200 hover:bg-blue-100"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Info size={18} />
                          </button>
                        </DialogTrigger>
                        <DialogContent
                          className="
                            p-0
                            w-[95vw]
                            max-w-[1100px]
                            sm:max-w-[1100px]
                            md:max-w-[1100px]
                          "
                        >
                          <DialogHeader className="px-6 pt-6">
                            <DialogTitle>Component Details</DialogTitle>
                          </DialogHeader>

                          {/* scrollable body so tall cards don't overflow the screen */}
                          <div className="px-6 pb-6 max-h-[80vh] overflow-auto">
                            <div className="w-full">
                              <ComponentInfoCard item={mapRepairComponentToInventory(c)} />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div>
            <ul className="space-y-1">
              {turbines.length > 0 ? (
                turbines.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={() => onSelectTurbine?.(t)}
                      className={`w-full text-left px-2 py-1 rounded ${
                        selectedTurbine?.id === t.id
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {t.unit ? `Unit ${t.unit} - ${t.name}` : t.name}
                    </button>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500 px-2 py-1">No turbines available</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
