/**
 * Shared UI-only types for the Matrix page.
 * Keep these dumb and stable so presentational components stay simple.
 */

export type ID = string;

/** Visual tone for badges/cells (purely UI) */
export type Tone = "default" | "info" | "success" | "warning" | "danger" | "muted";

/** Text alignment inside a column/cell */
export type Align = "left" | "center" | "right";

/** How a cell should be rendered by MatrixCell */
export type CellKind = "text" | "number" | "badge" | "note"; // "note" = text with tooltip placeholder

/** Column metadata for MatrixGrid */
export type Column = {
  /** Stable id (used for sorting/pinning) */
  id: string;
  /** Header label shown in the grid */
  title: string;
  /** Optional default render hint for this column */
  kind?: CellKind;
  /** Width in pixels (optional; Grid can fall back to auto) */
  width?: number;
  /** Optional minimum width (px) */
  minWidth?: number;
  /** Left/center/right text alignment */
  align?: Align;
  /** Whether the column can be sorted (UI-only) */
  sortable?: boolean;
  /** Whether the column is currently pinned (UI-only) */
  pinned?: PinSide | null;
};

/** Union value for any cell */
export type CellValue = string | number | null;

/** Single cell payload consumed by MatrixCell */
export type Cell = {
  kind: CellKind;
  /** Primary content; for "badge" this is the badge text */
  value: CellValue;
  /** Optional tooltip/hover text (placeholder only; no logic) */
  note?: string | null;
  /** Optional status tone (e.g., success/warning) */
  tone?: Tone;
};

/** Generic row shape used by both stats and pieces matrices */
export type MatrixRow = {
  /** Stable row id */
  id: ID;
  /** Row label shown in the sticky first column (e.g., "Hours", "Rotor") */
  label: string;
  /**
   * Cells must match `columns.length` by index.
   * The grid will render cells[i] under columns[i].
   */
  cells: Cell[];
};

/** Specializations for clarity (identical shape, separate names) */
export type StatRow = MatrixRow;
export type PieceRow = MatrixRow;

/** Turbine card data (front-end only, from mocks) */
export type Turbine = {
  id: ID;
  /** Display name shown on the aqua card header */
  name: string;
  /** Optional unit/numbering label, if you use it */
  unit?: string | number | null;
  /** Upper matrix rows for stats */
  stats: StatRow[];
  /** Lower matrix rows for pieces/components */
  pieces: PieceRow[];
};

/** Simple UI filter state used by the top controls (no networking) */
export type FilterState = {
  powerPlantId: string | null;
  turbineId: string | null;
  tag: "all" | "outages" | null;
};

/** Optional sort/pin helpers for the demo hook */
export type SortDir = "asc" | "desc";
export type SortState = { columnId: string; dir: SortDir } | null;

export type PinSide = "left" | "right";
export type PinState = Record<string, PinSide>;

/** Convenience props contract for StatsMatrix/PiecesMatrix */
export type MatrixProps<Row extends MatrixRow = MatrixRow> = {
  columns: Column[];
  rows: Row[];
  /** Message shown by the caller if rows.length === 0 */
  emptyLabel?: string;
};
