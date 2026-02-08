// src/app/repair/page.tsx
"use client";

import * as React from "react";
import RepairLayout from "@/components/repair/RepairLayout";
import { MOCK_COMPONENTS, MOCK_REPAIR_ROWS } from "@/lib/repair/mock";
import { getRepairComponents, getRepairRows } from "@/lib/storage/db/adapters";
import type { Component, RepairRow } from "@/lib/repair/types";

export default function RepairPage() {
  const [components, setComponents] = React.useState<Component[]>(MOCK_COMPONENTS);
  const [repairRows, setRepairRows] = React.useState<RepairRow[]>(MOCK_REPAIR_ROWS);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [dbComponents, dbRepairRows] = await Promise.all([
          getRepairComponents(),
          getRepairRows(),
        ]);
        
        // Use database data if available, otherwise fall back to mock
        if (dbComponents.length > 0) {
          setComponents(dbComponents);
        }
        if (dbRepairRows.length > 0) {
          setRepairRows(dbRepairRows);
        }
      } catch (err) {
        console.error('Error loading repair data from IndexedDB:', err);
        setError('Failed to load repair data. Using mock data.');
        // Keep mock data as fallback
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center text-muted-foreground">Loading repair data from database...</div>
      </div>
    );
  }

  if (error) {
    console.warn(error);
  }

  return <RepairLayout components={components} repairRows={repairRows} />;
}
