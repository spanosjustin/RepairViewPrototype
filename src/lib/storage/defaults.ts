/**
 * Default color settings
 * Used as fallback when IndexedDB is empty or for initial seed
 */
import type { StatusColorSetting } from './indexedDB';
import { statusColorStorage } from './indexedDB';

export const DEFAULT_STATUS_COLORS: StatusColorSetting[] = [
  // Status values
  { value: 'OK', type: 'status', tone: 'ok' },
  { value: 'Monitor', type: 'status', tone: 'warn' },
  { value: 'Replace Soon', type: 'status', tone: 'warn' },
  { value: 'Replace Now', type: 'status', tone: 'bad' },
  { value: 'Spare', type: 'status', tone: 'info' },
  { value: 'Degraded', type: 'status', tone: 'warn' },
  { value: 'Unknown', type: 'status', tone: 'neutral' },
  
  // State values
  { value: 'In Service', type: 'state', tone: 'ok' },
  { value: 'Out of Service', type: 'state', tone: 'bad' },
  { value: 'Standby', type: 'state', tone: 'info' },
  { value: 'Repair', type: 'state', tone: 'warn' },
  { value: 'On Order', type: 'state', tone: 'info' },
];

/**
 * Initialize IndexedDB with defaults if empty
 * Call this once on app startup
 */
export async function initializeDefaults(): Promise<void> {
  try {
    const existing = await statusColorStorage.getAll();
    
    if (existing.length === 0) {
      await statusColorStorage.saveAll(DEFAULT_STATUS_COLORS);
      console.log('Initialized default color settings in IndexedDB');
    }
  } catch (error) {
    console.error('Error initializing defaults:', error);
  }
}

