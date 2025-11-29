/**
 * Adapter functions to convert new database structure to old component formats
 * This allows gradual migration - components can still use old formats
 */

import type { TurbineWithComponents, TurbineOperationalMetric } from './types';
import type { Turbine, StatRow, PieceRow, Cell } from '@/lib/matrix/types';
import type { InventoryItem } from '@/lib/inventory/types';

/**
 * Convert turbine operational metrics to StatRow format
 */
function metricsToStatRows(
  metrics: TurbineOperationalMetric[],
  turbineId: string
): StatRow[] {
  const metricMap = new Map<string, TurbineOperationalMetric>();
  metrics.forEach(m => metricMap.set(m.metric_type_code, m));

  const hoursMetric = metricMap.get('hours');
  const tripsMetric = metricMap.get('trips');
  const startsMetric = metricMap.get('starts');

  const statRows: StatRow[] = [];

  // Hours stat
  if (hoursMetric) {
    statRows.push({
      id: `${turbineId}-stat-hours`,
      label: 'Hours',
      cells: [
        { kind: 'text', value: 'Hours' },
        { kind: 'number', value: hoursMetric.target_value },
        { kind: 'number', value: hoursMetric.interval_value },
        { kind: 'number', value: hoursMetric.actual_value },
        { kind: 'number', value: hoursMetric.remaining_value },
        { kind: 'note', value: hoursMetric.status_note || '', note: hoursMetric.status_note || null },
      ] as Cell[],
    });
  }

  // Trips stat
  if (tripsMetric) {
    statRows.push({
      id: `${turbineId}-stat-trips`,
      label: 'Trips',
      cells: [
        { kind: 'text', value: 'Trips' },
        { kind: 'number', value: tripsMetric.target_value },
        { kind: 'number', value: tripsMetric.interval_value },
        { kind: 'number', value: tripsMetric.actual_value },
        { kind: 'number', value: tripsMetric.remaining_value },
        { kind: 'note', value: tripsMetric.status_note || '', note: tripsMetric.status_note || null },
      ] as Cell[],
    });
  }

  // Starts stat
  if (startsMetric) {
    statRows.push({
      id: `${turbineId}-stat-starts`,
      label: 'Starts',
      cells: [
        { kind: 'text', value: 'Starts' },
        { kind: 'number', value: startsMetric.target_value },
        { kind: 'number', value: startsMetric.interval_value },
        { kind: 'number', value: startsMetric.actual_value },
        { kind: 'number', value: startsMetric.remaining_value },
        { kind: 'note', value: startsMetric.status_note || '', note: startsMetric.status_note || null },
      ] as Cell[],
    });
  }

  return statRows;
}

/**
 * Convert component pieces to PieceRow format
 */
function componentsToPieceRows(
  components: TurbineWithComponents['components'],
  turbineId: string
): PieceRow[] {
  const pieceRows: PieceRow[] = [];

  components.forEach((component, compIndex) => {
    // Create a piece row for each component (representing the component as a whole)
    const componentTypeName = component.type.name;
    
    // Get first piece to extract position info, or use component position
    const firstPiece = component.pieces[0];
    const position = firstPiece?.position?.toString() || component.position?.toString() || componentTypeName;
    const setInDate = firstPiece?.set_in_date || component.set_in_date || '-';
    
    // Determine condition from pieces (use worst status)
    const statuses = component.pieces
      .map(p => p.use_status?.name || 'Unknown')
      .filter(Boolean);
    
    let condition = 'OK';
    const statusPriority: Record<string, number> = {
      'Replace Now': 7,
      'Replace Soon': 6,
      'Degraded': 5,
      'Monitor': 4,
      'Unknown': 3,
      'Spare': 2,
      'OK': 1,
    };
    
    if (statuses.length > 0) {
      condition = statuses.reduce((worst, current) => {
        const worstPriority = statusPriority[worst] || 0;
        const currentPriority = statusPriority[current] || 0;
        return currentPriority > worstPriority ? current : worst;
      }, statuses[0]);
    }

    // Get notes - pieces don't have notes in the new structure yet, will be from note_links
    const notes = '';

    pieceRows.push({
      id: `${turbineId}-piece-${compIndex}`,
      label: componentTypeName,
      cells: [
        { kind: 'text', value: componentTypeName },
        { kind: 'badge', value: position, tone: 'info' },
        { kind: 'badge', value: condition, tone: condition === 'OK' ? 'success' : condition === 'Monitor' ? 'warning' : 'danger' },
        { kind: 'text', value: setInDate },
        { kind: 'text', value: '-' }, // setOut
        { kind: 'note', value: notes, note: notes || null },
      ] as Cell[],
    });
  });

  return pieceRows;
}

