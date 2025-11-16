// src/components/inventory/InventoryMatrix.tsx
"use client";

import * as React from "react";
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

type InventoryMatrixProps =
  | {
      dataset: "pieces";
      items: PieceItem[];
      onSelectPiece?: (item: PieceItem) => void;
    }
  | {
      dataset: "components";
      componentStats: ComponentRow[];
      onSelectComponent?: (row: ComponentRow) => void;
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

/* -------------------- Components View -------------------- */
function ComponentsTable({
  rows,
  onSelect,
  colorSettings = [],
}: {
  rows: ComponentRow[];
  onSelect?: (row: ComponentRow) => void;
  colorSettings?: any[];
}) {
  // dataset color vars for the pseudo dot
  const style = {
    // @ts-ignore custom CSS vars
    "--dot-color": "#8b5cf6", // violet-500
    "--dot-ring": "rgba(139, 92, 246, 0.35)",
  } as React.CSSProperties;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm" style={style}>
        <thead className="text-left">
          <tr className="border-b">
            <th className="py-2 pr-3">Component Type</th>
            <th className="py-2 pr-3">Component Name</th>
            <th className="py-2 pr-3">Hours</th>
            <th className="py-2 pr-3">Trips</th>
            <th className="py-2 pr-3">Starts</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">State</th>
            <th className="py-2 pr-3">Turbine</th>
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
                    className={`${firstCellBase} before:bg-[var(--dot-color)] before:shadow-[0_0_0_2px_var(--dot-ring)]`}
                    // optional data attribute if you do delegated clicks elsewhere
                    data-component-id={r.id ?? r.componentName}
                  >
                    {r.componentType}
                  </td>
                  <td className="py-2 pr-3">{r.componentName}</td>
                  <td className="py-2 pr-3">{r.hours}</td>
                  <td className="py-2 pr-3">{r.trips}</td>
                  <td className="py-2 pr-3">{r.starts}</td>
                  <td className={`py-2 pr-3 ${statusColor ? getCellBackgroundClasses(statusColor) : ''} rounded`}>
                    <Badge text={r.status || "—"} tone={sTone} colorName={statusColor} />
                  </td>
                  <td className={`py-2 pr-3 ${stateColor ? getCellBackgroundClasses(stateColor) : ''} rounded`}>
                    <Badge text={r.state || "—"} tone={stTone} colorName={stateColor} />
                  </td>
                  <td className="py-2 pr-3">{r.turbine}</td>
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
}: {
  items: PieceItem[];
  onSelect?: (item: PieceItem) => void;
  colorSettings?: any[];
}) {
  const style = {
    // @ts-ignore custom CSS vars
    "--dot-color": "#06b6d4", // cyan-500
    "--dot-ring": "rgba(6, 182, 212, 0.35)",
  } as React.CSSProperties;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm" style={style}>
        <thead className="text-left">
          <tr className="border-b">
            <th className="py-2 pr-3">Piece</th>
            <th className="py-2 pr-3">SN</th>
            <th className="py-2 pr-3">Hours</th>
            <th className="py-2 pr-3">Trips</th>
            <th className="py-2 pr-3">Starts</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">State</th>
            <th className="py-2 pr-3">Turbine</th>
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
                  className={`${firstCellBase} before:bg-[var(--dot-color)] before:shadow-[0_0_0_2px_var(--dot-ring)]`}
                  data-piece-id={it.id ?? it.sn ?? it.piece ?? it.name}
                >
                  {it.piece ?? it.name ?? "—"}
                </td>
                <td className="py-2 pr-3">{it.sn ?? it.serial ?? "—"}</td>
                <td className="py-2 pr-3">{it.hours ?? "—"}</td>
                <td className="py-2 pr-3">{it.trips ?? "—"}</td>
                <td className="py-2 pr-3">{it.starts ?? "—"}</td>
                <td className={`py-2 pr-3 ${statusColor ? getCellBackgroundClasses(statusColor) : ''} rounded`}>
                  <Badge text={it.status ?? it.health ?? "—"} tone={sTone} colorName={statusColor} />
                </td>
                <td className={`py-2 pr-3 ${stateColor ? getCellBackgroundClasses(stateColor) : ''} rounded`}>
                  <Badge text={it.state ?? it.condition ?? "—"} tone={stTone} colorName={stateColor} />
                </td>
                <td className="py-2 pr-3">{it.turbine ?? "—"}</td>
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
      />
    );
  }
  return (
    <PiecesTable
      items={props.items ?? []}
      onSelect={props.onSelectPiece}
      colorSettings={colorSettings}
    />
  );
}
