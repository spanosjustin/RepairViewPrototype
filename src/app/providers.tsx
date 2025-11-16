"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { initializeDefaults } from "@/lib/storage/defaults";
import { runMigrations } from "@/lib/storage/migrate";

export default function Providers({ children }: { children: ReactNode }) {
  const [qc] = useState(() => new QueryClient());
  
  // Initialize IndexedDB with defaults and run migrations on app startup
  useEffect(() => {
    const init = async () => {
      await runMigrations(); // Migrate from localStorage if needed
      await initializeDefaults(); // Seed defaults if empty
    };
    init();
  }, []);

  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
