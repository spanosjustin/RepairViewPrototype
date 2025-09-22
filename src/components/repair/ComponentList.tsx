// src/components/repair/ComponentList.tsx

"use client";

import * as React from "react";
import type { Component } from "@/lib/repair/types";

type ComponentListProps = {
  components: Component[];
  selected: Component | null;
  onSelect: (c: Component) => void;
};

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
              <button
                onClick={() => onSelect(c)}
                className={`w-full text-left px-2 py-1 rounded ${
                  selected?.id === c.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-600">Comb Liners</h3>
        <ul className="space-y-1 mt-1">
          {comb.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => onSelect(c)}
                className={`w-full text-left px-2 py-1 rounded ${
                  selected?.id === c.id
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