/**
 * Convert TurbineWithComponents to old Turbine format for components
 */
export function dbTurbineToMatrixTurbine(dbTurbine: TurbineWithComponents): Turbine {
  const stats = metricsToStatRows(dbTurbine.metrics, dbTurbine.id);
  const pieces = componentsToPieceRows(dbTurbine.components, dbTurbine.id);

  return {
    id: dbTurbine.id,
    name: dbTurbine.name,
    unit: dbTurbine.unit || undefined,
    stats,
    pieces,
  };
}

/**
 * Convert piece from database to InventoryItem format
 */
export function dbPieceToInventoryItem(
  piece: TurbineWithComponents['components'][0]['pieces'][0],
  component: TurbineWithComponents['components'][0],
  turbine: TurbineWithComponents
): InventoryItem {
  return {
    id: piece.id,
    sn: piece.sn,
    pn: piece.pn || piece.product.part_number,
    hours: piece.hours,
    trips: piece.trips,
    starts: piece.starts,
    status: (piece.use_status?.name || 'Unknown') as InventoryItem['status'],
    state: (piece.condition?.name || 'In Service') as InventoryItem['state'],
    component: component.name,
    componentType: component.type.name,
    turbine: turbine.id,
    position: piece.position?.toString() || '1',
    notes: [], // Will be populated from note_links table later
    repairEvents: [], // Will be populated from repair_events table later
  };
}

/**
 * Get all inventory items from database
 * Gets ALL pieces directly from the pieces table
 */
export async function getAllInventoryItems(): Promise<InventoryItem[]> {
  const { 
    pieceStorage, 
    productStorage, 
    componentStorage, 
    componentTypeStorage,
    componentPieceStorage, 
    componentAssignmentStorage,
    turbineStorage,
    useStatusStorage,
    conditionCodeStorage
  } = await import('./storage');
  
  const allPieces = await pieceStorage.getAll();
  const inventoryItems: InventoryItem[] = [];

  for (const piece of allPieces) {
    // Get product
    const product = await productStorage.get(piece.product_id);
    if (!product) continue;

    // Get status and condition
    const useStatus = piece.use_status_code 
      ? await useStatusStorage.get(piece.use_status_code)
      : undefined;
    const condition = piece.condition_code
      ? await conditionCodeStorage.get(piece.condition_code)
      : undefined;

    // Find which component this piece is in
    const componentPiece = await componentPieceStorage.getCurrentByPiece(piece.id);
    
    let component = null;
    let componentType = null;
    let turbine = null;
    let position = '1';

    if (componentPiece) {
      component = await componentStorage.get(componentPiece.component_id);
      if (component) {
        componentType = await componentTypeStorage.get(component.type_code);
        position = componentPiece.position.toString();
        
        // Find which turbine this component is assigned to
        // NOTE: getCurrentByComponent returns a single assignment (or null), not an array
        const assignment = await componentAssignmentStorage.getCurrentByComponent(component.id);
        if (assignment) {
          turbine = await turbineStorage.get(assignment.turbine_id);
        }
      }
    }

    inventoryItems.push({
      id: piece.id,
      sn: piece.sn,
      pn: piece.pn || product.part_number,
      hours: piece.hours,
      trips: piece.trips,
      starts: piece.starts,
      status: (useStatus?.name || 'Unknown') as InventoryItem['status'],
      state: (condition?.name || 'In Service') as InventoryItem['state'],
      component: component?.name || 'Unassigned',
      componentType: componentType?.name || 'Unknown',
      turbine: turbine?.id || 'unassigned',
      position: position,
      notes: [],
      repairEvents: [],
    });
  }

  return inventoryItems;
}

