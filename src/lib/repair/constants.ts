// src/lib/repair/constants.ts
import type { Column } from "@/lib/matrix/types";

/**
 * Default columns for the Repair Matrix (bottom table).
 * Pos | PN | SN | Alt SN | Condition | Repair | Status | V
 * Matches Column shape in src/lib/matrix/types.ts
 */
export const REPAIR_COLUMNS: Column[] = [
  { id: "pos",       title: "Pos",        kind: "number", width: 56,  align: "center", sortable: true },
  { id: "pn",        title: "PN",         kind: "text",   minWidth: 120, align: "left",  sortable: true },
  { id: "sn",        title: "SN",         kind: "text",   minWidth: 120, align: "left",  sortable: true },
  { id: "altSn",     title: "Alt SN",     kind: "text",   minWidth: 120, align: "left",  sortable: true },
  // Using "note" kind for long text with optional tooltip
  { id: "condition", title: "Condition",  kind: "note",   minWidth: 220, align: "left" },
  { id: "repair",    title: "Repair",     kind: "note",   minWidth: 220, align: "left" },
  // Status as a badge-like cell
  { id: "status",    title: "Status",     kind: "badge",  minWidth: 120, align: "center", sortable: true },
  { id: "verified",  title: "V",          kind: "badge",  width: 44,  align: "center" },
];
