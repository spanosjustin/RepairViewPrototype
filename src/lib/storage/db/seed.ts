/**
 * Seed functions to populate database from mock data
 * Transforms mock data into normalized database structure
 */

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
} from './types';

import {
  plantStorage,
  plantContactStorage,
  turbineStorage,
  turbineMetricTypeStorage,
  turbineOperationalMetricStorage,
  componentTypeStorage,
  componentStorage,
  useStatusStorage,
  conditionCodeStorage,
  productStorage,
  pieceStorage,
  componentPieceStorage,
  componentAssignmentStorage,
} from './storage';

import { MOCK_TURBINES } from '@/lib/matrix/mock';
import { MOCK_INVENTORY } from '@/lib/inventory/mock';
import { MOCK_SITES } from '@/lib/sites/mock';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate random date within last N years
 */
function randomDateInPastYears(years: number = 2): string {
  const now = new Date();
  const yearsAgo = now.getFullYear() - years;
  const start = new Date(yearsAgo, 0, 1);
  const end = now;
  const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
  return new Date(randomTime).toISOString();
}

/**
 * Generate UUID using crypto.randomUUID()
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================
// SEED LOOKUP TABLES
// ============================================

export async function seedTurbineMetricTypes(): Promise<void> {
  const metricTypes: TurbineMetricType[] = [
    { code: 'hours', name: 'Operating Hours', unit: 'hours', description: 'Total operating hours since install' },
    { code: 'trips', name: 'Trips', unit: 'count', description: 'Number of emergency shutdowns' },
    { code: 'starts', name: 'Starts', unit: 'count', description: 'Number of start cycles' },
  ];

  await turbineMetricTypeStorage.saveAll(metricTypes);
}

export async function seedComponentTypes(): Promise<void> {
  const componentTypes: ComponentType[] = [
    { code: 'FuelNozzles', name: 'Fuel Nozzles', description: 'Fuel injection nozzles' },
    { code: 'LinerCaps', name: 'Liner Caps', description: 'Combustor liner caps' },
    { code: 'CombLiners', name: 'Comb Liners', description: 'Combustion liners' },
    { code: 'TranPRC', name: 'Tran PRC', description: 'Transition piece pressure regulator' },
    { code: 'S1N', name: 'S1N', description: 'Stage 1 Nozzle' },
    { code: 'S2N', name: 'S2N', description: 'Stage 2 Nozzle' },
    { code: 'S3N', name: 'S3N', description: 'Stage 3 Nozzle' },
    { code: 'S1S', name: 'S1S', description: 'Stage 1 Stator' },
    { code: 'S2S', name: 'S2S', description: 'Stage 2 Stator' },
    { code: 'S3S', name: 'S3S', description: 'Stage 3 Stator' },
    { code: 'S1B', name: 'S1B', description: 'Stage 1 Blade' },
    { code: 'S2B', name: 'S2B', description: 'Stage 2 Blade' },
    { code: 'S3B', name: 'S3B', description: 'Stage 3 Blade' },
    { code: 'Rotor', name: 'Rotor', description: 'Rotor assembly' },
  ];

  await componentTypeStorage.saveAll(componentTypes);
}

export async function seedUseStatus(): Promise<void> {
  const statuses: UseStatus[] = [
    { code: 'OK', name: 'OK', description: 'Component in good condition', severity: 1 },
    { code: 'Spare', name: 'Spare', description: 'Spare part', severity: 2 },
    { code: 'Unknown', name: 'Unknown', description: 'Status unknown', severity: 3 },
    { code: 'Monitor', name: 'Monitor', description: 'Monitor for changes', severity: 4 },
    { code: 'Degraded', name: 'Degraded', description: 'Performance degraded', severity: 5 },
    { code: 'ReplaceSoon', name: 'Replace Soon', description: 'Plan for replacement', severity: 6 },
    { code: 'ReplaceNow', name: 'Replace Now', description: 'Immediate replacement required', severity: 7 },
  ];

  await useStatusStorage.saveAll(statuses);
}

export async function seedConditionCodes(): Promise<void> {
  const codes: ConditionCode[] = [
    { code: 'InService', name: 'In Service', description: 'Currently in use' },
    { code: 'OutService', name: 'Out of Service', description: 'Not currently in use' },
    { code: 'Standby', name: 'Standby', description: 'Available but not active' },
    { code: 'Repair', name: 'Repair', description: 'Currently being repaired' },
    { code: 'OnOrder', name: 'On Order', description: 'Ordered but not received' },
  ];

  await conditionCodeStorage.saveAll(codes);
}

// ============================================
// SEED CORE ENTITIES
// ============================================

export async function seedPlants(): Promise<void> {
  // Create 3 sites with realistic data
  const plants: Plant[] = [
    {
      id: 'site-1',
      name: 'Riverbend Power Plant',
      address: '1234 River Road, Riverside, CA 92501',
      location: 'Riverside, CA',
      total_capacity: '450 MW',
      operational_status: 'operational',
      created_at: randomDateInPastYears(3),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'site-2',
      name: 'Mountainview Energy Center',
      address: '5678 Mountain View Drive, Denver, CO 80202',
      location: 'Denver, CO',
      total_capacity: '300 MW',
      operational_status: 'operational',
      created_at: randomDateInPastYears(3),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'site-3',
      name: 'Lakeside Generation Facility',
      address: '9012 Lakeshore Boulevard, Chicago, IL 60601',
      location: 'Chicago, IL',
      total_capacity: '675 MW',
      operational_status: 'operational',
      created_at: randomDateInPastYears(3),
      updated_at: new Date().toISOString(),
    },
  ];

  await plantStorage.saveAll(plants);

  // Seed plant contacts (1-2 per site)
  const contacts: PlantContact[] = [
    // Site 1: 2 contacts
    {
      id: generateId(),
      plant_id: 'site-1',
      name: 'John Smith',
      title: 'Plant Manager',
      phone: '(555) 123-4567',
      email: 'john.smith@riverbend.com',
      created_at: randomDateInPastYears(3),
    },
    {
      id: generateId(),
      plant_id: 'site-1',
      name: 'Jane Doe',
      title: 'Operations Supervisor',
      phone: '(555) 123-4568',
      email: 'jane.doe@riverbend.com',
      created_at: randomDateInPastYears(3),
    },
    // Site 2: 1 contact
    {
      id: generateId(),
      plant_id: 'site-2',
      name: 'Sarah Johnson',
      title: 'Operations Director',
      phone: '(555) 987-6543',
      email: 'sarah.johnson@mountainview.com',
      created_at: randomDateInPastYears(3),
    },
    // Site 3: 2 contacts
    {
      id: generateId(),
      plant_id: 'site-3',
      name: 'Michael Chen',
      title: 'Facility Manager',
      phone: '(555) 456-7890',
      email: 'michael.chen@lakeside.com',
      created_at: randomDateInPastYears(3),
    },
    {
      id: generateId(),
      plant_id: 'site-3',
      name: 'Emily Rodriguez',
      title: 'Maintenance Coordinator',
      phone: '(555) 456-7891',
      email: 'emily.rodriguez@lakeside.com',
      created_at: randomDateInPastYears(3),
    },
  ];

  await plantContactStorage.saveAll(contacts);
}

export async function seedTurbines(): Promise<void> {
  // Create turbines: 1-3 per site
  // Site 1: 3 turbines, Site 2: 2 turbines, Site 3: 3 turbines
  const turbines: Turbine[] = [];
  
  // Helper function to generate realistic turbine operational values
  const generateTurbineValues = () => {
    const hours = 15000 + Math.floor(Math.random() * 10000); // 15,000 - 25,000 hours
    const starts = 600 + Math.floor(Math.random() * 600); // 600 - 1,200 starts
    const trips = 100 + Math.floor(Math.random() * 100); // 100 - 200 trips
    return { hours, starts, trips };
  };

  // Site 1: 3 turbines
  const t101 = generateTurbineValues();
  turbines.push({ id: 'T-101', plant_id: 'site-1', name: 'Unit 1A', unit: '1A', ...t101, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });
  
  const t102 = generateTurbineValues();
  turbines.push({ id: 'T-102', plant_id: 'site-1', name: 'Unit 1B', unit: '1B', ...t102, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });
  
  const t103 = generateTurbineValues();
  turbines.push({ id: 'T-103', plant_id: 'site-1', name: 'Unit 1C', unit: '1C', ...t103, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });
  
  // Site 2: 2 turbines
  const t201 = generateTurbineValues();
  turbines.push({ id: 'T-201', plant_id: 'site-2', name: 'Unit 2A', unit: '2A', ...t201, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });
  
  const t202 = generateTurbineValues();
  turbines.push({ id: 'T-202', plant_id: 'site-2', name: 'Unit 2B', unit: '2B', ...t202, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });
  
  // Site 3: 3 turbines
  const t301 = generateTurbineValues();
  turbines.push({ id: 'T-301', plant_id: 'site-3', name: 'Unit 3A', unit: '3A', ...t301, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });
  
  const t302 = generateTurbineValues();
  turbines.push({ id: 'T-302', plant_id: 'site-3', name: 'Unit 3B', unit: '3B', ...t302, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });
  
  const t303 = generateTurbineValues();
  turbines.push({ id: 'T-303', plant_id: 'site-3', name: 'Unit 3C', unit: '3C', ...t303, created_at: randomDateInPastYears(3), updated_at: new Date().toISOString() });

  await turbineStorage.saveAll(turbines);
}

export async function seedTurbineMetrics(): Promise<void> {
  const metrics: TurbineOperationalMetric[] = [];

  // Get all turbines from database
  const allTurbines = await turbineStorage.getAll();
  
  // Create a map of mock turbine data for quick lookup
  const mockTurbineMap = new Map(MOCK_TURBINES.map(t => [t.id, t]));

  // Generate metrics for all turbines
  for (const turbine of allTurbines) {
    const mockTurbine = mockTurbineMap.get(turbine.id);
    
    if (mockTurbine && mockTurbine.stats) {
      // Use mock data if available
      for (const statRow of mockTurbine.stats) {
        const label = statRow.label;
        const cells = statRow.cells;

        // Map label to metric type code
        const metricTypeCode = label.toLowerCase() as 'hours' | 'trips' | 'starts';

        // Extract values from cells (order: metric | target | interval | actual | remaining | note)
        const target = typeof cells[1]?.value === 'number' ? cells[1].value : 0;
        const interval = typeof cells[2]?.value === 'number' ? cells[2].value : 0;
        const actual = typeof cells[3]?.value === 'number' ? cells[3].value : 0;
        const remaining = typeof cells[4]?.value === 'number' ? cells[4].value : target - actual;
        const statusNote = typeof cells[5]?.value === 'string' ? cells[5].value : undefined;

        metrics.push({
          id: generateId(),
          turbine_id: turbine.id,
          metric_type_code: metricTypeCode,
          actual_value: actual,
          target_value: target,
          interval_value: interval,
          remaining_value: remaining,
          status_note: statusNote,
          last_updated_at: new Date().toISOString(),
          created_at: randomDateInPastYears(2),
        });
      }
    } else {
      // Generate realistic default metrics for turbines without mock data
      const baseHours = 15000 + Math.floor(Math.random() * 10000);
      const baseStarts = 600 + Math.floor(Math.random() * 600);
      const baseTrips = 100 + Math.floor(Math.random() * 100);

      // Hours metric
      metrics.push({
        id: generateId(),
        turbine_id: turbine.id,
        metric_type_code: 'hours',
        actual_value: baseHours,
        target_value: 24000,
        interval_value: 8000,
        remaining_value: Math.max(0, 24000 - baseHours),
        status_note: baseHours > 20000 ? 'Approaching interval' : 'Within window',
        last_updated_at: new Date().toISOString(),
        created_at: randomDateInPastYears(2),
      });

      // Starts metric
      metrics.push({
        id: generateId(),
        turbine_id: turbine.id,
        metric_type_code: 'starts',
        actual_value: baseStarts,
        target_value: 1200,
        interval_value: 400,
        remaining_value: Math.max(0, 1200 - baseStarts),
        status_note: baseStarts > 1000 ? 'Near limit' : 'Monitor usage trend',
        last_updated_at: new Date().toISOString(),
        created_at: randomDateInPastYears(2),
      });

      // Trips metric
      metrics.push({
        id: generateId(),
        turbine_id: turbine.id,
        metric_type_code: 'trips',
        actual_value: baseTrips,
        target_value: 200,
        interval_value: 50,
        remaining_value: Math.max(0, 200 - baseTrips),
        status_note: baseTrips > 180 ? 'Close to limit' : 'Normal operation',
        last_updated_at: new Date().toISOString(),
        created_at: randomDateInPastYears(2),
      });
    }
  }

  await turbineOperationalMetricStorage.saveAll(metrics);
}

// ============================================
// SEED PRODUCTS AND PIECES
// ============================================

export async function seedProducts(): Promise<Map<string, string>> {
  // Create a map of PN -> Product ID for later use
  const productMap = new Map<string, string>();

  // Component types
  const componentTypes = [
    'FuelNozzles', 'LinerCaps', 'CombLiners', 'TranPRC',
    'S1N', 'S2N', 'S3N', 'S1S', 'S2S', 'S3S', 'S1B', 'S2B', 'S3B', 'Rotor'
  ];

  // Create products for each component type
  // Each component type will have multiple part numbers (for the 13 pieces per component)
  const products: Product[] = [];
  
  componentTypes.forEach((componentType, typeIndex) => {
    // Create 13 part numbers per component type (for 13 pieces)
    for (let i = 1; i <= 13; i++) {
      const pn = `${componentType}-PN${String(i).padStart(3, '0')}`;
      const id = generateId();
      productMap.set(pn, id);

      products.push({
        id,
        part_number: pn,
        name: `${componentType} - Part ${i}`,
        description: `Product part ${i} for ${componentType}`,
        created_at: randomDateInPastYears(2),
      });
    }
  });

  await productStorage.saveAll(products);
  return productMap;
}

export async function seedPieces(productMap: Map<string, string>): Promise<void> {
  // Map status strings to codes
  const statusMap: Record<string, string> = {
    'OK': 'OK',
    'Monitor': 'Monitor',
    'Replace Soon': 'ReplaceSoon',
    'Replace Now': 'ReplaceNow',
    'Spare': 'Spare',
    'Degraded': 'Degraded',
    'Unknown': 'Unknown',
  };

  // Map state strings to codes
  const stateMap: Record<string, string> = {
    'In Service': 'InService',
    'Out of Service': 'OutService',
    'Standby': 'Standby',
    'Repair': 'Repair',
    'On Order': 'OnOrder',
  };

  const pieces: Piece[] = [];
  const statuses: string[] = ['OK', 'OK', 'OK', 'Monitor', 'Replace Soon', 'Replace Now', 'Spare', 'Degraded', 'Unknown'];
  const states: string[] = ['In Service', 'In Service', 'In Service', 'Standby', 'Repair', 'Out of Service', 'On Order'];

  // Get all turbines
  const turbines = await turbineStorage.getAll();
  const componentTypes = [
    'FuelNozzles', 'LinerCaps', 'CombLiners', 'TranPRC',
    'S1N', 'S2N', 'S3N', 'S1S', 'S2S', 'S3S', 'S1B', 'S2B', 'S3B', 'Rotor'
  ];

  let pieceCounter = 1;

  // For each turbine
  for (const turbine of turbines) {
    // For each component type
    for (const componentType of componentTypes) {
      // Create 13 pieces per component
      for (let pieceNum = 1; pieceNum <= 13; pieceNum++) {
        const pn = `${componentType}-PN${String(pieceNum).padStart(3, '0')}`;
        const productId = productMap.get(pn);
        if (!productId) continue; // Skip if product doesn't exist

        const sn = `SN-${turbine.id.replace('T-', '')}-${componentType}-${String(pieceNum).padStart(3, '0')}`;
        const baseHours = Math.floor(Math.random() * 20000) + 5000;
        const trips = Math.floor(baseHours / 100) + Math.floor(Math.random() * 50);
        const starts = Math.floor(trips / 2) + Math.floor(Math.random() * 20);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const state = states[Math.floor(Math.random() * states.length)];

        pieces.push({
          id: generateId(),
          sn,
          product_id: productId,
          pn,
          use_status_code: statusMap[status] || 'Unknown',
          condition_code: stateMap[state] || 'InService',
          hours: baseHours,
          trips,
          starts,
          created_at: randomDateInPastYears(2),
          updated_at: new Date().toISOString(),
        });

        pieceCounter++;
      }
    }
  }

  await pieceStorage.saveAll(pieces);
  console.log(`Created ${pieces.length} pieces`);
}

// ============================================
// SEED COMPONENTS
// ============================================

export async function seedComponents(): Promise<Map<string, string>> {
  // Create components: one of each type per turbine
  const componentMap = new Map<string, string>(); // componentName -> componentId
  const components: Component[] = [];

  const componentTypes = [
    { code: 'FuelNozzles', name: 'Fuel Nozzles' },
    { code: 'LinerCaps', name: 'Liner Caps' },
    { code: 'CombLiners', name: 'Comb Liners' },
    { code: 'TranPRC', name: 'Tran PRC' },
    { code: 'S1N', name: 'S1N' },
    { code: 'S2N', name: 'S2N' },
    { code: 'S3N', name: 'S3N' },
    { code: 'S1S', name: 'S1S' },
    { code: 'S2S', name: 'S2S' },
    { code: 'S3S', name: 'S3S' },
    { code: 'S1B', name: 'S1B' },
    { code: 'S2B', name: 'S2B' },
    { code: 'S3B', name: 'S3B' },
    { code: 'Rotor', name: 'Rotor' },
  ];

  // Get all turbines
  const turbines = await turbineStorage.getAll();

  // Create one component of each type for each turbine
  for (const turbine of turbines) {
    for (const componentType of componentTypes) {
      // Component name format: "T-101-FuelNozzles", "T-101-LinerCaps", etc.
      const componentName = `${turbine.id}-${componentType.code}`;
      const id = generateId();
      componentMap.set(componentName, id);

      // Generate realistic component operational values
      // Components typically have similar but slightly different values than turbines
      // since they may have been replaced or have different service histories
      const baseHours = Math.floor(Math.random() * 20000) + 5000; // 5,000 - 25,000 hours
      const trips = Math.floor(baseHours / 100) + Math.floor(Math.random() * 50); // Roughly 1 trip per 100 hours, with variation
      const starts = Math.floor(trips / 2) + Math.floor(Math.random() * 20); // Roughly 1 start per 2 trips, with variation

      components.push({
        id,
        name: componentName,
        type_code: componentType.code,
        hours: baseHours,
        trips,
        starts,
        created_at: randomDateInPastYears(2),
      });
    }
  }

  await componentStorage.saveAll(components);
  console.log(`Created ${components.length} components`);
  
  // Debug: Verify first component has the new fields
  if (components.length > 0) {
    const firstComponent = components[0];
    console.log('Sample component structure:', {
      id: firstComponent.id,
      name: firstComponent.name,
      type_code: firstComponent.type_code,
      hours: firstComponent.hours,
      trips: firstComponent.trips,
      starts: firstComponent.starts,
      hasHours: 'hours' in firstComponent,
      hasTrips: 'trips' in firstComponent,
      hasStarts: 'starts' in firstComponent,
    });
  }
  
  return componentMap;
}

// ============================================
// SEED JUNCTION TABLES
// ============================================

export async function seedComponentPieces(
  componentMap: Map<string, string>,
  pieceMap: Map<string, string>
): Promise<void> {
  const componentPieces: ComponentPiece[] = [];

  // Get all pieces and components
  const allPieces = await pieceStorage.getAll();
  const allComponents = await componentStorage.getAll();

  // Create a map of component name -> component ID
  const componentNameToId = new Map<string, string>();
  allComponents.forEach(component => {
    componentNameToId.set(component.name, component.id);
  });

  // Group pieces by turbine and component type
  // Piece SN format: "SN-101-FuelNozzles-001", "SN-101-LinerCaps-001", etc.
  const piecesByComponent = new Map<string, Piece[]>();
  
  for (const piece of allPieces) {
    // Extract component info from SN: "SN-101-FuelNozzles-001" -> "T-101-FuelNozzles"
    const snParts = piece.sn.split('-');
    if (snParts.length >= 4) {
      const turbineNum = snParts[1];
      const componentType = snParts[2];
      const componentName = `T-${turbineNum}-${componentType}`;
      
      if (!piecesByComponent.has(componentName)) {
        piecesByComponent.set(componentName, []);
      }
      piecesByComponent.get(componentName)!.push(piece);
    }
  }

  // Create component_piece records (13 pieces per component)
  for (const [componentName, pieces] of piecesByComponent.entries()) {
    const componentId = componentNameToId.get(componentName);
    if (!componentId) continue;

    // Sort pieces by their piece number (from SN)
    pieces.sort((a, b) => {
      const aNum = parseInt(a.sn.split('-')[3] || '0');
      const bNum = parseInt(b.sn.split('-')[3] || '0');
      return aNum - bNum;
    });

    pieces.forEach((piece, index) => {
      const setInDate = randomDateInPastYears(2);

      componentPieces.push({
        id: generateId(),
        component_id: componentId,
        piece_id: piece.id,
        position: index + 1, // Position 1-13
        valid_from: setInDate,
        valid_to: undefined, // Currently in component
        created_at: setInDate,
      });
    });
  }

  await componentPieceStorage.saveAll(componentPieces);
  console.log(`Created ${componentPieces.length} component-piece links`);
}

export async function seedComponentAssignments(
  componentMap: Map<string, string>
): Promise<void> {
  const assignments: ComponentAssignment[] = [];

  // Get all turbines and components
  const turbines = await turbineStorage.getAll();
  const allComponents = await componentStorage.getAll();

  // Create a map of component name -> component ID
  const componentNameToId = new Map<string, string>();
  allComponents.forEach(component => {
    componentNameToId.set(component.name, component.id);
  });

  const componentTypes = [
    'FuelNozzles', 'LinerCaps', 'CombLiners', 'TranPRC',
    'S1N', 'S2N', 'S3N', 'S1S', 'S2S', 'S3S', 'S1B', 'S2B', 'S3B', 'Rotor'
  ];

  // Assign each component to its turbine
  for (const turbine of turbines) {
    let position = 1;
    
    for (const componentType of componentTypes) {
      const componentName = `${turbine.id}-${componentType}`;
      const componentId = componentNameToId.get(componentName);
      
      if (!componentId) continue;

      const setInDate = randomDateInPastYears(2);

      assignments.push({
        id: generateId(),
        turbine_id: turbine.id,
        component_id: componentId,
        position: position++,
        valid_from: setInDate,
        valid_to: undefined, // Currently on turbine
        created_at: setInDate,
      });
    }
  }

  await componentAssignmentStorage.saveAll(assignments);
  console.log(`Created ${assignments.length} component-turbine assignments`);
}

// ============================================
// MASTER SEED FUNCTION
// ============================================

export async function seedDatabase(): Promise<void> {
  console.log('Starting database seed...');

  try {
    // 1. Seed lookup tables first
    console.log('Seeding lookup tables...');
    await seedTurbineMetricTypes();
    await seedComponentTypes();
    await seedUseStatus();
    await seedConditionCodes();

    // 2. Seed core entities
    console.log('Seeding plants and turbines...');
    await seedPlants();
    await seedTurbines();
    await seedTurbineMetrics();

    // 3. Seed products and pieces
    console.log('Seeding products and pieces...');
    const productMap = await seedProducts();
    await seedPieces(productMap);

    // 4. Seed components
    console.log('Seeding components...');
    const componentMap = await seedComponents();

    // 5. Seed junction tables
    console.log('Seeding junction tables...');
    const pieceMap = new Map<string, string>(); // We'll need this for component_pieces
    const allPieces = await pieceStorage.getAll();
    allPieces.forEach(piece => {
      pieceMap.set(piece.sn, piece.id);
    });

    await seedComponentPieces(componentMap, pieceMap);
    await seedComponentAssignments(componentMap);

    console.log('Database seed completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

/**
 * Clear all database stores
 */
