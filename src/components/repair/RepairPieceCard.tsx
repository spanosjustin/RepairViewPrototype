"use client";

import * as React from "react";
import type { RepairRow } from "@/lib/repair/types";
import PieceInfoCard from "@/components/inventory/PieceInfoCard";

/**
 * Mirrors Inventory behavior by feeding PieceInfoCard an `item` prop.
 * We don't import the inventory item type; we just provide the shape it needs.
 */
export default function RepairPieceCard({ row }: { row: RepairRow }) {
  // Map RepairRow -> the minimal shape PieceInfoCard can render nicely
  const item = {
    id: `${row.pn ?? "pn"}-${row.sn ?? "sn"}`,
    name: row.pn || "Unknown PN",
    pn: row.pn ?? "",
    sn: row.sn ?? "",
    altSn: row.altSn ?? null,
    status: row.status ?? "Unknown",
    notes: row.repair || row.condition || "",
    condition: row.condition ?? "",
    repair: row.repair ?? "",
    verified: !!row.verified,
    pos: row.pos ?? null,
  };

  // IMPORTANT: prop name is `item`, just like Inventory uses.
  return <PieceInfoCard item={item as any} />;
}
