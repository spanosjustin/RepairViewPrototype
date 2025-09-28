"use client";

import * as React from "react";
import type { PieceRow } from "@/lib/matrix/types";
import PieceInfoCard from "@/components/inventory/PieceInfoCard";

/**
 * Transforms matrix piece data into the format expected by PieceInfoCard.
 * Similar to RepairPieceCard but for matrix pieces.
 */
export default function MatrixPieceCard({ 
  piece, 
  turbineName 
}: { 
  piece: PieceRow; 
  turbineName: string; 
}) {
  // Extract data from the piece cells
  // Column order from mock data: piece | position | condition | setIn | setOut | notes
  const pieceName = piece.label; // "Liner Caps", "S1N", etc.
  const position = piece.cells[1]?.value || ""; // "Comb", "S1N", etc.
  const condition = piece.cells[2]?.value || ""; // "OK", "Monitor", etc.
  const setIn = piece.cells[3]?.value || ""; // "2024-11-03"
  const setOut = piece.cells[4]?.value || ""; // "-" or "2025-02-18"
  const notes = piece.cells[5]?.value || ""; // "Minor scoring", etc.

  // Transform to the format expected by PieceInfoCard
  const item = {
    id: piece.id,
    name: pieceName,
    pn: pieceName, // Use piece name as part number for now
    sn: "", // Matrix pieces don't have serial numbers in current data
    altSn: null,
    status: condition,
    component: pieceName,
    turbine: turbineName,
    position: position,
    state: setOut === "-" ? "Installed" : "Removed",
    hours: null,
    starts: null,
    trips: null,
    notes: notes ? [notes] : null,
    repairEvents: null, // Matrix pieces don't have repair events in current data
  };

  return <PieceInfoCard item={item as any} />;
}
