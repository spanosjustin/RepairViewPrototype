// src/components/repair/RepairMatrix.tsx

"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { Column, MatrixRow, Cell, Tone } from "@/lib/matrix/types";
import type { RepairRow } from "@/lib/repair/types";
import { REPAIR_COLUMNS } from "@/lib/repair/constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import RepairPieceCard from "./RepairPieceCard";

type NoteView = "condition" | "repair";

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
  const [noteView, setNoteView] = React.useState<NoteView>("condition");

  // dialog state
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<RepairRow | null>(null);

  // Derive columns: show only the chosen note column
  const derivedColumns = React.useMemo<Column[]>(() => {
    const keepIds = new Set(["pos", "pn", "sn", "altSn", noteView, "status", "verified"]);
    return columns.filter((c) => keepIds.has(c.id));
  }, [columns, noteView]);

  const matrixRows: MatrixRow[] = React.useMemo(() => {
    return rows.map((r, idx) => ({
      id: `repair-${idx}-${r.pn}-${r.sn}`,
      label: `#${r.pos}`,
      cells: [
        cellNumber(r.pos),                                      // pos
        cellText(r.pn),                                         // pn
        cellText(r.sn),                                         // sn
        cellText(r.altSn ?? ""),                                // altSn
        cellNote(noteView === "condition" ? r.condition : r.repair), // dynamic note
        cellBadge(r.status, toneForStatus(r.status)),           // status
        cellBadge(r.verified ? "✓" : "—", r.verified ? "success" : "muted"), // verified
      ],
    }));
  }, [rows, noteView]);

  const onRowClick = (row: MatrixRow) => {
    // find original RepairRow by matrix row id (we encoded index/pn/sn) or fallback by pos/pn/sn
    const found =
      rows.find((r) => `#${r.pos}` === row.label) ??
      rows.find((r) => r.pn === row.label || r.sn === row.label) ??
      null;
    setSelected(found);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* tiny toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Repair Matrix</h3>
        <NoteSwitch value={noteView} onChange={setNoteView} />
      </div>

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

/* ---------- small toolbar switch ---------- */
function NoteSwitch({
  value,
  onChange,
}: {
  value: NoteView;
  onChange: (v: NoteView) => void;
}) {
  const base = "px-2 py-1 text-xs rounded-full border transition select-none";
  const on = "bg-blue-600 text-white border-transparent";
  const off = "bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100";
  return (
    <div className="flex items-center gap-2">
      <button className={`${base} ${value === "condition" ? on : off}`} onClick={() => onChange("condition")}>
        Condition
      </button>
      <button className={`${base} ${value === "repair" ? on : off}`} onClick={() => onChange("repair")}>
        Repair
      </button>
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
  return { kind: "note", value: value ?? "" };
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
