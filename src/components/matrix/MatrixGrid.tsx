// src/components/matrix/MatrixGrid.tsx
"use client";

import * as React from "react";
import MatrixCell from "@/components/matrix/MatrixCell";
import type { Column, MatrixRow, MatrixProps } from "@/lib/matrix/types";
import { GRID_SIZING } from "@/lib/matrix/constants";

/** tiny class combiner */
const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

/** Safe accessors with sensible fallbacks */
const LABEL_COL_PX =
  (GRID_SIZING as any)?.labelColPx ??
  (GRID_SIZING as any)?.labelWidth ??
  160;
const MIN_COL_PX = (GRID_SIZING as any)?.min ?? 120;

/** Build a CSS grid template from column widths/minWidths + sticky label col */
function useTemplate(columns: Column[]) {
  return React.useMemo(() => {
    const label = `${LABEL_COL_PX}px`;
    const rest = columns
      .map((c) =>
        typeof c.width === "number"
          ? `${c.width}px`
          : `minmax(${c.minWidth ?? MIN_COL_PX}px, 1fr)`
      )
      .join(" ");
    return `${label} ${rest}`;
  }, [columns]);
}

type Props = MatrixProps & {
  rowClassName?: string;                // optional extra row classes (can include hover:bg-…)
  onRowClick?: (row: MatrixRow) => void;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function MatrixGrid({
  columns,
  rows,
  emptyLabel = "No data",
  rowClassName,
  onRowClick,
  headerClassName,
  bodyClassName,
}: Props) {
  const template = useTemplate(columns);

  return (
    <div className="rounded-2xl border bg-card">
      {/* Header */}
      <div
        className={cx(
          "sticky top-0 z-10 grid items-center border-b px-2 py-2 text-xs font-semibold uppercase tracking-wide",
          headerClassName
        )}
        style={{ gridTemplateColumns: template }}
      >
        <div className="px-2 text-muted-foreground">Label</div>
        {columns.map((c) => (
          <div
            key={c.id}
            className={cx(
              "px-2",
              c.align === "center" && "text-center",
              c.align === "right" && "text-right"
            )}
            title={c.title}
          >
            {c.title}
          </div>
        ))}
      </div>

      {/* Body */}
      {rows.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">{emptyLabel}</div>
      ) : (
        <div className={cx("divide-y", bodyClassName)}>
          {rows.map((row) => {
            // Detect if caller already supplies a hover class
            const callerHasHover = !!rowClassName && /\bhover:bg-/.test(rowClassName);
            // Interactive if clickable OR caller provided an explicit hover class
            const interactive = !!onRowClick || callerHasHover;
            // Provide a *default* hover if interactive but caller didn't specify one
            const defaultHover = interactive && !callerHasHover ? "hover:bg-gray-100" : "";

            return (
              <div
                key={row.id}
                className={cx(
                  "grid items-stretch px-2 py-2",
                  interactive && "group cursor-pointer",
                  defaultHover,
                  rowClassName
                )}
                style={{ gridTemplateColumns: template }}
                onClick={() => onRowClick?.(row)}
                role={onRowClick ? "button" : undefined}
              >
                {/* sticky label cell */}
                <div
                  className={cx(
                    "sticky left-0 z-[1] px-2 font-medium",
                    // Inventory (non-interactive): keep solid card background like before
                    !interactive && "bg-card",
                    // Interactive (Repair / Inventory with clicks or explicit hover):
                    // let row hover show and mirror the same hover color on the sticky cell
                    interactive && "bg-transparent group-hover:bg-gray-100"
                  )}
                >
                  {row.label}
                </div>

                {/* data cells */}
                {row.cells.map((cell, i) => {
                  const col = columns[i];
                  return (
                    <div
                      key={i}
                      className={cx(
                        "px-2",
                        col?.align === "center" && "text-center",
                        col?.align === "right" && "text-right"
                      )}
                    >
                      <MatrixCell cell={cell} align={col?.align ?? "left"} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
