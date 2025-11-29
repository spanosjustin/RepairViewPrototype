/**
 * Database Type Definitions
 * Matches the SQL schema structure
 */

export type ID = string;

// ============================================
// CORE ENTITIES
// ============================================

export type Plant = {
  id: ID;
  name: string;
  address?: string;
  location?: string;
  total_capacity?: string;
  operational_status?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
};

export type PlantContact = {
  id: ID;
  plant_id: ID;
  name: string;
  title?: string;
  phone?: string;
  email?: string;
  created_at: string;
};

export type Turbine = {
  id: ID;
  plant_id: ID;
  name: string;
  unit?: string;
  created_at: string;
  updated_at: string;
};

// ============================================
// TURBINE OPERATIONAL METRICS
// ============================================

export type TurbineMetricType = {
  code: string; // 'hours', 'trips', 'starts'
  name: string;
  unit?: string;
  description?: string;
};

export type TurbineOperationalMetric = {
  id: ID;
  turbine_id: ID;
  metric_type_code: string;
  actual_value: number;
  target_value: number;
  interval_value: number;
  remaining_value: number; // calculated: target - actual
  status_note?: string;
  last_updated_at: string;
  created_at: string;
};

// ============================================
// COMPONENTS & PIECES
// ============================================

export type ComponentType = {
  code: string; // 'LinerCaps', 'CombLiners', etc.
  name: string;
  description?: string;
};

export type Component = {
  id: ID;
  name: string;
  type_code: string; // references ComponentType.code
  created_at: string;
};

export type UseStatus = {
  code: string;
  name: string;
  description?: string;
  severity?: number;
};

export type ConditionCode = {
  code: string;
  name: string;
  description?: string;
};

export type Product = {
  id: ID;
  part_number: string;
  name?: string;
  description?: string;
  created_at: string;
};

export type Piece = {
  id: ID;
  sn: string; // Serial Number (unique)
  product_id: ID;
  pn?: string; // Part Number (can match product.part_number)
  use_status_code?: string; // references UseStatus.code
  condition_code?: string; // references ConditionCode.code
  hours: number;
  trips: number;
  starts: number;
  created_at: string;
  updated_at: string;
};

// ============================================
// JUNCTION TABLES (Temporal Relationships)
// ============================================

export type ComponentPiece = {
  id: ID;
  component_id: ID;
  piece_id: ID;
  position: number; // Position within component (1, 2, 3, etc.)
  valid_from: string; // SET IN date
  valid_to?: string; // SET OUT date (null = currently in component)
  created_at: string;
};

export type ComponentAssignment = {
  id: ID;
  turbine_id: ID;
  component_id: ID;
  position: number; // Position on turbine (1, 2, 3, etc.)
  valid_from: string; // SET IN date
  valid_to?: string; // SET OUT date (null = currently on turbine)
  created_at: string;
};

// ============================================
// NOTES (Polymorphic)
// ============================================

export type Note = {
  id: ID;
  note_type: string; // 'repair', 'condition', 'outage', etc.
  body: string;
  created_at: string;
  created_by?: string;
};

export type NoteLink = {
  id: ID;
  note_id: ID;
  entity_table: string; // 'turbine', 'piece', 'component', etc.
  entity_id: ID;
  created_at: string;
};

// ============================================
// OUTAGES
// ============================================

export type OutageEvent = {
  code: string; // e.g., 'AMI-25'
  name: string;
  description?: string;
};

export type Outage = {
  id: ID;
  turbine_id: ID;
  event_code: string; // references OutageEvent.code
  started_at: string;
  ended_at?: string; // null if ongoing
  created_at: string;
};

// ============================================
// REPAIR ORDERS
// ============================================

export type RepairOrder = {
  id: ID;
  repair_number: string; // unique
  repair_company?: string;
  opened_at: string;
  closed_at?: string;
  created_at: string;
};

export type RepairLineItem = {
  id: ID;
  repair_order_id: ID;
  piece_id: ID;
  note?: string;
  created_at: string;
};

// ============================================
// UI SETTINGS
// ============================================

export type StatusColorSetting = {
  value: string; // e.g., "OK", "In Service"
  type: 'status' | 'state';
  tone: 'ok' | 'warn' | 'bad' | 'info' | 'neutral';
  bg_color?: string;
  text_color?: string;
  border_color?: string;
};

// ============================================
// HELPER TYPES
// ============================================

export type TurbineWithComponents = Turbine & {
  components: (Component & {
    type: ComponentType;
    pieces: (Piece & {
      product: Product;
      use_status?: UseStatus;
      condition?: ConditionCode;
      position: number;
      set_in_date: string;
    })[];
    position: number;
    set_in_date: string;
  })[];
  metrics: TurbineOperationalMetric[];
  plant: Plant;
};

export type ComponentWithPieces = Component & {
  type: ComponentType;
  pieces: (Piece & {
    product: Product;
    use_status?: UseStatus;
    condition?: ConditionCode;
    position: number;
    set_in_date: string;
  })[];
  current_turbine?: Turbine & {
    position: number;
    set_in_date: string;
  };
};

export type PieceWithComponent = Piece & {
  product: Product;
  use_status?: UseStatus;
  condition?: ConditionCode;
  current_component?: Component & {
    type: ComponentType;
    position: number;
    set_in_date: string;
  };
  current_turbine?: Turbine;
};

