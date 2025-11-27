/**
 * Unified mock data export for the application
 * This file consolidates all mock data sources for easy access
 */

import { MOCK_TURBINES } from "@/lib/matrix/mock";
import { MOCK_INVENTORY } from "@/lib/inventory/mock";

export const MOCK_DATA = {
  turbines: MOCK_TURBINES,
  inventory: MOCK_INVENTORY,
} as const;

// Re-export individual exports for backward compatibility
export { MOCK_TURBINES, MOCK_INVENTORY };

