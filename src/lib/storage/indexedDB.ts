/**
 * IndexedDB storage for entire database
 * Replaces localStorage for larger capacity (hundreds of MB to GB)
 * 
 * Database: "repairview_db"
 * Object Stores:
 *   - status_colors: Status/state color settings
 *   - pieces: Inventory pieces/items
 *   - components: Component data
 *   - turbines: Turbine data
 *   - sites: Site/plant data
 *   - repair_events: Repair event history
 */

const DB_NAME = 'repairview_db';
const DB_VERSION = 1;

// Object store names
export const STORES = {
  STATUS_COLORS: 'status_colors',
  PIECES: 'pieces',
  COMPONENTS: 'components',
  TURBINES: 'turbines',
  SITES: 'sites',
  REPAIR_EVENTS: 'repair_events',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

/**
 * Get or create the IndexedDB database
 */
function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.STATUS_COLORS)) {
        const statusStore = db.createObjectStore(STORES.STATUS_COLORS, { keyPath: ['value', 'type'] });
        statusStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.PIECES)) {
        const piecesStore = db.createObjectStore(STORES.PIECES, { keyPath: 'id', autoIncrement: true });
        piecesStore.createIndex('sn', 'sn', { unique: true });
        piecesStore.createIndex('turbine', 'turbine', { unique: false });
        piecesStore.createIndex('component', 'component', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.COMPONENTS)) {
        const componentsStore = db.createObjectStore(STORES.COMPONENTS, { keyPath: 'id', autoIncrement: true });
        componentsStore.createIndex('name', 'name', { unique: false });
        componentsStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.TURBINES)) {
        const turbinesStore = db.createObjectStore(STORES.TURBINES, { keyPath: 'id' });
        turbinesStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SITES)) {
        const sitesStore = db.createObjectStore(STORES.SITES, { keyPath: 'id' });
        sitesStore.createIndex('name', 'name', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.REPAIR_EVENTS)) {
        const eventsStore = db.createObjectStore(STORES.REPAIR_EVENTS, { keyPath: 'id', autoIncrement: true });
        eventsStore.createIndex('pieceId', 'pieceId', { unique: false });
        eventsStore.createIndex('componentId', 'componentId', { unique: false });
        eventsStore.createIndex('date', 'date', { unique: false });
      }
    };
  });
}

/**
 * Generic IndexedDB operations
 */
class IndexedDBStorage {
  /**
   * Get all items from a store
   */
  static async getAll<T>(storeName: StoreName): Promise<T[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T[]);
    });
  }

  /**
   * Get a single item by key
   */
  static async get<T>(storeName: StoreName, key: IDBValidKey): Promise<T | null> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve((request.result as T) || null);
    });
  }

  /**
   * Get items by index
   */
  static async getByIndex<T>(
    storeName: StoreName,
    indexName: string,
    value: IDBValidKey
  ): Promise<T[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(value);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as T[]);
    });
  }

  /**
   * Add or update an item
   */
  static async put<T>(storeName: StoreName, item: T): Promise<IDBValidKey> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Add multiple items
   */
  static async putAll<T>(storeName: StoreName, items: T[]): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      items.forEach(item => store.put(item));

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Delete an item by key
   */
  static async delete(storeName: StoreName, key: IDBValidKey): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clear all items from a store
   */
  static async clear(storeName: StoreName): Promise<void> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Count items in a store
   */
  static async count(storeName: StoreName): Promise<number> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

/**
 * Status Color Settings Storage (IndexedDB version)
 */
export type StatusColorSetting = {
  value: string;
  type: 'status' | 'state';
  tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral';
  bg_color?: string;
  text_color?: string;
  border_color?: string;
};

export const statusColorStorage = {
  async getAll(): Promise<StatusColorSetting[]> {
    return IndexedDBStorage.getAll<StatusColorSetting>(STORES.STATUS_COLORS);
  },

  async get(value: string, type: 'status' | 'state'): Promise<StatusColorSetting | null> {
    return IndexedDBStorage.get<StatusColorSetting>(STORES.STATUS_COLORS, [value, type]);
  },

  async getByType(type: 'status' | 'state'): Promise<StatusColorSetting[]> {
    return IndexedDBStorage.getByIndex<StatusColorSetting>(STORES.STATUS_COLORS, 'type', type);
  },

  async save(setting: StatusColorSetting): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.STATUS_COLORS, setting);
      return true;
    } catch (error) {
      console.error('Error saving status color:', error);
      return false;
    }
  },

  async saveAll(settings: StatusColorSetting[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.STATUS_COLORS, settings);
      return true;
    } catch (error) {
      console.error('Error saving status colors:', error);
      return false;
    }
  },

  async delete(value: string, type: 'status' | 'state'): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.STATUS_COLORS, [value, type]);
      return true;
    } catch (error) {
      console.error('Error deleting status color:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await IndexedDBStorage.clear(STORES.STATUS_COLORS);
      return true;
    } catch (error) {
      console.error('Error clearing status colors:', error);
      return false;
    }
  },
};

/**
 * Pieces/Inventory Storage
 */
import type { InventoryItem } from '@/lib/inventory/types';