export async function clearDatabase(): Promise<void> {
  console.log('Clearing database...');

  const { IndexedDBStorage, STORES } = await import('./indexedDB');

  // Clear all stores
  await Promise.all([
    IndexedDBStorage.clear(STORES.PLANTS).catch(() => {}),
    IndexedDBStorage.clear(STORES.PLANT_CONTACTS).catch(() => {}),
    IndexedDBStorage.clear(STORES.TURBINES).catch(() => {}),
    IndexedDBStorage.clear(STORES.TURBINE_METRIC_TYPES).catch(() => {}),
    IndexedDBStorage.clear(STORES.TURBINE_OPERATIONAL_METRICS).catch(() => {}),
    IndexedDBStorage.clear(STORES.COMPONENT_TYPES).catch(() => {}),
    IndexedDBStorage.clear(STORES.COMPONENTS).catch(() => {}),
    IndexedDBStorage.clear(STORES.USE_STATUS).catch(() => {}),
    IndexedDBStorage.clear(STORES.CONDITION_CODES).catch(() => {}),
    IndexedDBStorage.clear(STORES.PRODUCTS).catch(() => {}),
    IndexedDBStorage.clear(STORES.PIECES).catch(() => {}),
    IndexedDBStorage.clear(STORES.COMPONENT_PIECES).catch(() => {}),
    IndexedDBStorage.clear(STORES.COMPONENT_ASSIGNMENTS).catch(() => {}),
    IndexedDBStorage.clear(STORES.NOTES).catch(() => {}),
    IndexedDBStorage.clear(STORES.NOTE_LINKS).catch(() => {}),
    IndexedDBStorage.clear(STORES.OUTAGE_EVENTS).catch(() => {}),
    IndexedDBStorage.clear(STORES.OUTAGES).catch(() => {}),
    IndexedDBStorage.clear(STORES.REPAIR_ORDERS).catch(() => {}),
    IndexedDBStorage.clear(STORES.REPAIR_LINE_ITEMS).catch(() => {}),
    IndexedDBStorage.clear(STORES.STATUS_COLORS).catch(() => {}),
  ]);

  console.log('Database cleared!');
}

