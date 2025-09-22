"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { Cell, MatrixRow, Tone } from "@/lib/matrix/types";
import type { InventoryItem } from "@/lib/inventory/types";
import { DEFAULT_INVENTORY_COLUMNS } from "@/lib/inventory/constants";
import PieceInfoCard from "@/components/inventory/PieceInfoCard";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const statusTone = (s: InventoryItem["status"]): Tone => {
  const v = s.toLowerCase();
  if (v === "ok") return "success";
  if (v === "monitor") return "warning";
  if (v === "replace soon") return "warning";
  if (v === "replace now") return "danger";
  if (v === "spare" || v === "unknown") return "muted";
  return "info";
};

const stateTone = (s: InventoryItem["state"]): Tone => {
  const v = s.toLowerCase();
  if (v === "in service") return "success";
  if (v === "standby") return "info";        // tweak to taste (could be "muted")
  if (v === "repair") return "warning";
  if (v === "out of service") return "danger";
  if (v === "on order") return "muted";
  return "info";
};

function toRows(items: InventoryItem[]): { rows: MatrixRow[]; idToItem: Map<string, InventoryItem> } {
    const idToItem = new Map<string, InventoryItem>();
    const rows = items.map((it, i) => {
      const id = it.id ?? `inv-${i}-${it.sn}`;
      idToItem.set(id, it);
  
      const cells: Cell[] = [
        { kind: "text",   value: it.sn },
        { kind: "text",   value: it.pn },
        { kind: "number", value: it.hours },
        { kind: "number", value: it.trips },
        { kind: "number", value: it.starts },
        { kind: "badge",  value: it.status, tone: statusTone(it.status) },
        { kind: "badge",  value: it.state,  tone: stateTone(it.state) },
        { kind: "text",   value: it.component },
      ];
      return { id, label: it.sn, cells };
    });
  
    return { rows, idToItem };
  }
  
  export default function InventoryMatrix({
    items,
    columns = DEFAULT_INVENTORY_COLUMNS,
    emptyLabel = "No inventory items",
  }: {
    items: InventoryItem[];
    columns?: typeof DEFAULT_INVENTORY_COLUMNS;
    emptyLabel?: string;
  }) {
    const { rows, idToItem } = React.useMemo(() => toRows(items), [items]);
    const [selected, setSelected] = React.useState<InventoryItem | null>(null);
  
    return (
      <>
        <MatrixGrid
          columns={columns}
          rows={rows}
          emptyLabel={emptyLabel}
          rowHoverClass="hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          pinnedHoverClass="group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
          onRowClick={(row) => setSelected(idToItem.get(row.id) ?? null)}
        />
  
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="sm:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Piece {selected?.sn}</DialogTitle>
            </DialogHeader>
            {selected && <PieceInfoCard item={selected} />}
          </DialogContent>
        </Dialog>
      </>
    );
  }