export const piecesStorage = {
  async getAll(): Promise<InventoryItem[]> {
    return IndexedDBStorage.getAll<InventoryItem>(STORES.PIECES);
  },

  async get(id: string | number): Promise<InventoryItem | null> {
    return IndexedDBStorage.get<InventoryItem>(STORES.PIECES, id);
  },

  async getByTurbine(turbine: string): Promise<InventoryItem[]> {
    return IndexedDBStorage.getByIndex<InventoryItem>(STORES.PIECES, 'turbine', turbine);
  },

  async getByComponent(component: string): Promise<InventoryItem[]> {
    return IndexedDBStorage.getByIndex<InventoryItem>(STORES.PIECES, 'component', component);
  },

  async save(piece: InventoryItem): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.PIECES, piece);
      return true;
    } catch (error) {
      console.error('Error saving piece:', error);
      return false;
    }
  },

  async saveAll(pieces: InventoryItem[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.PIECES, pieces);
      return true;
    } catch (error) {
      console.error('Error saving pieces:', error);
      return false;
    }
  },

  async delete(id: string | number): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.PIECES, id);
      return true;
    } catch (error) {
      console.error('Error deleting piece:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await IndexedDBStorage.clear(STORES.PIECES);
      return true;
    } catch (error) {
      console.error('Error clearing pieces:', error);
      return false;
    }
  },

  async count(): Promise<number> {
    return IndexedDBStorage.count(STORES.PIECES);
  },

  /**
   * Assign sequential positions to all pieces grouped by component.
   * Pieces within each component will be assigned positions 1, 2, 3, etc.
   * 
   * @param options - Optional configuration
   * @param options.positionFormat - Format for positions: 'number' (1, 2, 3) or 'string' ('1', '2', '3') or 'descriptive' ('Position 1', 'Position 2')
   * @param options.overwriteExisting - If true, overwrite existing positions. If false, skip pieces that already have positions.
   * @returns Object with success status, total pieces processed, and pieces updated
   */
  async assignPositionsByComponent(options?: {
    positionFormat?: 'number' | 'string' | 'descriptive';
    overwriteExisting?: boolean;
  }): Promise<{
    success: boolean;
    totalPieces: number;
    piecesUpdated: number;
    componentsProcessed: number;
    error?: string;
  }> {
    try {
      const format = options?.positionFormat || 'string';
      const overwrite = options?.overwriteExisting ?? true;

      // Get all pieces
      const allPieces = await this.getAll();

      if (allPieces.length === 0) {
        return {
          success: true,
          totalPieces: 0,
          piecesUpdated: 0,
          componentsProcessed: 0,
        };
      }

      // Group pieces by component
      const componentMap = new Map<string, InventoryItem[]>();
      
      allPieces.forEach(piece => {
        const componentName = piece.component;
        if (!componentName) {
          // Skip pieces without a component
          return;
        }

        if (!componentMap.has(componentName)) {
          componentMap.set(componentName, []);
        }
        componentMap.get(componentName)!.push(piece);
      });

      // Assign positions to pieces within each component
      const updatedPieces: InventoryItem[] = [];
      let piecesUpdated = 0;

      componentMap.forEach((pieces, componentName) => {
        // Sort pieces by SN or ID for consistent ordering
        const sortedPieces = [...pieces].sort((a, b) => {
          const aKey = a.sn || String(a.id || a.pn || '');
          const bKey = b.sn || String(b.id || b.pn || '');
          return aKey.localeCompare(bKey);
        });

        sortedPieces.forEach((piece, index) => {
          // Skip if piece already has a position and we're not overwriting
          if (!overwrite && piece.position && piece.position.trim() !== '') {
            return;
          }

          // Assign position based on format
          let position: string;
          switch (format) {
            case 'number':
              position = String(index + 1);
              break;
            case 'descriptive':
              position = `Position ${index + 1}`;
              break;
            case 'string':
            default:
              position = String(index + 1);
              break;
          }

          // Update piece with new position
          const updatedPiece: InventoryItem = {
            ...piece,
            position,
          };

          updatedPieces.push(updatedPiece);
          piecesUpdated++;
        });
      });

      // Save all updated pieces
      if (updatedPieces.length > 0) {
        const saveSuccess = await this.saveAll(updatedPieces);
        
        if (!saveSuccess) {
          return {
            success: false,
            totalPieces: allPieces.length,
            piecesUpdated: 0,
            componentsProcessed: componentMap.size,
            error: 'Failed to save updated pieces to database',
          };
        }
      }

      return {
        success: true,
        totalPieces: allPieces.length,
        piecesUpdated,
        componentsProcessed: componentMap.size,
      };
    } catch (error) {
      console.error('Error assigning positions to pieces:', error);
      return {
        success: false,
        totalPieces: 0,
        piecesUpdated: 0,
        componentsProcessed: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  },
};

/**
 * Components Storage
 */
export type Component = {
  id?: string | number;
  name: string;
  type: string;
  componentType?: string;
  turbine?: string;
  hours?: number;
  trips?: number;
  starts?: number;
  status?: string;
  state?: string;
  [key: string]: any;
};

export const componentsStorage = {
  async getAll(): Promise<Component[]> {
    return IndexedDBStorage.getAll<Component>(STORES.COMPONENTS);
  },

  async get(id: string | number): Promise<Component | null> {
    return IndexedDBStorage.get<Component>(STORES.COMPONENTS, id);
  },

  async getByType(type: string): Promise<Component[]> {
    return IndexedDBStorage.getByIndex<Component>(STORES.COMPONENTS, 'type', type);
  },

  async save(component: Component): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.COMPONENTS, component);
      return true;
    } catch (error) {
      console.error('Error saving component:', error);
      return false;
    }
  },

  async saveAll(components: Component[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.COMPONENTS, components);
      return true;
    } catch (error) {
      console.error('Error saving components:', error);
      return false;
    }
  },

  async delete(id: string | number): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.COMPONENTS, id);
      return true;
    } catch (error) {
      console.error('Error deleting component:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await IndexedDBStorage.clear(STORES.COMPONENTS);
      return true;
    } catch (error) {
      console.error('Error clearing components:', error);
      return false;
    }
  },
};

// Export the base IndexedDBStorage for other use cases
export { IndexedDBStorage, getDB };

