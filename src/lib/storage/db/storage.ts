/**
 * Storage functions for all database tables
 * Low-level CRUD operations
 */

import { IndexedDBStorage, STORES } from './indexedDB';
import type {
  Plant,
  PlantContact,
  Turbine,
  TurbineMetricType,
  TurbineOperationalMetric,
  ComponentType,
  Component,
  UseStatus,
  ConditionCode,
  Product,
  Piece,
  ComponentPiece,
  ComponentAssignment,
  Note,
  NoteLink,
  OutageEvent,
  Outage,
  RepairOrder,
  RepairLineItem,
  StatusColorSetting,
} from './types';

// ============================================
// PLANT STORAGE
// ============================================

export const plantStorage = {
  async getAll(): Promise<Plant[]> {
    return IndexedDBStorage.getAll<Plant>(STORES.PLANTS);
  },

  async get(id: string): Promise<Plant | null> {
    return IndexedDBStorage.get<Plant>(STORES.PLANTS, id);
  },

  async save(plant: Plant): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.PLANTS, plant);
      return true;
    } catch (error) {
      console.error('Error saving plant:', error);
      return false;
    }
  },

  async saveAll(plants: Plant[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.PLANTS, plants);
      return true;
    } catch (error) {
      console.error('Error saving plants:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.PLANTS, id);
      return true;
    } catch (error) {
      console.error('Error deleting plant:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await IndexedDBStorage.clear(STORES.PLANTS);
      return true;
    } catch (error) {
      console.error('Error clearing plants:', error);
      return false;
    }
  },
};

// ============================================
// PLANT CONTACT STORAGE
// ============================================

export const plantContactStorage = {
  async getAll(): Promise<PlantContact[]> {
    return IndexedDBStorage.getAll<PlantContact>(STORES.PLANT_CONTACTS);
  },

  async get(id: string): Promise<PlantContact | null> {
    return IndexedDBStorage.get<PlantContact>(STORES.PLANT_CONTACTS, id);
  },

  async getByPlant(plantId: string): Promise<PlantContact[]> {
    return IndexedDBStorage.getByIndex<PlantContact>(STORES.PLANT_CONTACTS, 'plant_id', plantId);
  },

  async save(contact: PlantContact): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.PLANT_CONTACTS, contact);
      return true;
    } catch (error) {
      console.error('Error saving plant contact:', error);
      return false;
    }
  },

  async saveAll(contacts: PlantContact[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.PLANT_CONTACTS, contacts);
      return true;
    } catch (error) {
      console.error('Error saving plant contacts:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.PLANT_CONTACTS, id);
      return true;
    } catch (error) {
      console.error('Error deleting plant contact:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await IndexedDBStorage.clear(STORES.PLANT_CONTACTS);
      return true;
    } catch (error) {
      console.error('Error clearing plant contacts:', error);
      return false;
    }
  },
};

// ============================================
// TURBINE STORAGE
// ============================================

export const turbineStorage = {
  async getAll(): Promise<Turbine[]> {
    return IndexedDBStorage.getAll<Turbine>(STORES.TURBINES);
  },

  async get(id: string): Promise<Turbine | null> {
    return IndexedDBStorage.get<Turbine>(STORES.TURBINES, id);
  },

  async getByPlant(plantId: string): Promise<Turbine[]> {
    return IndexedDBStorage.getByIndex<Turbine>(STORES.TURBINES, 'plant_id', plantId);
  },

  async save(turbine: Turbine): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.TURBINES, turbine);
      return true;
    } catch (error) {
      console.error('Error saving turbine:', error);
      return false;
    }
  },

  async saveAll(turbines: Turbine[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.TURBINES, turbines);
      return true;
    } catch (error) {
      console.error('Error saving turbines:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.TURBINES, id);
      return true;
    } catch (error) {
      console.error('Error deleting turbine:', error);
      return false;
    }
  },

  async clear(): Promise<boolean> {
    try {
      await IndexedDBStorage.clear(STORES.TURBINES);
      return true;
    } catch (error) {
      console.error('Error clearing turbines:', error);
      return false;
    }
  },
};

// ============================================
// TURBINE METRIC TYPE STORAGE
// ============================================

