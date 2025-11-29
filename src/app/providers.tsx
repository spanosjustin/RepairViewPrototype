"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { initializeDatabase, initializeDatabaseWithSeed } from "@/lib/storage/db/init";

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
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    init();
  }, []);

  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
