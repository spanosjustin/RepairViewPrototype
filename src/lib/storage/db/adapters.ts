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
 * OPTIMIZED: Uses batch loading and lookup tables to avoid N+1 queries
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
    conditionCodeStorage,
    noteStorage,
    noteLinkStorage
  } = await import('./storage');
  
  // Step 1: Load all pieces at once
  const allPieces = await pieceStorage.getAll();
  
  // Step 2: Pre-load all lookup tables in parallel
  const [
    allProducts,
    allUseStatuses,
    allConditionCodes,
    allComponents,
    allComponentTypes,
    allTurbines,
    allComponentPieces,
    allComponentAssignments,
    allNotes,
    allNoteLinks
  ] = await Promise.all([
    productStorage.getAll(),
    useStatusStorage.getAll(),
    conditionCodeStorage.getAll(),
    componentStorage.getAll(),
    componentTypeStorage.getAll(),
    turbineStorage.getAll(),
    componentPieceStorage.getAll(),
    componentAssignmentStorage.getAll(),
    noteStorage.getAll(),
    noteLinkStorage.getAll()
  ]);

  // Step 3: Build lookup Maps for O(1) access
  const productMap = new Map(allProducts.map(p => [p.id, p]));
  const useStatusMap = new Map(allUseStatuses.map(s => [s.code, s]));
  const conditionCodeMap = new Map(allConditionCodes.map(c => [c.code, c]));
  const componentMap = new Map(allComponents.map(c => [c.id, c]));
  const componentTypeMap = new Map(allComponentTypes.map(t => [t.code, t]));
  const turbineMap = new Map(allTurbines.map(t => [t.id, t]));
  const noteMap = new Map(allNotes.map(n => [n.id, n]));

  // Step 4: Build lookup Maps for component pieces and assignments
  // Filter to only current assignments (valid_to is null/undefined)
  const currentComponentPieces = allComponentPieces.filter(cp => !cp.valid_to);
  const currentComponentAssignments = allComponentAssignments.filter(ca => !ca.valid_to);
  
  // Map: piece_id -> ComponentPiece (current assignment only)
  const pieceToComponentPieceMap = new Map<string, typeof allComponentPieces[0]>();
  currentComponentPieces.forEach(cp => {
    pieceToComponentPieceMap.set(cp.piece_id, cp);
  });

  // Map: component_id -> ComponentAssignment (current assignment only)
  const componentToAssignmentMap = new Map<string, typeof allComponentAssignments[0]>();
  currentComponentAssignments.forEach(ca => {
    componentToAssignmentMap.set(ca.component_id, ca);
  });

  // Step 5: Group note links by entity (piece_id)
  const noteLinksByPiece = new Map<string, typeof allNoteLinks>();
  allNoteLinks
    .filter(link => link.entity_table === 'piece')
    .forEach(link => {
      if (!noteLinksByPiece.has(link.entity_id)) {
        noteLinksByPiece.set(link.entity_id, []);
      }
      noteLinksByPiece.get(link.entity_id)!.push(link);
    });

  // Step 6: Process pieces using cached lookups (no more database calls!)
  const inventoryItems: InventoryItem[] = [];

  for (const piece of allPieces) {
    // Get product from cache
    const product = productMap.get(piece.product_id);
    if (!product) continue;

    // Get status and condition from cache
    const useStatus = piece.use_status_code 
      ? useStatusMap.get(piece.use_status_code)
      : undefined;
    const condition = piece.condition_code
      ? conditionCodeMap.get(piece.condition_code)
      : undefined;

    // Find which component this piece is in (from cache)
    const componentPiece = pieceToComponentPieceMap.get(piece.id);
    
    let component = null;
    let componentType = null;
    let turbine = null;
    let position = '1';

    if (componentPiece) {
      component = componentMap.get(componentPiece.component_id);
      if (component) {
        componentType = componentTypeMap.get(component.type_code);
        position = componentPiece.position.toString();
        
        // Find which turbine this component is assigned to (from cache)
        const assignment = componentToAssignmentMap.get(component.id);
        if (assignment) {
          turbine = turbineMap.get(assignment.turbine_id);
        }
      }
    }

    // Load notes for this piece (from cache)
    const pieceNoteLinks = noteLinksByPiece.get(piece.id) || [];
    const pieceNotes = pieceNoteLinks
      .map(link => noteMap.get(link.note_id))
      .filter((n): n is NonNullable<typeof n> => n !== undefined)
      .map(n => n.body);

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
      notes: pieceNotes,
      repairEvents: [], // TODO: Load repair events from RepairOrder/RepairLineItem tables
    });
  }

  return inventoryItems;
}