export const turbineMetricTypeStorage = {
  async getAll(): Promise<TurbineMetricType[]> {
    return IndexedDBStorage.getAll<TurbineMetricType>(STORES.TURBINE_METRIC_TYPES);
  },

  async get(code: string): Promise<TurbineMetricType | null> {
    return IndexedDBStorage.get<TurbineMetricType>(STORES.TURBINE_METRIC_TYPES, code);
  },

  async save(metricType: TurbineMetricType): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.TURBINE_METRIC_TYPES, metricType);
      return true;
    } catch (error) {
      console.error('Error saving turbine metric type:', error);
      return false;
    }
  },

  async saveAll(metricTypes: TurbineMetricType[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.TURBINE_METRIC_TYPES, metricTypes);
      return true;
    } catch (error) {
      console.error('Error saving turbine metric types:', error);
      return false;
    }
  },
};

// ============================================
// TURBINE OPERATIONAL METRIC STORAGE
// ============================================

export const turbineOperationalMetricStorage = {
  async getAll(): Promise<TurbineOperationalMetric[]> {
    return IndexedDBStorage.getAll<TurbineOperationalMetric>(STORES.TURBINE_OPERATIONAL_METRICS);
  },

  async get(id: string): Promise<TurbineOperationalMetric | null> {
    return IndexedDBStorage.get<TurbineOperationalMetric>(STORES.TURBINE_OPERATIONAL_METRICS, id);
  },

  async getByTurbine(turbineId: string): Promise<TurbineOperationalMetric[]> {
    return IndexedDBStorage.getByIndex<TurbineOperationalMetric>(
      STORES.TURBINE_OPERATIONAL_METRICS,
      'turbine_id',
      turbineId
    );
  },

  async getByTurbineAndType(
    turbineId: string,
    metricTypeCode: string
  ): Promise<TurbineOperationalMetric | null> {
    const results = await IndexedDBStorage.getByCompoundIndex<TurbineOperationalMetric>(
      STORES.TURBINE_OPERATIONAL_METRICS,
      'turbine_metric',
      [turbineId, metricTypeCode]
    );
    return results[0] || null;
  },

  async save(metric: TurbineOperationalMetric): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.TURBINE_OPERATIONAL_METRICS, metric);
      return true;
    } catch (error) {
      console.error('Error saving turbine operational metric:', error);
      return false;
    }
  },

  async saveAll(metrics: TurbineOperationalMetric[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.TURBINE_OPERATIONAL_METRICS, metrics);
      return true;
    } catch (error) {
      console.error('Error saving turbine operational metrics:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.TURBINE_OPERATIONAL_METRICS, id);
      return true;
    } catch (error) {
      console.error('Error deleting turbine operational metric:', error);
      return false;
    }
  },
};

// ============================================
// COMPONENT TYPE STORAGE
// ============================================

export const componentTypeStorage = {
  async getAll(): Promise<ComponentType[]> {
    return IndexedDBStorage.getAll<ComponentType>(STORES.COMPONENT_TYPES);
  },

  async get(code: string): Promise<ComponentType | null> {
    return IndexedDBStorage.get<ComponentType>(STORES.COMPONENT_TYPES, code);
  },

  async save(componentType: ComponentType): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.COMPONENT_TYPES, componentType);
      return true;
    } catch (error) {
      console.error('Error saving component type:', error);
      return false;
    }
  },

  async saveAll(componentTypes: ComponentType[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.COMPONENT_TYPES, componentTypes);
      return true;
    } catch (error) {
      console.error('Error saving component types:', error);
      return false;
    }
  },
};

// ============================================
// COMPONENT STORAGE
// ============================================

export const componentStorage = {
  async getAll(): Promise<Component[]> {
    return IndexedDBStorage.getAll<Component>(STORES.COMPONENTS);
  },

  async get(id: string): Promise<Component | null> {
    return IndexedDBStorage.get<Component>(STORES.COMPONENTS, id);
  },

  async getByType(typeCode: string): Promise<Component[]> {
    return IndexedDBStorage.getByIndex<Component>(STORES.COMPONENTS, 'type_code', typeCode);
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

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.COMPONENTS, id);
      return true;
    } catch (error) {
      console.error('Error deleting component:', error);
      return false;
    }
  },
};

// ============================================
// USE STATUS STORAGE
// ============================================

