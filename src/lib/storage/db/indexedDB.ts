/**
 * IndexedDB Database Schema - Version 2
 * Normalized relational structure matching SQL schema
 * 
 * Database: "repairview_db"
 * Version: 2
 */

const DB_NAME = 'repairview_db';
const DB_VERSION = 2; // Updated from version 1

// Object store names
export const STORES = {
  // Core entities
  PLANTS: 'plants',
  PLANT_CONTACTS: 'plant_contacts',
  TURBINES: 'turbines',
  
  // Turbine metrics
  TURBINE_METRIC_TYPES: 'turbine_metric_types',
  TURBINE_OPERATIONAL_METRICS: 'turbine_operational_metrics',
  
  // Components & pieces
  COMPONENT_TYPES: 'component_types',
  COMPONENTS: 'components',
  USE_STATUS: 'use_status',
  CONDITION_CODES: 'condition_codes',
  PRODUCTS: 'products',
  PIECES: 'pieces',
  
  // Junction tables
  COMPONENT_PIECES: 'component_pieces',
  COMPONENT_ASSIGNMENTS: 'component_assignments',
  
  // Notes
  NOTES: 'notes',
  NOTE_LINKS: 'note_links',
  
  // Outages
  OUTAGE_EVENTS: 'outage_events',
  OUTAGES: 'outages',
  
  // Repair orders
  REPAIR_ORDERS: 'repair_orders',
  REPAIR_LINE_ITEMS: 'repair_line_items',
  
  // UI settings
  STATUS_COLORS: 'status_colors',
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
      const oldVersion = event.oldVersion;

      // If upgrading from version 1, delete old stores
      if (oldVersion < 2) {
        // Delete old stores
        const oldStores = ['pieces', 'components', 'turbines', 'sites', 'repair_events'];
        oldStores.forEach(storeName => {
          if (db.objectStoreNames.contains(storeName)) {
            db.deleteObjectStore(storeName);
          }
        });
      }

      // Create all new object stores
      
      // PLANTS
      if (!db.objectStoreNames.contains(STORES.PLANTS)) {
        const store = db.createObjectStore(STORES.PLANTS, { keyPath: 'id' });
        store.createIndex('name', 'name', { unique: true });
      }

      // PLANT_CONTACTS
      if (!db.objectStoreNames.contains(STORES.PLANT_CONTACTS)) {
        const store = db.createObjectStore(STORES.PLANT_CONTACTS, { keyPath: 'id' });
        store.createIndex('plant_id', 'plant_id', { unique: false });
      }

      // TURBINES
      if (!db.objectStoreNames.contains(STORES.TURBINES)) {
        const store = db.createObjectStore(STORES.TURBINES, { keyPath: 'id' });
        store.createIndex('plant_id', 'plant_id', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }

      // TURBINE_METRIC_TYPES
      if (!db.objectStoreNames.contains(STORES.TURBINE_METRIC_TYPES)) {
        const store = db.createObjectStore(STORES.TURBINE_METRIC_TYPES, { keyPath: 'code' });
      }

      // TURBINE_OPERATIONAL_METRICS
      if (!db.objectStoreNames.contains(STORES.TURBINE_OPERATIONAL_METRICS)) {
        const store = db.createObjectStore(STORES.TURBINE_OPERATIONAL_METRICS, { keyPath: 'id' });
        store.createIndex('turbine_id', 'turbine_id', { unique: false });
        store.createIndex('metric_type_code', 'metric_type_code', { unique: false });
        store.createIndex('turbine_metric', ['turbine_id', 'metric_type_code'], { unique: true });
      }

      // COMPONENT_TYPES
      if (!db.objectStoreNames.contains(STORES.COMPONENT_TYPES)) {
        const store = db.createObjectStore(STORES.COMPONENT_TYPES, { keyPath: 'code' });
      }

      // COMPONENTS
      if (!db.objectStoreNames.contains(STORES.COMPONENTS)) {
        const store = db.createObjectStore(STORES.COMPONENTS, { keyPath: 'id' });
        store.createIndex('type_code', 'type_code', { unique: false });
        store.createIndex('name', 'name', { unique: false });
      }

      // USE_STATUS
      if (!db.objectStoreNames.contains(STORES.USE_STATUS)) {
        const store = db.createObjectStore(STORES.USE_STATUS, { keyPath: 'code' });
      }

      // CONDITION_CODES
      if (!db.objectStoreNames.contains(STORES.CONDITION_CODES)) {
        const store = db.createObjectStore(STORES.CONDITION_CODES, { keyPath: 'code' });
      }

      // PRODUCTS
      if (!db.objectStoreNames.contains(STORES.PRODUCTS)) {
        const store = db.createObjectStore(STORES.PRODUCTS, { keyPath: 'id' });
        store.createIndex('part_number', 'part_number', { unique: true });
      }

      // PIECES
      if (!db.objectStoreNames.contains(STORES.PIECES)) {
        const store = db.createObjectStore(STORES.PIECES, { keyPath: 'id' });
        store.createIndex('sn', 'sn', { unique: true });
        store.createIndex('product_id', 'product_id', { unique: false });
        store.createIndex('use_status_code', 'use_status_code', { unique: false });
        store.createIndex('condition_code', 'condition_code', { unique: false });
      }

      // COMPONENT_PIECES (junction table)
      if (!db.objectStoreNames.contains(STORES.COMPONENT_PIECES)) {
        const store = db.createObjectStore(STORES.COMPONENT_PIECES, { keyPath: 'id' });
        store.createIndex('component_id', 'component_id', { unique: false });
        store.createIndex('piece_id', 'piece_id', { unique: false });
        store.createIndex('component_position', ['component_id', 'position'], { unique: false });
      }

      // COMPONENT_ASSIGNMENTS (junction table)
      if (!db.objectStoreNames.contains(STORES.COMPONENT_ASSIGNMENTS)) {
        const store = db.createObjectStore(STORES.COMPONENT_ASSIGNMENTS, { keyPath: 'id' });
        store.createIndex('turbine_id', 'turbine_id', { unique: false });
        store.createIndex('component_id', 'component_id', { unique: false });
        store.createIndex('turbine_position', ['turbine_id', 'position'], { unique: false });
      }

      // NOTES
      if (!db.objectStoreNames.contains(STORES.NOTES)) {
        const store = db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
        store.createIndex('note_type', 'note_type', { unique: false });
      }

      // NOTE_LINKS
      if (!db.objectStoreNames.contains(STORES.NOTE_LINKS)) {
        const store = db.createObjectStore(STORES.NOTE_LINKS, { keyPath: 'id' });
        store.createIndex('note_id', 'note_id', { unique: false });
        store.createIndex('entity', ['entity_table', 'entity_id'], { unique: false });
      }

      // OUTAGE_EVENTS
      if (!db.objectStoreNames.contains(STORES.OUTAGE_EVENTS)) {
        const store = db.createObjectStore(STORES.OUTAGE_EVENTS, { keyPath: 'code' });
      }

      // OUTAGES
      if (!db.objectStoreNames.contains(STORES.OUTAGES)) {
        const store = db.createObjectStore(STORES.OUTAGES, { keyPath: 'id' });
        store.createIndex('turbine_id', 'turbine_id', { unique: false });
        store.createIndex('event_code', 'event_code', { unique: false });
      }

      // REPAIR_ORDERS
      if (!db.objectStoreNames.contains(STORES.REPAIR_ORDERS)) {
        const store = db.createObjectStore(STORES.REPAIR_ORDERS, { keyPath: 'id' });
        store.createIndex('repair_number', 'repair_number', { unique: true });
      }

      // REPAIR_LINE_ITEMS
      if (!db.objectStoreNames.contains(STORES.REPAIR_LINE_ITEMS)) {
        const store = db.createObjectStore(STORES.REPAIR_LINE_ITEMS, { keyPath: 'id' });
        store.createIndex('repair_order_id', 'repair_order_id', { unique: false });
        store.createIndex('piece_id', 'piece_id', { unique: false });
        store.createIndex('order_piece', ['repair_order_id', 'piece_id'], { unique: true });
      }

      // STATUS_COLORS
      if (!db.objectStoreNames.contains(STORES.STATUS_COLORS)) {
        const store = db.createObjectStore(STORES.STATUS_COLORS, { keyPath: ['value', 'type'] });
        store.createIndex('type', 'type', { unique: false });
      }
    };
  });
}

/**
 * Generic IndexedDB operations
 */
export class IndexedDBStorage {
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
   * Get items by compound index
   */
  static async getByCompoundIndex<T>(
    storeName: StoreName,
    indexName: string,
    values: IDBValidKey[]
  ): Promise<T[]> {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);
      const request = index.getAll(values);

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

// Export for use in other modules
export { getDB, STORES };
export type { StoreName };

