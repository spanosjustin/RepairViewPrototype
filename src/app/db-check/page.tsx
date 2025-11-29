"use client";

import * as React from "react";
import { pieceStorage, componentStorage, turbineStorage, componentPieceStorage, componentAssignmentStorage } from "@/lib/storage/db/storage";

export default function DbCheckPage() {
  const [counts, setCounts] = React.useState<{
    pieces: number;
    components: number;
    turbines: number;
    componentPieces: number;
    componentAssignments: number;
    uniqueComponentTypes: number;
    componentsWithPieces: number;
    componentsOnTurbines: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkCounts = async () => {
      try {
        const pieces = await pieceStorage.getAll();
        const components = await componentStorage.getAll();
        const turbines = await turbineStorage.getAll();
        const componentPieces = await componentPieceStorage.getAll();
        const componentAssignments = await componentAssignmentStorage.getAll();

        // Count unique component types
        const uniqueComponentTypes = new Set(components.map(c => c.type_code));
        
        // Count components with pieces
        const componentsWithPieces = new Set(componentPieces.map(cp => cp.component_id));
        
        // Count components assigned to turbines
        const componentsOnTurbines = new Set(componentAssignments
          .filter(ca => !ca.valid_to)
          .map(ca => ca.component_id));

        setCounts({
          pieces: pieces.length,
          components: components.length, // Total component records
          turbines: turbines.length,
          componentPieces: componentPieces.length,
          componentAssignments: componentAssignments.length,
          uniqueComponentTypes: uniqueComponentTypes.size,
          componentsWithPieces: componentsWithPieces.size,
          componentsOnTurbines: componentsOnTurbines.size,
        });
      } catch (error) {
        console.error('Error checking database:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCounts();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading database counts...</p>
      </div>
    );
  }

  if (!counts) {
    return (
      <div className="p-6">
        <p className="text-red-600">Error loading database counts</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Database Counts</h1>
      
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-medium">Pieces:</span>
          <span className="text-lg font-bold">{counts.pieces}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Components (Total):</span>
          <span className="text-lg font-bold">{counts.components}</span>
        </div>
        
        <div className="flex justify-between items-center border-t pt-3 mt-3">
          <span className="font-medium text-sm text-gray-600">Unique Component Types:</span>
          <span className="text-sm font-semibold">{counts.uniqueComponentTypes}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm text-gray-600">Components with Pieces:</span>
          <span className="text-sm">{counts.componentsWithPieces}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm text-gray-600">Components on Turbines:</span>
          <span className="text-sm">{counts.componentsOnTurbines}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">Turbines:</span>
          <span className="text-lg font-bold">{counts.turbines}</span>
        </div>
        
        <div className="flex justify-between items-center border-t pt-3 mt-3">
          <span className="font-medium text-sm text-gray-600">Component-Piece Links:</span>
          <span className="text-sm">{counts.componentPieces}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium text-sm text-gray-600">Component-Turbine Assignments:</span>
          <span className="text-sm">{counts.componentAssignments}</span>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Expected:</strong> 42 pieces (3 turbines × 14 component types)
        </p>
        <p className="text-sm text-blue-800 mt-1">
          {counts.pieces === 42 ? (
            <span className="text-green-600 font-bold">✓ Correct count!</span>
          ) : (
            <span className="text-orange-600">
              ⚠️ Missing {42 - counts.pieces} pieces. Re-seed database to get all 42.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}

