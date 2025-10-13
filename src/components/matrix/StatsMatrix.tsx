"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { MatrixProps, StatRow } from "@/lib/matrix/types";
import { DEFAULT_STATS_COLUMNS } from "@/lib/matrix/constants";

type Props = Omit<MatrixProps<StatRow>, "columns"> & {
  columns?: MatrixProps<StatRow>["columns"];
  onCellClick?: (row: StatRow, cellIndex: number, cell: any) => void;
  onCellEdit?: (row: StatRow, cellIndex: number, newValue: string | number) => void;
  editable?: boolean;
  editingCell?: { rowId: string; cellIndex: number } | null;
  onStartEdit?: (row: StatRow, cellIndex: number) => void;
  onStopEdit?: () => void;
};

export default function StatsMatrix({ 
  rows, 
  columns = DEFAULT_STATS_COLUMNS, 
  emptyLabel, 
  onCellClick,
  onCellEdit,
  editable = false,
  editingCell,
  onStartEdit,
  onStopEdit,
}: Props) {
  return (
    <MatrixGrid<StatRow> 
      columns={columns} 
      rows={rows} 
      emptyLabel={emptyLabel ?? "No stats"} 
      onCellClick={onCellClick}
      onCellEdit={onCellEdit}
      editable={editable}
      editingCell={editingCell}
      onStartEdit={onStartEdit}
      onStopEdit={onStopEdit}
    />
  );
}
