/**
 * High-level query helpers
 * Provides convenient functions for common operations
 */

import type {
  TurbineWithComponents,
  ComponentWithPieces,
  PieceWithComponent,
  Turbine,
  Component,
  Piece,
  ComponentAssignment,
  ComponentPiece,
} from './types';

import {
  turbineStorage,
  turbineOperationalMetricStorage,
  componentStorage,
  componentTypeStorage,
  componentAssignmentStorage,
  componentPieceStorage,
  pieceStorage,
  productStorage,
  useStatusStorage,
  conditionCodeStorage,
  plantStorage,
} from './storage';

// ============================================
// TURBINE QUERIES
// ============================================

/**
 * Get turbine with all current components, pieces, and metrics
 */
export async function getTurbineWithComponents(turbineId: string): Promise<TurbineWithComponents | null> {
  try {
    const turbine = await turbineStorage.get(turbineId);
    if (!turbine) return null;

    const plant = await plantStorage.get(turbine.plant_id);
    // Allow turbine to exist without plant (for backward compatibility)
    if (!plant) {
      // Return turbine with minimal plant data
      return {
        ...turbine,
        plant: {
          id: turbine.plant_id,
          name: 'Unknown Plant',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        components: [],
        metrics: [],
      };
    }

  // Get metrics
  const metrics = await turbineOperationalMetricStorage.getByTurbine(turbineId);

  // Get current component assignments
  const assignments = await componentAssignmentStorage.getCurrentByTurbine(turbineId);

  // Get all components with their pieces
  const components = await Promise.all(
    assignments.map(async (assignment) => {
      const component = await componentStorage.get(assignment.component_id);
      if (!component) return null;

      const componentType = await componentTypeStorage.get(component.type_code);
      if (!componentType) return null;

      // Get current pieces in this component
      const componentPieces = await componentPieceStorage.getCurrentByComponent(component.id);

      const pieces = await Promise.all(
        componentPieces.map(async (cp) => {
          const piece = await pieceStorage.get(cp.piece_id);
          if (!piece) return null;

          const product = await productStorage.get(piece.product_id);
          const useStatus = piece.use_status_code
            ? await useStatusStorage.get(piece.use_status_code)
            : undefined;
          const condition = piece.condition_code
            ? await conditionCodeStorage.get(piece.condition_code)
            : undefined;

          return {
            ...piece,
            product: product!,
            use_status: useStatus,
            condition,
            position: cp.position,
            set_in_date: cp.valid_from,
          };
        })
      );

      return {
        ...component,
        type: componentType,
        pieces: pieces.filter((p): p is NonNullable<typeof p> => p !== null),
        position: assignment.position,
        set_in_date: assignment.valid_from,
      };
    })
  );

    return {
      ...turbine,
      plant,
      components: components.filter((c): c is NonNullable<typeof c> => c !== null),
      metrics,
    };
  } catch (error) {
    console.error(`Error loading turbine ${turbineId}:`, error);
    return null;
  }
}

/**
 * Get turbine with operational metrics only
 */
export async function getTurbineWithMetrics(turbineId: string): Promise<
  | (Turbine & {
      metrics: Awaited<ReturnType<typeof turbineOperationalMetricStorage.getByTurbine>>;
      plant: Awaited<ReturnType<typeof plantStorage.get>>;
    })
  | null
> {
  const turbine = await turbineStorage.get(turbineId);
  if (!turbine) return null;

  const plant = await plantStorage.get(turbine.plant_id);
  const metrics = await turbineOperationalMetricStorage.getByTurbine(turbineId);

  return {
    ...turbine,
    plant: plant!,
    metrics,
  };
}

// ============================================
// COMPONENT QUERIES
// ============================================

/**
 * Get component with all current pieces
 */
export async function getComponentWithPieces(componentId: string): Promise<ComponentWithPieces | null> {
  const component = await componentStorage.get(componentId);
  if (!component) return null;

  const componentType = await componentTypeStorage.get(component.type_code);
  if (!componentType) return null;

  // Get current pieces in this component
  const componentPieces = await componentPieceStorage.getCurrentByComponent(componentId);

  const pieces = await Promise.all(
    componentPieces.map(async (cp) => {
      const piece = await pieceStorage.get(cp.piece_id);
      if (!piece) return null;

      const product = await productStorage.get(piece.product_id);
      const useStatus = piece.use_status_code
        ? await useStatusStorage.get(piece.use_status_code)
        : undefined;
      const condition = piece.condition_code
        ? await conditionCodeStorage.get(piece.condition_code)
        : undefined;

      return {
        ...piece,
        product: product!,
        use_status: useStatus,
        condition,
        position: cp.position,
        set_in_date: cp.valid_from,
      };
    })
  );

  // Get current turbine assignment
  const assignment = await componentAssignmentStorage.getCurrentByComponent(componentId);
  let currentTurbine = undefined;
  if (assignment) {
    const turbine = await turbineStorage.get(assignment.turbine_id);
    if (turbine) {
      currentTurbine = {
        ...turbine,
        position: assignment.position,
        set_in_date: assignment.valid_from,
      };
    }
  }

  return {
    ...component,
    type: componentType,
    pieces: pieces.filter((p): p is NonNullable<typeof p> => p !== null),
    current_turbine: currentTurbine,
  };
}

// ============================================
// PIECE QUERIES
// ============================================

/**
 * Get piece with current component and turbine
 */
export async function getPieceWithComponent(pieceId: string): Promise<PieceWithComponent | null> {
  const piece = await pieceStorage.get(pieceId);
  if (!piece) return null;

  const product = await productStorage.get(piece.product_id);
  const useStatus = piece.use_status_code
    ? await useStatusStorage.get(piece.use_status_code)
    : undefined;
  const condition = piece.condition_code
    ? await conditionCodeStorage.get(piece.condition_code)
    : undefined;

  // Get current component assignment
  const componentPiece = await componentPieceStorage.getCurrentByPiece(pieceId);
  let currentComponent = undefined;
  let currentTurbine = undefined;

  if (componentPiece) {
    const component = await componentStorage.get(componentPiece.component_id);
    if (component) {
      const componentType = await componentTypeStorage.get(component.type_code);
      if (componentType) {
        currentComponent = {
          ...component,
          type: componentType,
          position: componentPiece.position,
          set_in_date: componentPiece.valid_from,
        };

        // Get turbine assignment for this component
        const assignment = await componentAssignmentStorage.getCurrentByComponent(component.id);
        if (assignment) {
          const turbine = await turbineStorage.get(assignment.turbine_id);
          if (turbine) {
            currentTurbine = turbine;
          }
        }
      }
    }
  }

  return {
    ...piece,
    product: product!,
    use_status: useStatus,
    condition,
    current_component: currentComponent,
    current_turbine: currentTurbine,
  };
}

// ============================================
// ASSIGNMENT HELPERS
// ============================================

/**
 * Assign component to turbine
 * Automatically ends any previous assignment
 */
export async function assignComponentToTurbine(
  componentId: string,
  turbineId: string,
  position: number
): Promise<boolean> {
  try {
    // End any current assignment
    const currentAssignment = await componentAssignmentStorage.getCurrentByComponent(componentId);
    if (currentAssignment) {
      await componentAssignmentStorage.save({
        ...currentAssignment,
        valid_to: new Date().toISOString(),
      });
    }

    // Create new assignment
    const newAssignment: ComponentAssignment = {
      id: crypto.randomUUID(),
      turbine_id: turbineId,
      component_id: componentId,
      position,
      valid_from: new Date().toISOString(),
      valid_to: undefined,
      created_at: new Date().toISOString(),
    };

    return await componentAssignmentStorage.save(newAssignment);
  } catch (error) {
    console.error('Error assigning component to turbine:', error);
    return false;
  }
}

/**
 * Move component from one turbine to another
 */
export async function moveComponentToTurbine(
  componentId: string,
  newTurbineId: string,
  position: number
): Promise<boolean> {
  return assignComponentToTurbine(componentId, newTurbineId, position);
}

/**
 * Assign piece to component
 * Automatically ends any previous assignment
 */
export async function assignPieceToComponent(
  pieceId: string,
  componentId: string,
  position: number
): Promise<boolean> {
  try {
    // End any current assignment
    const currentAssignment = await componentPieceStorage.getCurrentByPiece(pieceId);
    if (currentAssignment) {
      await componentPieceStorage.save({
        ...currentAssignment,
        valid_to: new Date().toISOString(),
      });
    }

    // Create new assignment
    const newAssignment: ComponentPiece = {
      id: crypto.randomUUID(),
      component_id: componentId,
      piece_id: pieceId,
      position,
      valid_from: new Date().toISOString(),
      valid_to: undefined,
      created_at: new Date().toISOString(),
    };

    return await componentPieceStorage.save(newAssignment);
  } catch (error) {
    console.error('Error assigning piece to component:', error);
    return false;
  }
}

/**
 * Move piece from one component to another
 */
export async function movePieceToComponent(
  pieceId: string,
  newComponentId: string,
  position: number
): Promise<boolean> {
  return assignPieceToComponent(pieceId, newComponentId, position);
}

