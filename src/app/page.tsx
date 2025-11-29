"use client";

import * as React from "react";
import TurbineCarousel from "@/components/TurbineCarousel";
import DonutCarousel from "@/components/DonutCarousel";
import ComponentCarousel from "@/components/ComponentCarousel";
import { turbineStorage } from "@/lib/storage/db/storage";
import { getTurbineWithComponents } from "@/lib/storage/db/queries";
import { dbTurbineToMatrixTurbine, getAllInventoryItems } from "@/lib/storage/db/adapters";
import type { Turbine } from "@/lib/matrix/types";
import type { InventoryItem } from "@/lib/inventory/types";

export default function Home() {
  const [turbines, setTurbines] = React.useState<Turbine[]>([]);
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all turbines
        const allTurbines = await turbineStorage.getAll();
        
        if (allTurbines.length === 0) {
          // Database is empty - this is expected for production
          setTurbines([]);
          setInventoryItems([]);
          return;
        }
        
        // Convert each turbine to the old format
        const convertedTurbines: Turbine[] = [];
        for (const turbine of allTurbines) {
          try {
            const turbineWithComponents = await getTurbineWithComponents(turbine.id);
            if (turbineWithComponents) {
              convertedTurbines.push(dbTurbineToMatrixTurbine(turbineWithComponents));
            }
          } catch (turbineError) {
            console.warn(`Error loading turbine ${turbine.id}:`, turbineError);
            // Continue with other turbines
          }
        }

        setTurbines(convertedTurbines);

        // Load all inventory items
        try {
          const items = await getAllInventoryItems();
          console.log(`📊 Database counts: ${items.length} inventory items (pieces)`);
          setInventoryItems(items);
        } catch (inventoryError) {
          console.warn('Error loading inventory items:', inventoryError);
          setInventoryItems([]);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error: {error}</p>
          <p className="text-sm text-gray-600 mt-2">
            Database may be empty. For development, you can seed it with mock data.
          </p>
        </div>
      </div>
    );
  }

  if (turbines.length === 0) {
    return (
      <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No turbines found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Database is empty. For development, seed it with mock data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Sections A and B - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Section A - Turbine Carousel */}
        <div>
          <TurbineCarousel turbines={turbines} />
        </div>
        
        {/* Section B - Donut Carousel (Piece and Component) */}
        <div>
          <DonutCarousel 
            turbines={turbines}
            inventoryItems={inventoryItems} 
          />
        </div>
      </div>

      {/* Section C - Component Carousel */}
      <div className="mb-8">
        <ComponentCarousel inventoryItems={inventoryItems} className="h-96" />
      </div>

      <footer className="flex gap-[24px] flex-wrap items-center justify-center">
        Repair View
      </footer>
    </div>
  );
}
