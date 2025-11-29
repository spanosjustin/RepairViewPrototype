/**
 * Database Initialization
 * 
 * Note: Auto-seeding is for DEVELOPMENT ONLY.
 * In production, the database should start empty and be populated with real client data.
 */

import { turbineStorage } from './storage';
import { seedDatabase } from './seed';

/**
 * Initialize database - opens connection and verifies schema
 * Does NOT auto-seed - database starts empty for production use
 * Call this on app startup
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Just verify database connection by checking if we can query
    const turbines = await turbineStorage.getAll();
    console.log(`Database initialized. Current turbines: ${turbines.length}`);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

/**
 * Initialize database with auto-seeding (DEVELOPMENT ONLY)
 * Use this for development/testing with mock data
 * 
 * @param forceReseed - If true, clears database before seeding
 */
export async function initializeDatabaseWithSeed(forceReseed: boolean = false): Promise<void> {
  try {
    if (forceReseed) {
      console.log('Force re-seeding database...');
      const { clearDatabase } = await import('./seed');
      await clearDatabase();
    }

    // Check if database is empty
    const turbines = await turbineStorage.getAll();
    
    if (turbines.length === 0) {
      console.log('Database is empty, seeding from mock data (DEV ONLY)...');
      await seedDatabase();
      console.log('Database seeded successfully!');
    } else {
      console.log(`Database already has ${turbines.length} turbines, skipping seed.`);
    }
  } catch (error) {
    console.error('Error initializing database with seed:', error);
    throw error;
  }
}

/**
 * Force re-seed database (clears and seeds)
 * DEVELOPMENT/TESTING ONLY - Use for development/testing with mock data
 */
export async function reseedDatabase(): Promise<void> {
  console.warn('⚠️  reseedDatabase() is for DEVELOPMENT ONLY. Do not use in production!');
  const { clearDatabase, seedDatabase } = await import('./seed');
  await clearDatabase();
  await seedDatabase();
}