export const useStatusStorage = {
  async getAll(): Promise<UseStatus[]> {
    return IndexedDBStorage.getAll<UseStatus>(STORES.USE_STATUS);
  },

  async get(code: string): Promise<UseStatus | null> {
    return IndexedDBStorage.get<UseStatus>(STORES.USE_STATUS, code);
  },

  async saveAll(statuses: UseStatus[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.USE_STATUS, statuses);
      return true;
    } catch (error) {
      console.error('Error saving use statuses:', error);
      return false;
    }
  },
};

// ============================================
// CONDITION CODE STORAGE
// ============================================

export const conditionCodeStorage = {
  async getAll(): Promise<ConditionCode[]> {
    return IndexedDBStorage.getAll<ConditionCode>(STORES.CONDITION_CODES);
  },

  async get(code: string): Promise<ConditionCode | null> {
    return IndexedDBStorage.get<ConditionCode>(STORES.CONDITION_CODES, code);
  },

  async saveAll(codes: ConditionCode[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.CONDITION_CODES, codes);
      return true;
    } catch (error) {
      console.error('Error saving condition codes:', error);
      return false;
    }
  },
};

// ============================================
// PRODUCT STORAGE
// ============================================

export const productStorage = {
  async getAll(): Promise<Product[]> {
    return IndexedDBStorage.getAll<Product>(STORES.PRODUCTS);
  },

  async get(id: string): Promise<Product | null> {
    return IndexedDBStorage.get<Product>(STORES.PRODUCTS, id);
  },

  async getByPartNumber(partNumber: string): Promise<Product | null> {
    const results = await IndexedDBStorage.getByIndex<Product>(
      STORES.PRODUCTS,
      'part_number',
      partNumber
    );
    return results[0] || null;
  },

  async save(product: Product): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.PRODUCTS, product);
      return true;
    } catch (error) {
      console.error('Error saving product:', error);
      return false;
    }
  },

  async saveAll(products: Product[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.PRODUCTS, products);
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.PRODUCTS, id);
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },
};

// ============================================
// PIECE STORAGE
// ============================================

export const pieceStorage = {
  async getAll(): Promise<Piece[]> {
    return IndexedDBStorage.getAll<Piece>(STORES.PIECES);
  },

  async get(id: string): Promise<Piece | null> {
    return IndexedDBStorage.get<Piece>(STORES.PIECES, id);
  },

  async getBySerialNumber(sn: string): Promise<Piece | null> {
    const results = await IndexedDBStorage.getByIndex<Piece>(STORES.PIECES, 'sn', sn);
    return results[0] || null;
  },

  async getByProduct(productId: string): Promise<Piece[]> {
    return IndexedDBStorage.getByIndex<Piece>(STORES.PIECES, 'product_id', productId);
  },

  async save(piece: Piece): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.PIECES, piece);
      return true;
    } catch (error) {
      console.error('Error saving piece:', error);
      return false;
    }
  },

  async saveAll(pieces: Piece[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.PIECES, pieces);
      return true;
    } catch (error) {
      console.error('Error saving pieces:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.PIECES, id);
      return true;
    } catch (error) {
      console.error('Error deleting piece:', error);
      return false;
    }
  },
};

// ============================================
// COMPONENT PIECE STORAGE (Junction Table)
// ============================================

export const componentPieceStorage = {
  async getAll(): Promise<ComponentPiece[]> {
    return IndexedDBStorage.getAll<ComponentPiece>(STORES.COMPONENT_PIECES);
  },

  async get(id: string): Promise<ComponentPiece | null> {
    return IndexedDBStorage.get<ComponentPiece>(STORES.COMPONENT_PIECES, id);
  },

  async getByComponent(componentId: string): Promise<ComponentPiece[]> {
    return IndexedDBStorage.getByIndex<ComponentPiece>(
      STORES.COMPONENT_PIECES,
      'component_id',
      componentId
    );
  },

  async getByPiece(pieceId: string): Promise<ComponentPiece[]> {
    return IndexedDBStorage.getByIndex<ComponentPiece>(
      STORES.COMPONENT_PIECES,
      'piece_id',
      pieceId
    );
  },

  async getCurrentByPiece(pieceId: string): Promise<ComponentPiece | null> {
    const all = await this.getByPiece(pieceId);
    // Find the one with valid_to = null (currently assigned)
    return all.find(cp => !cp.valid_to) || null;
  },

  async getCurrentByComponent(componentId: string): Promise<ComponentPiece[]> {
    const all = await this.getByComponent(componentId);
    // Return only currently assigned pieces (valid_to = null)
    return all.filter(cp => !cp.valid_to);
  },

  async save(componentPiece: ComponentPiece): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.COMPONENT_PIECES, componentPiece);
      return true;
    } catch (error) {
      console.error('Error saving component piece:', error);
      return false;
    }
  },

  async saveAll(componentPieces: ComponentPiece[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.COMPONENT_PIECES, componentPieces);
      return true;
    } catch (error) {
      console.error('Error saving component pieces:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.COMPONENT_PIECES, id);
      return true;
    } catch (error) {
      console.error('Error deleting component piece:', error);
      return false;
    }
  },
};

