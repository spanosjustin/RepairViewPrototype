// src/components/repair/RepairMatrix.tsx

"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { Column, MatrixRow, Cell, Tone } from "@/lib/matrix/types";
import type { RepairRow } from "@/lib/repair/types";
import { REPAIR_COLUMNS } from "@/lib/repair/constants";

type RepairMatrixProps = {
  rows: RepairRow[];
  columns?: Column[]; // allow override if you want to tweak in a caller
  emptyLabel?: string;
};

export default function RepairMatrix({
  rows,
  columns = REPAIR_COLUMNS,
  emptyLabel = "No repair rows",
}: RepairMatrixProps) {
  const matrixRows: MatrixRow[] = React.useMemo(() => {
    return rows.map((r, idx) => ({
      id: `repair-${idx}-${r.pn}-${r.sn}`,
      // Sticky first column label (choose something meaningful at a glance)
      label: r.pn || `#${r.pos}`,
      // Cells must align with columns by index
      cells: [
        cellNumber(r.pos),
        cellText(r.pn),
        cellText(r.sn),
        cellText(r.altSn ?? ""),
        cellNote(r.condition),
        cellNote(r.repair),
        cellBadge(r.status, toneForStatus(r.status)),
        cellBadge(r.verified ? "✓" : "—", r.verified ? "success" as Tone : "muted"),
      ],
    }));
  }, [rows]);

  return <MatrixGrid columns={columns} rows={matrixRows} emptyLabel={emptyLabel} />;
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

function cellBadge(value: string, tone?: Tone): Cell {
  return { kind: "badge", value, tone };
}

function toneForStatus(status: string | null | undefined): Tone {
  const s = (status ?? "").toLowerCase();
  if (["complete", "completed", "active", "ok"].some(k => s.includes(k))) return "success";
  if (["in progress", "working", "pending"].some(k => s.includes(k))) return "info";
  if (["removed", "warning"].some(k => s.includes(k))) return "warning";
  if (["failed", "error", "blocked"].some(k => s.includes(k))) return "danger";
  return "default";
}
