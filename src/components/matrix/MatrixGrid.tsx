// repairview-prototype/src/components/matrix/MatrixGrid.tsx
"use client";

import * as React from "react";
import MatrixCell from "@/components/matrix/MatrixCell";
import type { Column, MatrixRow, MatrixProps } from "@/lib/matrix/types";
import { GRID_SIZING } from "@/lib/matrix/constants";

/** tiny class combiner */
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

/** Build a CSS grid template from column widths/minWidths */
function useTemplate(columns: Column[]) {
  return React.useMemo(() => {
    return columns
      .map((c) => (c.width ? `${c.width}px` : `minmax(${c.minWidth ?? 120}px, 1fr)`))
      .join(" ");
  }, [columns]);
}

type GridProps<Row extends MatrixRow> = MatrixProps<Row> & {
  /** e.g., "hover:bg-muted/40 transition-colors" */
  rowHoverClass?: string;
  /** e.g., "group-hover:bg-muted/40" to sync pinned cell background */
  pinnedHoverClass?: string;
  /** Called when a row is clicked (or Enter/Space pressed) */
  onRowClick?: (row: Row) => void;
};

export default function MatrixGrid<Row extends MatrixRow>({
  columns,
  rows,
  emptyLabel = "No data",
  rowHoverClass,
  pinnedHoverClass,
  onRowClick,
}: GridProps<Row>) {
  const template = useTemplate(columns);
  const headerHeight = GRID_SIZING.headerHeight;
  const rowHeight = GRID_SIZING.rowHeight;
  const maxBodyHeight = GRID_SIZING.maxBodyHeight;

  const firstPinnedLeft = columns[0]?.pinned === "left";

  if (!rows?.length) {
    return (
      <div className="rounded-xl border">
        <div className="p-4 text-sm text-muted-foreground">{emptyLabel}</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Scroll container so the header can be sticky */}
      <div className="overflow-auto" style={{ maxHeight: maxBodyHeight + headerHeight + 8 }}>
        {/* Header row */}
        <div
          className="grid sticky top-0 z-20 bg-background border-b"
          style={{ gridTemplateColumns: template, height: headerHeight }}
        >
          {columns.map((col, i) => (
            <div
              key={col.id}
              className={cx(
                "px-2 flex items-center text-xs font-medium uppercase tracking-wide text-muted-foreground",
                i < columns.length - 1 && "border-r",
                firstPinnedLeft && i === 0 && "sticky left-0 z-30 bg-background"
              )}
              title={col.title}
            >
              {col.title}
            </div>
          ))}
        </div>

        {/* Body rows */}
        <div>
          {rows.map((row) => {
            const clickable = typeof onRowClick === "function";
            const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
              if (!clickable) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onRowClick?.(row);
              }
            };

            return (
              <div
                key={row.id}
                className={cx(
                  "grid border-b group",
                  rowHoverClass,
                  clickable && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/40"
                )}
                style={{ gridTemplateColumns: template, minHeight: rowHeight, alignItems: "center" }}
                role={clickable ? "button" : undefined}
                tabIndex={clickable ? 0 : undefined}
                onClick={clickable ? () => onRowClick?.(row) : undefined}
                onKeyDown={handleKeyDown}
                aria-label={clickable ? row.label ?? "Row" : undefined}
              >
                {columns.map((col, i) => {
                  const cell = row.cells[i] ?? { kind: "text", value: "—" };
                  const isPinned = firstPinnedLeft && i === 0;
                  return (
                    <div
                      key={`${row.id}-${col.id}`}
                      className={cx(
                        "min-w-0",
                        i < columns.length - 1 && "border-r",
                        isPinned && "sticky left-0 z-10",
                        isPinned && pinnedHoverClass
                      )}
                      style={{ height: rowHeight }}
                    >
                      <MatrixCell cell={cell} align={col.align ?? "left"} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}