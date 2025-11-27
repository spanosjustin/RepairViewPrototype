// src/components/inventory/InventoryMatrix.tsx
"use client";

import * as React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getTone, getColorName, getBadgeClasses, getRowStripeClass, getCellBackgroundClasses } from "@/lib/settings/colorMapper";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

type PieceItem = any;

type ComponentRow = {
  componentType: string;
  componentName: string;
  hours: number | string;
  trips: number | string;
  starts: number | string;
  status: string;
  state: string;
  turbine: string;
  id?: string | number; // if you have ids, great
};

type SortDirection = "asc" | "desc" | null;
type SortableColumn = keyof ComponentRow;
type SortablePieceColumn = "pn" | "piece" | "sn" | "hours" | "trips" | "starts" | "status" | "state" | "turbine" | "component" | "componentType";

type InventoryMatrixProps =
  | {
      dataset: "pieces";
      items: PieceItem[];
      onSelectPiece?: (item: PieceItem) => void;
      sortColumn?: SortablePieceColumn;
      sortDirection?: SortDirection;
      onSort?: (column: SortablePieceColumn) => void;
    }
  | {
      dataset: "components";
      componentStats: ComponentRow[];
      onSelectComponent?: (row: ComponentRow) => void;
      sortColumn?: SortableColumn;
      sortDirection?: SortDirection;
      onSort?: (column: SortableColumn) => void;
    };

/* -------------------- Status/State color logic -------------------- */
// Colors are now loaded from IndexedDB and applied dynamically

const Badge = ({ 
  text, 
  tone, 
  colorName 
}: { 
  text: React.ReactNode; 
  tone: "ok" | "warn" | "bad" | "info" | "neutral";
  colorName?: string;
}) => (
  <span className={getBadgeClasses(tone, colorName)}>{text}</span>
);

/* -------------------- First-cell helper: pseudo dot + spacing -------------------- */
const firstCellBase =
  // give space for the green left stripe and our dot
  "py-2 pr-3 relative pl-6 " +
  // dataset dot (pseudo-element so it can't steal clicks)
  "before:content-[''] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 " +
  "before:h-2.5 before:w-2.5 before:rounded-full before:pointer-events-none";

/* -------------------- Sortable Header Component -------------------- */
function SortableHeader<T extends string = SortableColumn>({
  column,
  label,
  sortColumn,
  sortDirection,
  onSort,
  width,
}: {
  column: T;
  label: string;
  sortColumn?: T;
  sortDirection?: SortDirection;
  onSort?: (column: T) => void;
  width?: string;
}) {
  const isActive = sortColumn === column;
  const canSort = !!onSort;

  const handleClick = () => {
    if (canSort) {
      onSort(column);
    }
  };

  return (
    <th
      className={cx(
        "py-2 pr-3",
        canSort && "cursor-pointer hover:bg-muted/50 select-none",
        isActive && "bg-muted/30"
      )}
      style={width ? { width } : undefined}
      onClick={handleClick}
    >
      <div className="flex items-center gap-1.5">
        <span>{label}</span>
        {canSort && (
          <div className="flex flex-col items-center">
            <ArrowUp
              className={cx(
                "h-3 w-3",
                isActive && sortDirection === "asc"
                  ? "text-foreground"
                  : "text-muted-foreground opacity-40"
              )}
            />
            <ArrowDown
              className={cx(
                "h-3 w-3 -mt-1",
                isActive && sortDirection === "desc"
                  ? "text-foreground"
                  : "text-muted-foreground opacity-40"
              )}
            />
          </div>
        )}
      </div>
    </th>
  );
}

