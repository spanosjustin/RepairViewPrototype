"use client";

import * as React from "react";
import TurbineList from "@/components/matrix/TurbineList";
import { MOCK_TURBINES } from "@/lib/matrix/mock";
import type { Turbine } from "@/lib/matrix/types";

export default function MatrixPage() {
  const [turbines, setTurbines] = React.useState<Turbine[]>(MOCK_TURBINES);
  const [editingCell, setEditingCell] = React.useState<{
    turbineId: string;
    rowId: string;
    cellIndex: number;
  } | null>(null);

  const handleStartEdit = (turbineId: string, rowId: string, cellIndex: number) => {
    setEditingCell({ turbineId, rowId, cellIndex });
  };

  const handleStopEdit = () => {
    setEditingCell(null);
  };

  const handleCellEdit = (turbineId: string, rowId: string, cellIndex: number, newValue: string | number) => {
    setTurbines(prevTurbines => 
      prevTurbines.map(turbine => {
        if (turbine.id !== turbineId) return turbine;

        return {
          ...turbine,
          stats: turbine.stats.map(row => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              cells: row.cells.map((cell, index) => 
                index === cellIndex 
                  ? { ...cell, value: newValue }
                  : cell
              )
            };
          }),
          pieces: turbine.pieces.map(row => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              cells: row.cells.map((cell, index) => 
                index === cellIndex 
                  ? { ...cell, value: newValue }
                  : cell
              )
            };
          })
        };
      })
    );
  };

  return (
    <div className="p-6 space-y-4">
      <TurbineList 
        turbines={turbines} 
        onCellEdit={handleCellEdit}
        editable={true}
        editingCell={editingCell}
        onStartEdit={handleStartEdit}
        onStopEdit={handleStopEdit}
        actionLabel={editingCell ? "Save Edits" : "Edit"}
      />
    </div>
  );
}
