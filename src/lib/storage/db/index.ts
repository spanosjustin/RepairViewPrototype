/**
 * Database Module - Main Entry Point
 * 
 * This module provides access to the normalized database structure.
 * 
 * Usage:
 *   import { seedDatabase, getTurbineWithComponents } from '@/lib/storage/db';
 */

// Export types
export * from './types';

// Export storage functions
export * from './storage';

// Export query helpers
export * from './queries';

// Export seed functions (DEVELOPMENT ONLY)
export { seedDatabase, clearDatabase } from './seed';

// Export IndexedDB utilities
export { IndexedDBStorage, getDB, STORES } from './indexedDB';
export type { StoreName } from './indexedDB';

// Export initialization (note: initializeDatabase does NOT auto-seed)
export { initializeDatabase, initializeDatabaseWithSeed, reseedDatabase } from './init';

