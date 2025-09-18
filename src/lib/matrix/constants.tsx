import type { Column, FilterState, Tone } from "./types";

/**
 * --- Filter defaults ---------------------------------------------------------
 */

export const DEFAULT_FILTER_STATE: FilterState = {
  powerPlantId: null,
  turbineId: null,
  tag: "all",
};

export const FILTER_TAGS = ["all", "outages"] as const;

/**
 * --- Operator symbols (UI-only) ---------------------------------------------
 * Numeric operators are used by stat rows; date operators include "between".
 */

export const OPERATORS = ["=", "≠", ">", "≥", "<", "≤"] as const;
export type Operator = (typeof OPERATORS)[number];

export const DATE_OPERATORS = ["=", "≠", ">", "≥", "<", "≤", "between"] as const;
export type DateOperator = (typeof DATE_OPERATORS)[number];

/**
 * Optional human-friendly labels if you need tooltips or aria labels.
 */
export const OPERATOR_LABEL: Record<Operator | DateOperator, string> = {
  "=": "equals",
  "≠": "not equal",
  ">": "greater than",
  "≥": "greater than or equal",
  "<": "less than",
  "≤": "less than or equal",
  between: "between (inclusive)",
};

/**
 * --- Color tokens (UI-only) --------------------------------------------------
 * Keep these as neutral design tokens so components can stay presentational.
 * You can map them to Tailwind classes, CSS variables, or hex values.
 */

export const COLOR_TOKENS = {
  surface: {
    grayHeader: "token-surface-gray", // top banner background
    aquaCard: "token-surface-aqua",   // turbine card shell
    matrix: "token-surface-purple",   // matrix background
  },
  text: {
    normal: "token-text-default",
    subtle: "token-text-muted",
    inverse: "token-text-on-accent",
  },
  border: {
    subtle: "token-border-subtle",
    accent: "token-border-accent",
  },
} as const;

/**
 * Optional mapping from tone → badge class (if you use Tailwind/CSS classes).
 * Keep this strictly UI-facing; no runtime branching logic here.
 */
export const TONE_BADGE_CLASS: Record<Tone, string> = {
  default: "badge-default",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
  muted: "badge-muted",
};

/**
 * --- Column presets (MatrixGrid consumers) -----------------------------------
 * These are UI presets only. They define column ids, titles, widths, and hints.
 * Rows must provide `cells.length === columns.length`.
 */

export const DEFAULT_STATS_COLUMNS: Column[] = [
  {
    id: "metric",
    title: "Metric",
    kind: "text",
    minWidth: 140,
    align: "left",
    sortable: true,
    pinned: "left",
  },
  {
    id: "target",
    title: "Target",
    kind: "number",
    width: 112,
    align: "right",
    sortable: true,
  },
  {
    id: "interval",
    title: "Interval",
    kind: "number",
    width: 112,
    align: "right",
    sortable: true,
  },
  {
    id: "actual",
    title: "Actual",
    kind: "number",
    width: 112,
    align: "right",
    sortable: true,
  },
  {
    id: "remaining",
    title: "Remaining",
    kind: "number",
    width: 128,
    align: "right",
    sortable: true,
  },
  {
    id: "note",
    title: "Note",
    kind: "note",
    minWidth: 160,
    align: "left",
    sortable: false,
  },
];

export const DEFAULT_PIECES_COLUMNS: Column[] = [
  {
    id: "piece",
    title: "Piece",
    kind: "text",
    minWidth: 160,
    align: "left",
    sortable: true,
    pinned: "left",
  },
  {
    id: "position",
    title: "Position",
    kind: "badge",
    width: 120,
    align: "center",
    sortable: true,
  },
  {
    id: "condition",
    title: "Condition",
    kind: "badge",
    width: 120,
    align: "center",
    sortable: true,
  },
  {
    id: "setIn",
    title: "Set In",
    kind: "text",
    width: 120,
    align: "center",
    sortable: true,
  },
  {
    id: "setOut",
    title: "Set Out",
    kind: "text",
    width: 120,
    align: "center",
    sortable: true,
  },
  {
    id: "notes",
    title: "Notes",
    kind: "note",
    minWidth: 200,
    align: "left",
    sortable: false,
  },
];

/**
 * --- Misc UI sizing presets (optional; tweak as needed) ----------------------
 * Central place for magic numbers so components stay declarative.
 */

export const GRID_SIZING = {
  headerHeight: 36,
  rowHeight: 32,
  maxBodyHeight: 260, // scroll area for each matrix region
} as const;
