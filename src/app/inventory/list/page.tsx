// src/app/inventory/page.tsx
"use client";

import * as React from "react";
import InventoryMatrix from "@/components/inventory/InventoryMatrix";
import { MOCK_INVENTORY } from "@/lib/inventory/mock";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewMode = "list" | "tree";
type EntityKind = "components" | "pieces";

export default function InventoryListPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [entityKind, setEntityKind] = React.useState<EntityKind>("components");

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-2xl bg-card p-4 border space-y-4">
        {/* Title bar */}
        <header className="relative flex items-center justify-center border-b border-border/60 pb-3">
          {/* Centered title */}
          <h1 className="text-xl font-bold">Inventory</h1>

          {/* Right-side dropdowns */}
          <div className="absolute right-0 inset-y-0 flex items-center gap-2 pr-2">
            {/* View mode */}
            <Select
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
            >
              <SelectTrigger className="h-9 w-[120px]" aria-label="View mode">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="tree">Tree</SelectItem>
              </SelectContent>
            </Select>

            {/* Entity kind */}
            <Select
              value={entityKind}
              onValueChange={(v) => setEntityKind(v as EntityKind)}
            >
              <SelectTrigger className="h-9 w-[140px]" aria-label="Entity">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="pieces">Pieces</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Inventory grid */}
        <InventoryMatrix items={MOCK_INVENTORY} />
      </div>
    </div>
  );
}