/**
 * Save an InventoryItem to the new database structure
 * Handles all related tables: Piece, Product, Component, ComponentPiece, ComponentAssignment, Notes
 */
export async function saveInventoryItem(item: InventoryItem): Promise<boolean> {
  const { 
    pieceStorage, 
    productStorage, 
    componentStorage, 
    componentTypeStorage,
    componentPieceStorage, 
    componentAssignmentStorage,
    turbineStorage,
    useStatusStorage,
    conditionCodeStorage,
    noteStorage,
    noteLinkStorage
  } = await import('./storage');
  
  try {
    // 1. Find or create Product by part number
    let product = await productStorage.getByPartNumber(item.pn);
    if (!product) {
      // Create new product
      const productId = `product-${Date.now()}`;
      product = {
        id: productId,
        part_number: item.pn,
        name: item.pn,
        created_at: new Date().toISOString(),
      };
      await productStorage.save(product);
    }

    // 2. Find or get UseStatus by name
    let useStatusCode: string | undefined;
    if (item.status && item.status !== 'Unknown') {
      const allStatuses = await useStatusStorage.getAll();
      let useStatus = allStatuses.find(s => s.name === item.status);
      if (!useStatus) {
        // Create new status (using code as lowercase name)
        useStatusCode = item.status.toLowerCase().replace(/\s+/g, '_');
        useStatus = {
          code: useStatusCode,
          name: item.status,
          severity: item.status === 'Replace Now' ? 7 : 
                   item.status === 'Replace Soon' ? 6 :
                   item.status === 'Degraded' ? 5 :
                   item.status === 'Monitor' ? 4 : 1,
        };
        await useStatusStorage.saveAll([useStatus]);
      } else {
        useStatusCode = useStatus.code;
      }
    }

    // 3. Find or get ConditionCode by name
    let conditionCode: string | undefined;
    if (item.state && item.state !== 'In Service') {
      const allConditions = await conditionCodeStorage.getAll();
      let condition = allConditions.find(c => c.name === item.state);
      if (!condition) {
        // Create new condition (using code as lowercase name)
        conditionCode = item.state.toLowerCase().replace(/\s+/g, '_');
        condition = {
          code: conditionCode,
          name: item.state,
        };
        await conditionCodeStorage.saveAll([condition]);
      } else {
        conditionCode = condition.code;
      }
    }

    // 4. Find or create ComponentType
    let componentType = null;
    if (item.componentType) {
      const typeCode = item.componentType.toLowerCase().replace(/\s+/g, '');
      componentType = await componentTypeStorage.get(typeCode);
      if (!componentType) {
        // Create new component type
        componentType = {
          code: typeCode,
          name: item.componentType,
        };
        await componentTypeStorage.saveAll([componentType]);
      }
    }

    // 5. Find or create Component
    let component = null;
    if (item.component && item.component !== 'Unassigned') {
      const allComponents = await componentStorage.getAll();
      component = allComponents.find(c => c.name === item.component);
      if (!component && componentType) {
        // Create new component
        const componentId = `component-${Date.now()}`;
        component = {
          id: componentId,
          name: item.component,
          type_code: componentType.code,
          hours: typeof item.hours === 'number' ? item.hours : 0,
          trips: typeof item.trips === 'number' ? item.trips : 0,
          starts: typeof item.starts === 'number' ? item.starts : 0,
          created_at: new Date().toISOString(),
        };
        await componentStorage.save(component);
      }
    }

    // 6. Get or create Piece
    let piece = null;
    if (item.id) {
      piece = await pieceStorage.get(item.id);
    }
    if (!piece && item.sn) {
      piece = await pieceStorage.getBySerialNumber(item.sn);
    }

    const now = new Date().toISOString();
    if (!piece) {
      // Create new piece
      const pieceId = `piece-${Date.now()}`;
      piece = {
        id: pieceId,
        sn: item.sn,
        product_id: product.id,
        pn: item.pn,
        use_status_code: useStatusCode,
        condition_code: conditionCode,
        hours: item.hours || 0,
        trips: item.trips || 0,
        starts: item.starts || 0,
        created_at: now,
        updated_at: now,
      };
    } else {
      // Update existing piece
      piece = {
        ...piece,
        sn: item.sn,
        product_id: product.id,
        pn: item.pn,
        use_status_code: useStatusCode,
        condition_code: conditionCode,
        hours: item.hours || 0,
        trips: item.trips || 0,
        starts: item.starts || 0,
        updated_at: now,
      };
    }
    await pieceStorage.save(piece);

    // 7. Update ComponentPiece junction table
    const existingComponentPiece = await componentPieceStorage.getCurrentByPiece(piece.id);
    
    // If component is empty or "Unassigned", remove piece from component
    if (!component || item.component === 'Unassigned' || item.component === '' || !item.position) {
      if (existingComponentPiece) {
        // End the existing assignment
        const oldAssignment = {
          ...existingComponentPiece,
          valid_to: now,
        };
        await componentPieceStorage.save(oldAssignment);
      }
    } else if (component && item.position) {
      // Piece is being assigned to a component
      const positionNum = parseInt(item.position, 10) || 1;
      
      if (existingComponentPiece) {
        // Update existing assignment if component or position changed
        if (existingComponentPiece.component_id !== component.id || 
            existingComponentPiece.position !== positionNum) {
          // End the old assignment
          const oldAssignment = {
            ...existingComponentPiece,
            valid_to: now,
          };
          await componentPieceStorage.save(oldAssignment);
          
          // Create new assignment
          const newComponentPiece = {
            id: `componentpiece-${Date.now()}`,
            component_id: component.id,
            piece_id: piece.id,
            position: positionNum,
            valid_from: now,
            valid_to: undefined,
            created_at: now,
          };
          await componentPieceStorage.save(newComponentPiece);
        }
      } else {
        // Create new assignment
        const newComponentPiece = {
          id: `componentpiece-${Date.now()}`,
          component_id: component.id,
          piece_id: piece.id,
          position: positionNum,
          valid_from: now,
          valid_to: undefined,
          created_at: now,
        };
        await componentPieceStorage.save(newComponentPiece);
      }

      // 8. ComponentAssignment is NOT updated here
      // Component's turbine assignment should only be changed from ComponentInfoCard
      // When saving a piece, we only update which component the piece belongs to (ComponentPiece),
      // not the component's turbine assignment (ComponentAssignment)
    }

    // 9. Save notes to Note and NoteLink tables
    if (item.notes && item.notes.length > 0) {
      // Get existing notes for this piece (in order by creation time)
      const existingNoteLinks = await noteLinkStorage.getByEntity('piece', piece.id);
      // Sort note links by created_at to ensure consistent order
      const sortedNoteLinks = [...existingNoteLinks].sort((a, b) => {
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return aTime - bTime;
      });
      const allNotes = await noteStorage.getAll();
      const existingNotesForPiece = sortedNoteLinks
        .map(link => allNotes.find(n => n.id === link.note_id))
        .filter((n): n is NonNullable<typeof n> => n !== undefined);
      
      // Process notes by position/index to maintain order
      for (let index = 0; index < item.notes.length; index++) {
        const noteText = item.notes[index];
        if (!noteText.trim()) continue;
        
        // Get the existing note at this position (if any)
        const existingNoteAtPosition = existingNotesForPiece[index];
        
        if (existingNoteAtPosition) {
          // Note exists at this position - update it if text changed
          if (existingNoteAtPosition.body !== noteText) {
            // Update the existing note's body
            const updatedNote = {
              ...existingNoteAtPosition,
              body: noteText,
            };
            await noteStorage.save(updatedNote);
          }
          // Note link already exists, no need to create it
        } else {
          // No note at this position - create a new note
          const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          const newNote = {
            id: noteId,
            note_type: 'piece',
            body: noteText,
            created_at: now,
          };
          await noteStorage.save(newNote);
          
          // Create note link
          const noteLink = {
            id: `notelink-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            note_id: newNote.id,
            entity_table: 'piece',
            entity_id: piece.id,
            created_at: now,
          };
          await noteLinkStorage.save(noteLink);
        }
      }
      
      // Remove note links for notes that are beyond the new array length
      // (i.e., notes that were deleted)
      if (existingNotesForPiece.length > item.notes.length) {
        for (let index = item.notes.length; index < existingNotesForPiece.length; index++) {
          const noteToRemove = existingNotesForPiece[index];
          if (noteToRemove) {
            const linkToRemove = sortedNoteLinks.find(link => link.note_id === noteToRemove.id);
            if (linkToRemove) {
              // Delete the note link (but keep the note itself for history)
              // In a production system, you might want to soft-delete or archive
              try {
                const { IndexedDBStorage, STORES } = await import('./indexedDB');
                await IndexedDBStorage.delete(STORES.NOTE_LINKS, linkToRemove.id);
              } catch (error) {
                console.error('Error deleting note link:', error);
              }
            }
          }
        }
      }
    } else {
      // No notes in the array - remove all note links for this piece
      const existingNoteLinks = await noteLinkStorage.getByEntity('piece', piece.id);
      const { IndexedDBStorage, STORES } = await import('./indexedDB');
      for (const link of existingNoteLinks) {
        try {
          await IndexedDBStorage.delete(STORES.NOTE_LINKS, link.id);
        } catch (error) {
          console.error('Error deleting note link:', error);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving inventory item:', error);
    return false;
  }
}