// ============================================
// COMPONENT ASSIGNMENT STORAGE (Junction Table)
// ============================================

export const componentAssignmentStorage = {
  async getAll(): Promise<ComponentAssignment[]> {
    return IndexedDBStorage.getAll<ComponentAssignment>(STORES.COMPONENT_ASSIGNMENTS);
  },

  async get(id: string): Promise<ComponentAssignment | null> {
    return IndexedDBStorage.get<ComponentAssignment>(STORES.COMPONENT_ASSIGNMENTS, id);
  },

  async getByTurbine(turbineId: string): Promise<ComponentAssignment[]> {
    return IndexedDBStorage.getByIndex<ComponentAssignment>(
      STORES.COMPONENT_ASSIGNMENTS,
      'turbine_id',
      turbineId
    );
  },

  async getByComponent(componentId: string): Promise<ComponentAssignment[]> {
    return IndexedDBStorage.getByIndex<ComponentAssignment>(
      STORES.COMPONENT_ASSIGNMENTS,
      'component_id',
      componentId
    );
  },

  async getCurrentByTurbine(turbineId: string): Promise<ComponentAssignment[]> {
    const all = await this.getByTurbine(turbineId);
    // Return only currently assigned components (valid_to = null)
    return all.filter(ca => !ca.valid_to);
  },

  async getCurrentByComponent(componentId: string): Promise<ComponentAssignment | null> {
    const all = await this.getByComponent(componentId);
    // Find the one with valid_to = null (currently assigned)
    return all.find(ca => !ca.valid_to) || null;
  },

  async save(assignment: ComponentAssignment): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.COMPONENT_ASSIGNMENTS, assignment);
      return true;
    } catch (error) {
      console.error('Error saving component assignment:', error);
      return false;
    }
  },

  async saveAll(assignments: ComponentAssignment[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.COMPONENT_ASSIGNMENTS, assignments);
      return true;
    } catch (error) {
      console.error('Error saving component assignments:', error);
      return false;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await IndexedDBStorage.delete(STORES.COMPONENT_ASSIGNMENTS, id);
      return true;
    } catch (error) {
      console.error('Error deleting component assignment:', error);
      return false;
    }
  },
};

// ============================================
// NOTE STORAGE
// ============================================

export const noteStorage = {
  async getAll(): Promise<Note[]> {
    return IndexedDBStorage.getAll<Note>(STORES.NOTES);
  },

  async get(id: string): Promise<Note | null> {
    return IndexedDBStorage.get<Note>(STORES.NOTES, id);
  },

  async save(note: Note): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.NOTES, note);
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      return false;
    }
  },

  async saveAll(notes: Note[]): Promise<boolean> {
    try {
      await IndexedDBStorage.putAll(STORES.NOTES, notes);
      return true;
    } catch (error) {
      console.error('Error saving notes:', error);
      return false;
    }
  },
};

// ============================================
// NOTE LINK STORAGE
// ============================================

export const noteLinkStorage = {
  async getAll(): Promise<NoteLink[]> {
    return IndexedDBStorage.getAll<NoteLink>(STORES.NOTE_LINKS);
  },

  async getByEntity(entityTable: string, entityId: string): Promise<NoteLink[]> {
    return IndexedDBStorage.getByCompoundIndex<NoteLink>(
      STORES.NOTE_LINKS,
      'entity',
      [entityTable, entityId]
    );
  },

  async save(noteLink: NoteLink): Promise<boolean> {
    try {
      await IndexedDBStorage.put(STORES.NOTE_LINKS, noteLink);
      return true;
    } catch (error) {
      console.error('Error saving note link:', error);
      return false;
    }
  },
};

// ============================================
// STATUS COLOR STORAGE
// ============================================

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
};

