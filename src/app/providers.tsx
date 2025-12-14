"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { initializeDatabase, initializeDatabaseWithSeed } from "@/lib/storage/db/init";
import { turbineStorage, componentStorage } from "@/lib/storage/db/storage";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  
  // Initialize new database structure on app startup
  useEffect(() => {
    const init = async () => {
      try {
        if (process.env.NODE_ENV !== "production") {
          // In development, ensure DB is populated and relationships are seeded
          await initializeDatabaseWithSeed(false);
        } else {
          // In production, just open the DB and leave it empty for real client data
          await initializeDatabase();
        }
        
        // SEED: Update all turbines and components with hours/trips/starts
        const turbines = await turbineStorage.getAll();
        const turbinesToUpdate = turbines.map(t => ({
          ...t,
          hours: t.hours ?? (15000 + Math.floor(Math.random() * 10000)),
          trips: t.trips ?? (100 + Math.floor(Math.random() * 100)),
          starts: t.starts ?? (600 + Math.floor(Math.random() * 600)),
        }));
        await Promise.all(turbinesToUpdate.map(t => turbineStorage.save(t)));
        
        const components = await componentStorage.getAll();
        const componentsToUpdate = components.map(c => ({
          ...c,
          hours: c.hours ?? (5000 + Math.floor(Math.random() * 10000)),
          trips: c.trips ?? (50 + Math.floor(Math.random() * 100)),
          starts: c.starts ?? (300 + Math.floor(Math.random() * 400)),
        }));
        await Promise.all(componentsToUpdate.map(c => componentStorage.save(c)));
        
        console.log(`✅ Seeded ${turbinesToUpdate.length} turbines and ${componentsToUpdate.length} components`);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    init();
  }, []);

  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
