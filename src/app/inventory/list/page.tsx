// src/app/inventory/page.tsx
"use client";

import * as React from "react";
import InventoryMatrix from "@/components/inventory/InventoryMatrix";
import { MOCK_INVENTORY } from "@/lib/inventory/mock";

// shadcn/ui dialog (modal) to show the card
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ← import your card
import PieceInfoCard from "@/components/inventory/PieceInfoCard";
import ComponentInfoCard from "@/components/inventory/ComponentInfoCard";

type ViewMode = "list" | "tree";
type EntityKind = "components" | "pieces";

type ComponentRow = {
  componentType: string;
  componentName: string;
  hours: number | string;
  trips: number | string;
  starts: number | string;
  status: string;
  state: string;
  turbine: string;
  id?: string | number;
};

function buildComponentStatsFromMock(mock: any[]): ComponentRow[] {
  return (mock ?? []).map((it) => ({
    componentType: it.componentType ?? it.type ?? "—",
    componentName: it.componentName ?? it.name ?? it.title ?? "—",
    hours: it.hours ?? it.stats?.hours ?? "—",
    trips: it.trips ?? it.stats?.trips ?? "—",
    starts: it.starts ?? it.stats?.starts ?? "—",
    status: it.status ?? it.health ?? "—",
    state: it.state ?? it.condition ?? "—",
    turbine: it.turbine ?? it.turbineName ?? "—",
    id: it.id ?? it.sn ?? it.name ?? undefined,
  }));
}

export default function InventoryListPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [entityKind, setEntityKind] = React.useState<EntityKind>("pieces");

  const componentStats = React.useMemo(
    () => buildComponentStatsFromMock(MOCK_INVENTORY),
    []
  );

  // ---------- Piece Details modal state ----------
  const [pieceOpen, setPieceOpen] = React.useState(false);
  const [selectedPiece, setSelectedPiece] = React.useState<any | null>(null);

  const openPieceCard = React.useCallback((item: any) => {
    setSelectedPiece(item);
    setPieceOpen(true);
  }, []);

  // ---------- Component Details modal state ----------
  const [componentOpen, setComponentOpen] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState<any | null>(null);

  const openComponentCard = React.useCallback((item: any) => {
    setSelectedComponent(item);
    setComponentOpen(true);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-2xl bg-card p-4 border space-y-4">
        {/* Title bar */}
        <header className="relative flex items-center justify-center border-b border-border/60 pb-3">
          <h1 className="text-xl font-bold">Inventory</h1>

          {/* Right-side dropdowns */}
          <div className="absolute right-0 inset-y-0 flex items-center gap-2 pr-2">
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="h-9 w-[120px]" aria-label="View mode">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="tree">Tree</SelectItem>
              </SelectContent>
            </Select>

            <Select value={entityKind} onValueChange={(v) => setEntityKind(v as EntityKind)}>
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

        {/* Matrix */}
        {entityKind === "pieces" ? (
          <InventoryMatrix
            dataset="pieces"
            items={MOCK_INVENTORY}
            onSelectPiece={openPieceCard} // <-- wire click to open card
          />
        ) : (
          <InventoryMatrix
            dataset="components"
            componentStats={componentStats}
            onSelectComponent={openComponentCard}
          />
        )}
      </div>

      {/* Piece Details Modal */}
      <Dialog open={pieceOpen} onOpenChange={setPieceOpen}>
        <DialogContent
          className="
            p-0
            w-[95vw]
            max-w-[1100px]
            sm:max-w-[1100px]   /* override shadcn default */
            md:max-w-[1100px]
          "
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Piece Details</DialogTitle>
          </DialogHeader>

          {/* scrollable body so tall cards don't overflow the screen */}
          <div className="px-6 pb-6 max-h-[80vh] overflow-auto">
            {selectedPiece ? (
              <div className="w-full">
                <PieceInfoCard item={selectedPiece} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No piece selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Component Details Modal */}
      <Dialog open={componentOpen} onOpenChange={setComponentOpen}>
        <DialogContent
          className="
            p-0
            w-[95vw]
            max-w-[1100px]
            sm:max-w-[1100px]   /* override shadcn default */
            md:max-w-[1100px]
          "
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Component Details</DialogTitle>
          </DialogHeader>

          {/* scrollable body so tall cards don't overflow the screen */}
          <div className="px-6 pb-6 max-h-[80vh] overflow-auto">
            {selectedComponent ? (
              <div className="w-full">
                <ComponentInfoCard item={selectedComponent} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No component selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
