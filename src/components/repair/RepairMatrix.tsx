// src/components/repair/RepairMatrix.tsx
"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { Column, MatrixRow, Cell, Tone } from "@/lib/matrix/types";
import type { RepairRow } from "@/lib/repair/types";
import { REPAIR_COLUMNS } from "@/lib/repair/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RepairPieceCard from "./RepairPieceCard";

type RepairMatrixProps = {
  rows: RepairRow[];
  columns?: Column[];
  emptyLabel?: string;
};

export default function RepairMatrix({
  rows,
  columns = REPAIR_COLUMNS,
  emptyLabel = "No repair rows",
}: RepairMatrixProps) {
  // dialog state
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<RepairRow | null>(null);

  // Derive columns: show BOTH condition + repair note columns
  const derivedColumns = React.useMemo<Column[]>(() => {
    const keepIds = new Set(["pn", "sn", "condition", "repair", "status"]);
    return columns.filter((c) => keepIds.has(c.id));
  }, [columns]);

  const matrixRows: MatrixRow[] = React.useMemo(() => {
    return rows.map((r, idx) => ({
      id: `repair-${idx}-${r.pn}-${r.sn}`,
      label: `#${r.pos}`,
      cells: [
        cellText(r.pn),                    // pn
        cellText(r.sn),                    // sn
        cellNote(r.condition),             // condition
        cellNote(r.repair),                // repair
        cellBadge(r.status, toneForStatus(r.status)), // status
      ],
    }));
  }, [rows]);

  const onRowClick = (row: MatrixRow) => {
    const found =
      rows.find((r) => `#${r.pos}` === row.label) ??
      rows.find((r) => r.pn === row.label || r.sn === row.label) ??
      null;
    setSelected(found);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">Repair Matrix</h3>

      <MatrixGrid
        columns={derivedColumns}
        rows={matrixRows}
        emptyLabel={emptyLabel}
        onRowClick={onRowClick}
        rowClassName="hover:bg-gray-100 cursor-pointer"
      />

      {/* Row dialog -> Piece card */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[900px] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>Piece Details</DialogTitle>
          </DialogHeader>
          <div className="w-full">
            {selected ? (
              <RepairPieceCard row={selected} />
            ) : (
              <div className="text-sm text-gray-500">No selection</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ----------------- tiny cell builders ----------------- */
function cellText(value: string | number | null | undefined): Cell {
  return { kind: "text", value: value ?? "" };
}
function cellNumber(value: number | null | undefined): Cell {
  return { kind: "number", value: typeof value === "number" ? value : null };
}
function cellNote(value: string | null | undefined): Cell {
  return { kind: "note", value: (value ?? "").trim() };
}
function cellBadge(value: string, tone?: Tone | undefined): Cell {
  return { kind: "badge", value, tone };
}
function toneForStatus(status: string | null | undefined): Tone {
  const s = (status ?? "").toLowerCase();
  if (["complete", "completed", "active", "ok"].some((k) => s.includes(k))) return "success";
  if (["in progress", "working", "pending"].some((k) => s.includes(k))) return "info";
  if (["removed", "warning"].some((k) => s.includes(k))) return "warning";
  if (["failed", "error", "blocked"].some((k) => s.includes(k))) return "danger";
  return "default";
}
