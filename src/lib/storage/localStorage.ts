/**
 * LocalStorage utility for testing
 * This will be replaced with Supabase later
 * 
 * Survives browser cache clears (localStorage is separate from cache)
 */

// Storage keys
const STORAGE_KEYS = {
  STATUS_COLORS: 'repairview_status_colors',
  // Add more keys as needed
} as const;

/**
 * Generic localStorage helper
 */
class LocalStorage {
  private static isAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static get<T>(key: string, defaultValue: T | null = null): T | null {
    if (!this.isAvailable()) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  static remove(key: string): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
}

/**
 * Status Color Settings Storage
 * Easy to swap out for Supabase later
 */
export type StatusColorSetting = {
  value: string; // e.g., "OK", "Monitor", "In Service"
  type: 'status' | 'state';
  tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral';
  bg_color?: string;
  text_color?: string;
  border_color?: string;
};

export const statusColorStorage = {
  /**
   * Get all status color settings
   */
  getAll(): StatusColorSetting[] {
    return LocalStorage.get<StatusColorSetting[]>(STORAGE_KEYS.STATUS_COLORS, []);
  },

  /**
   * Get a specific setting by value and type
   */
  get(value: string, type: 'status' | 'state'): StatusColorSetting | null {
    const all = this.getAll();
    return all.find(s => s.value === value && s.type === type) || null;
  },

  /**
   * Get all settings of a specific type
   */
  getByType(type: 'status' | 'state'): StatusColorSetting[] {
    const all = this.getAll();
    return all.filter(s => s.type === type);
  },

  /**
   * Save a single setting (creates or updates)
   */
  save(setting: StatusColorSetting): boolean {
    const all = this.getAll();
    const index = all.findIndex(
      s => s.value === setting.value && s.type === setting.type
    );

    if (index >= 0) {
      // Update existing
      all[index] = setting;
    } else {
      // Add new
      all.push(setting);
    }

    return LocalStorage.set(STORAGE_KEYS.STATUS_COLORS, all);
  },

  /**
   * Save multiple settings at once
   */
  saveAll(settings: StatusColorSetting[]): boolean {
    return LocalStorage.set(STORAGE_KEYS.STATUS_COLORS, settings);
  },

  /**
   * Delete a setting
   */
  delete(value: string, type: 'status' | 'state'): boolean {
    const all = this.getAll();
    const filtered = all.filter(
      s => !(s.value === value && s.type === type)
    );
    return LocalStorage.set(STORAGE_KEYS.STATUS_COLORS, filtered);
  },

  /**
   * Clear all settings
   */
  clear(): boolean {
    return LocalStorage.remove(STORAGE_KEYS.STATUS_COLORS);
  },
};

// Export the base LocalStorage class for other use cases
export { LocalStorage };

