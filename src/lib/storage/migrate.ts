/**
 * Migration utility to move data from localStorage to IndexedDB
 * Run this once to migrate existing localStorage data
 */
import { LocalStorage } from './localStorage';
import { statusColorStorage as indexedStatusColors } from './indexedDB';
import type { StatusColorSetting } from './indexedDB';

const OLD_STORAGE_KEY = 'repairview_status_colors';

/**
 * Migrate status colors from localStorage to IndexedDB
 */
export async function migrateStatusColors(): Promise<boolean> {
  try {
    // Check if data exists in localStorage
    const oldData = LocalStorage.get<StatusColorSetting[]>(OLD_STORAGE_KEY);
    
    if (!oldData || oldData.length === 0) {
      console.log('No localStorage data to migrate');
      return true;
    }

    // Check if IndexedDB already has data
    const existing = await indexedStatusColors.getAll();
    if (existing.length > 0) {
      console.log('IndexedDB already has data, skipping migration');
      return true;
    }

    // Migrate to IndexedDB
    const success = await indexedStatusColors.saveAll(oldData);
    
    if (success) {
      console.log(`Migrated ${oldData.length} status color settings to IndexedDB`);
      // Optionally clear localStorage after migration
      // LocalStorage.remove(OLD_STORAGE_KEY);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error migrating status colors:', error);
    return false;
  }
}

/**
 * Run all migrations
 */
export async function runMigrations(): Promise<void> {
  console.log('Running migrations...');
  await migrateStatusColors();
  console.log('Migrations complete');
}

