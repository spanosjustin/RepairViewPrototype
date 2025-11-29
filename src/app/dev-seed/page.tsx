"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { initializeDatabaseWithSeed, reseedDatabase } from "@/lib/storage/db/init";
import { turbineStorage } from "@/lib/storage/db/storage";

export default function DevSeedPage() {
  const [status, setStatus] = React.useState<string>("");
  const [turbineCount, setTurbineCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadTurbineCount();
  }, []);

  const loadTurbineCount = async () => {
    try {
      const turbines = await turbineStorage.getAll();
      setTurbineCount(turbines.length);
    } catch (error) {
      console.error('Error loading turbine count:', error);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    setStatus("Seeding database...");
    try {
      await initializeDatabaseWithSeed();
      await loadTurbineCount();
      setStatus("✅ Database seeded successfully!");
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReseed = async () => {
    if (!confirm('This will clear all data and re-seed. Are you sure?')) {
      return;
    }
    setLoading(true);
    setStatus("Re-seeding database...");
    try {
      await reseedDatabase();
      await loadTurbineCount();
      setStatus("✅ Database re-seeded successfully!");
    } catch (error) {
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Development Database Seed</h1>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>⚠️ Development Only:</strong> This page is for seeding the database with mock data for testing.
          Do not use in production.
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700">
          <strong>Current Status:</strong> {turbineCount} turbines in database
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Button
            onClick={handleSeed}
            disabled={loading || turbineCount > 0}
            className="w-full"
          >
            {loading ? "Seeding..." : "Seed Database (if empty)"}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            Seeds database only if it's currently empty
          </p>
        </div>

        <div>
          <Button
            onClick={handleReseed}
            disabled={loading}
            variant="destructive"
            className="w-full"
          >
            {loading ? "Re-seeding..." : "Force Re-seed (Clear & Seed)"}
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            ⚠️ Clears all data and re-seeds from mock data
          </p>
        </div>
      </div>

      {status && (
        <div className={`mt-6 p-4 rounded-lg ${
          status.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}