/* -------------------- Components View -------------------- */
function ComponentsTable({
  rows,
  onSelect,
  colorSettings = [],
  sortColumn,
  sortDirection,
  onSort,
}: {
  rows: ComponentRow[];
  onSelect?: (row: ComponentRow) => void;
  colorSettings?: any[];
  sortColumn?: SortableColumn;
  sortDirection?: SortDirection;
  onSort?: (column: SortableColumn) => void;
}) {
  // dataset color vars for the pseudo dot
  const style = {
    // @ts-ignore custom CSS vars
    "--dot-color": "#8b5cf6", // violet-500
    "--dot-ring": "rgba(139, 92, 246, 0.35)",
  } as React.CSSProperties;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm table-fixed" style={style}>
        <thead className="text-left">
          <tr className="border-b">
            <SortableHeader
              column="componentType"
              label="Component Type"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="12%"
            />
            <SortableHeader
              column="componentName"
              label="Component Name"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="18%"
            />
            <SortableHeader
              column="hours"
              label="Hours"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="10%"
            />
            <SortableHeader
              column="trips"
              label="Trips"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="10%"
            />
            <SortableHeader
              column="starts"
              label="Starts"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="10%"
            />
            <SortableHeader
              column="status"
              label="Status"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="12%"
            />
            <SortableHeader
              column="state"
              label="State"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="12%"
            />
            <SortableHeader
              column="turbine"
              label="Turbine"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="16%"
            />
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-6 text-muted-foreground">
                No component stats.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const sTone = getTone(r.status || "", 'status', colorSettings);
              const stTone = getTone(r.state || "", 'state', colorSettings);
              const statusColor = getColorName(r.status || "", 'status', colorSettings);
              const stateColor = getColorName(r.state || "", 'state', colorSettings);
              return (
                <tr
                  key={r.id ?? i}
                  className={cx(
                    "border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                    getRowStripeClass(sTone, statusColor)
                  )}
                  onClick={() => onSelect?.(r)}
                >
                  <td
                    className={`${firstCellBase} before:bg-[var(--dot-color)] before:shadow-[0_0_0_2px_var(--dot-ring)] overflow-hidden text-ellipsis`}
                    // optional data attribute if you do delegated clicks elsewhere
                    data-component-id={r.id ?? r.componentName}
                    title={r.componentType}
                  >
                    <span className="truncate block">{r.componentType}</span>
                  </td>
                  <td className="py-2 pr-3 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="truncate">{r.componentName}</span>
                      {r.componentType && r.componentType !== "—" && (
                        <span className="text-xs text-muted-foreground flex-shrink-0">({r.componentType})</span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 pr-3 overflow-hidden text-ellipsis">{r.hours}</td>
                  <td className="py-2 pr-3 overflow-hidden text-ellipsis">{r.trips}</td>
                  <td className="py-2 pr-3 overflow-hidden text-ellipsis">{r.starts}</td>
                  <td className={`py-2 pr-3 overflow-hidden ${statusColor ? getCellBackgroundClasses(statusColor) : ''} rounded`}>
                    <Badge text={r.status || "—"} tone={sTone} colorName={statusColor} />
                  </td>
                  <td className={`py-2 pr-3 overflow-hidden ${stateColor ? getCellBackgroundClasses(stateColor) : ''} rounded`}>
                    <Badge text={r.state || "—"} tone={stTone} colorName={stateColor} />
                  </td>
                  <td className="py-2 pr-3 overflow-hidden text-ellipsis" title={r.turbine}>
                    <span className="truncate block">{r.turbine}</span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- Pieces View -------------------- */
function PiecesTable({
  items,
  onSelect,
  colorSettings = [],
  sortColumn,
  sortDirection,
  onSort,
}: {
  items: PieceItem[];
  onSelect?: (item: PieceItem) => void;
  colorSettings?: any[];
  sortColumn?: SortablePieceColumn;
  sortDirection?: SortDirection;
  onSort?: (column: SortablePieceColumn) => void;
}) {
  const style = {
    // @ts-ignore custom CSS vars
    "--dot-color": "#06b6d4", // cyan-500
    "--dot-ring": "rgba(6, 182, 212, 0.35)",
  } as React.CSSProperties;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm table-fixed" style={style}>
        <thead className="text-left">
          <tr className="border-b">
            <SortableHeader
              column="pn"
              label="PN"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="12%"
            />
            <SortableHeader
              column="piece"
              label="Piece"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="16%"
            />
            <SortableHeader
              column="sn"
              label="SN"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="12%"
            />
            <SortableHeader
              column="hours"
              label="Hours"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="10%"
            />
            <SortableHeader
              column="trips"
              label="Trips"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="10%"
            />
            <SortableHeader
              column="starts"
              label="Starts"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="10%"
            />
            <SortableHeader
              column="status"
              label="Status"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="12%"
            />
            <SortableHeader
              column="state"
              label="State"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="12%"
            />
            <SortableHeader
              column="turbine"
              label="Turbine"
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={onSort}
              width="6%"
            />
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((it: any, i: number) => {
            const sTone = getTone(it.status ?? it.health ?? "", 'status', colorSettings);
            const stTone = getTone(it.state ?? it.condition ?? "", 'state', colorSettings);
            const statusColor = getColorName(it.status ?? it.health ?? "", 'status', colorSettings);
            const stateColor = getColorName(it.state ?? it.condition ?? "", 'state', colorSettings);
            return (
              <tr
                key={it.id ?? i}
                className={cx(
                  "border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                  getRowStripeClass(sTone, statusColor)
                )}
                onClick={() => onSelect?.(it)}
                // keyboard activation (Enter/Space) when row is focused
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(it);
                  }
                }}
              >
                <td
                  className={`${firstCellBase} before:bg-[var(--dot-color)] before:shadow-[0_0_0_2px_var(--dot-ring)] overflow-hidden text-ellipsis`}
                  data-piece-id={it.id ?? it.sn ?? it.piece ?? it.name}
                  title={it.pn ?? "—"}
                >
                  <span className="truncate block">{it.pn ?? "—"}</span>
                </td>
                <td className="py-2 pr-3 overflow-hidden">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="truncate">{it.component ?? it.piece ?? it.name ?? "—"}</span>
                    {it.componentType && it.componentType !== "—" && (
                      <span className="text-xs text-muted-foreground flex-shrink-0">({it.componentType})</span>
                    )}
                  </div>
                </td>
                <td className="py-2 pr-3 overflow-hidden text-ellipsis" title={it.sn ?? it.serial ?? "—"}>
                  <span className="truncate block">{it.sn ?? it.serial ?? "—"}</span>
                </td>
                <td className="py-2 pr-3 overflow-hidden text-ellipsis">{it.hours ?? "—"}</td>
                <td className="py-2 pr-3 overflow-hidden text-ellipsis">{it.trips ?? "—"}</td>
                <td className="py-2 pr-3 overflow-hidden text-ellipsis">{it.starts ?? "—"}</td>
                <td className={`py-2 pr-3 overflow-hidden ${statusColor ? getCellBackgroundClasses(statusColor) : ''} rounded`}>
                  <Badge text={it.status ?? it.health ?? "—"} tone={sTone} colorName={statusColor} />
                </td>
                <td className={`py-2 pr-3 overflow-hidden ${stateColor ? getCellBackgroundClasses(stateColor) : ''} rounded`}>
                  <Badge text={it.state ?? it.condition ?? "—"} tone={stTone} colorName={stateColor} />
                </td>
                <td className="py-2 pr-3 overflow-hidden text-ellipsis" title={it.turbine ?? "—"}>
                  <span className="truncate block">{it.turbine ?? "—"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- Main Export -------------------- */
export default function InventoryMatrix(props: InventoryMatrixProps) {
  // Load color settings from IndexedDB
  const { data: colorSettings = [] } = useStatusColors();
  
  if (props.dataset === "components") {
    return (
      <ComponentsTable
        rows={props.componentStats ?? []}
        onSelect={props.onSelectComponent}
        colorSettings={colorSettings}
        sortColumn={props.sortColumn}
        sortDirection={props.sortDirection}
        onSort={props.onSort}
      />
    );
  }
  return (
    <PiecesTable
      items={props.items ?? []}
      onSelect={props.onSelectPiece}
      colorSettings={colorSettings}
      sortColumn={props.sortColumn}
      sortDirection={props.sortDirection}
      onSort={props.onSort}
    />
  );
}
