// src/components/repair/ComponentList.tsx

"use client";

import * as React from "react";
import type { Component } from "@/lib/repair/types";
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
  selected: Component | null;
  onSelect: (c: Component) => void;
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
  selected,
  onSelect,
}: ComponentListProps) {
  // Split into groups by type (fuel / comb)
  const fuel = components.filter((c) => c.type === "fuel");
  const comb = components.filter((c) => c.type === "comb");

  return (
    <div className="border rounded-lg p-3">
      <h2 className="font-semibold mb-2 text-center">Components</h2>

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
    </div>
  );
}
