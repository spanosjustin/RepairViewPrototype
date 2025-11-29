"use client";

import * as React from "react";
import TurbineList from "@/components/matrix/TurbineList";
import { turbineStorage } from "@/lib/storage/db/storage";
import { getTurbineWithComponents } from "@/lib/storage/db/queries";
import { dbTurbineToMatrixTurbine } from "@/lib/storage/db/adapters";
import type { Turbine } from "@/lib/matrix/types";

export default function MatrixPage() {
  const [turbines, setTurbines] = React.useState<Turbine[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [editingCell, setEditingCell] = React.useState<{
    turbineId: string;
    rowId: string;
    cellIndex: number;
  } | null>(null);

  React.useEffect(() => {
    const loadTurbines = async () => {
      try {
        setLoading(true);
        setError(null);

        const allTurbines = await turbineStorage.getAll();
        const convertedTurbines: Turbine[] = [];

        for (const turbine of allTurbines) {
          const turbineWithComponents = await getTurbineWithComponents(turbine.id);
          if (turbineWithComponents) {
            convertedTurbines.push(dbTurbineToMatrixTurbine(turbineWithComponents));
          }
        }

        setTurbines(convertedTurbines);
      } catch (err) {
        console.error('Error loading turbines:', err);
        setError(err instanceof Error ? err.message : 'Failed to load turbines');
      } finally {
        setLoading(false);
      }
    };

    loadTurbines();
  }, []);

  const handleStartEdit = (turbineId: string, rowId: string, cellIndex: number) => {
    setEditingCell({ turbineId, rowId, cellIndex });
  };

  const handleStopEdit = () => {
    setEditingCell(null);
  };

  const handleCellEdit = async (turbineId: string, rowId: string, cellIndex: number, newValue: string | number) => {
    // TODO: Update database instead of just local state
    // For now, update local state to maintain UI functionality
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

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-gray-600">Loading turbines...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
          <p className="text-sm text-red-600 mt-2">
            Database may be empty. Visit /dev-seed to seed with mock data.
          </p>
        </div>
      </div>
    );
  }

  if (turbines.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-800">No turbines found.</p>
          <p className="text-sm text-gray-600 mt-2">
            Database is empty. Visit <a href="/dev-seed" className="text-blue-600 underline">/dev-seed</a> to seed with mock data.
          </p>
        </div>
      </div>
    );
  }

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
