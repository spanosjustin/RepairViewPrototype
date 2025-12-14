import React from "react";
import type { InventoryItem } from "@/lib/inventory/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { componentStorage, componentTypeStorage, turbineStorage, componentAssignmentStorage } from "@/lib/storage/db/storage";
import type { Component, Turbine, ComponentAssignment } from "@/lib/storage/db/types";
import { saveInventoryItem } from "@/lib/storage/db/adapters";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getTone, getColorName, getBadgeClasses } from "@/lib/settings/colorMapper";

// Badge component for displaying status/state with colors
const Badge = ({ 
  text, 
  tone, 
  colorName 
}: { 
  text: React.ReactNode; 
  tone: "ok" | "warn" | "bad" | "info" | "neutral";
  colorName?: string;
}) => (
  <span className={getBadgeClasses(tone, colorName)}>{text}</span>
);

interface ComponentInfoCardProps {
  item: {
    id?: string | number;
    componentName?: string;
    componentType?: string;
    hours?: number | string;
    starts?: number | string;
    trips?: number | string;
    turbine?: string;
    status?: string;
    state?: string;
    // Add more fields as needed for the component data
  };
  pieces?: InventoryItem[];
  allPieces?: InventoryItem[]; // All pieces for the dropdown
  onPieceAdded?: () => void; // Callback to refresh pieces after adding
  onComponentUpdated?: () => void; // Callback to refresh component after updating
}

export default function ComponentInfoCard({ 
  item, 
  pieces = [],
  allPieces = [],
  onPieceAdded,
  onComponentUpdated
}: ComponentInfoCardProps) {
  const { data: colorSettings = [] } = useStatusColors();
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [selectedPieceId, setSelectedPieceId] = React.useState<string>("");
  const [positionInput, setPositionInput] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);
  const [pieceSearchTerm, setPieceSearchTerm] = React.useState<string>("");
  const [isPieceDropdownOpen, setIsPieceDropdownOpen] = React.useState(false);
  
  // Turbine dropdown state
  const [turbines, setTurbines] = React.useState<Turbine[]>([]);
  const [turbineSearchTerm, setTurbineSearchTerm] = React.useState<string>("");
  const [isTurbineDropdownOpen, setIsTurbineDropdownOpen] = React.useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSavingComponent, setIsSavingComponent] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [editedComponent, setEditedComponent] = React.useState({
    componentName: item.componentName || "",
    componentType: item.componentType || "",
    hours: item.hours !== undefined && item.hours !== null ? item.hours : "",
    starts: item.starts !== undefined && item.starts !== null ? item.starts : "",
    trips: item.trips !== undefined && item.trips !== null ? item.trips : "",
    turbine: item.turbine || "",
    status: item.status || "",
    state: item.state || "",
  });
  const [editedPiecePositions, setEditedPiecePositions] = React.useState<Record<string, string>>({});
  const [editedPieceSNs, setEditedPieceSNs] = React.useState<Record<string, string>>({}); // pieceId -> newPieceId
  const [snSearchTerms, setSnSearchTerms] = React.useState<Record<string, string>>({}); // pieceId -> search term
  const [openSnDropdowns, setOpenSnDropdowns] = React.useState<Record<string, boolean>>({}); // pieceId -> isOpen
  const [deletedPieceIds, setDeletedPieceIds] = React.useState<Set<string>>(new Set()); // pieceIds to delete
  
  // Store original values when entering edit mode to restore on cancel
  const [originalComponent, setOriginalComponent] = React.useState<{
    componentName: string;
    componentType: string;
    hours: string | number;
    starts: string | number;
    trips: string | number;
    turbine: string;
    status: string;
    state: string;
  } | null>(null);
  const [originalPiecePositions, setOriginalPiecePositions] = React.useState<Record<string, string>>({});
  const [originalPieceSNs, setOriginalPieceSNs] = React.useState<Record<string, string>>({});

  // Sort pieces by position (treating position as number if possible, otherwise string)
  const sortedPieces = React.useMemo(() => {
    return [...pieces].sort((a, b) => {
      const posA = a.position || "";
      const posB = b.position || "";
      
      // Try to parse as numbers for proper numeric sorting
      const numA = parseInt(posA, 10);
      const numB = parseInt(posB, 10);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Fallback to string comparison
      return posA.localeCompare(posB);
    });
  }, [pieces]);

  // Get pieces that don't already belong to this component
  const availablePieces = React.useMemo(() => {
    const componentName = item.componentName || "";
    return allPieces.filter(piece => {
      // Exclude pieces that already belong to this component
      return piece.component !== componentName;
    });
  }, [allPieces, item.componentName]);

  // Filter pieces based on search term (for add piece dialog)
  const filteredPieces = React.useMemo(() => {
    if (!pieceSearchTerm.trim()) {
      return availablePieces;
    }
    
    const searchLower = pieceSearchTerm.toLowerCase();
    return availablePieces.filter(piece => {
      const sn = (piece.sn || "").toLowerCase();
      const pn = (piece.pn || "").toLowerCase();
      const component = (piece.component || "").toLowerCase();
      return sn.includes(searchLower) || pn.includes(searchLower) || component.includes(searchLower);
    });
  }, [availablePieces, pieceSearchTerm]);

  // Filter pieces for SN dropdown (includes all pieces, not just available ones)
  const getFilteredPiecesForSN = React.useCallback((pieceId: string) => {
    const searchTerm = snSearchTerms[pieceId] || "";
    if (!searchTerm.trim()) {
      return allPieces;
    }
    
    const searchLower = searchTerm.toLowerCase();
    return allPieces.filter(piece => {
      const sn = (piece.sn || "").toLowerCase();
      const pn = (piece.pn || "").toLowerCase();
      const component = (piece.component || "").toLowerCase();
      return sn.includes(searchLower) || pn.includes(searchLower) || component.includes(searchLower);
    });
  }, [allPieces, snSearchTerms]);

  // Get display text for a piece
  const getPieceDisplayText = React.useCallback((piece: InventoryItem) => {
    const displayText = `${piece.sn || "—"} - ${piece.pn || "—"}`;
    const currentComponent = piece.component ? ` (${piece.component})` : "";
    return displayText + currentComponent;
  }, []);

  // Get selected piece display text
  const selectedPieceDisplay = React.useMemo(() => {
    if (!selectedPieceId) return "";
    const piece = allPieces.find(
      p => (p.id?.toString() === selectedPieceId) || 
           (p.sn === selectedPieceId) ||
           (String(p.pn) === selectedPieceId)
    );
    if (!piece) return "";
    return `${piece.sn || "—"} - ${piece.pn || "—"}`;
  }, [selectedPieceId, allPieces]);

  // Load turbines on mount
  React.useEffect(() => {
    const loadTurbines = async () => {
      try {
        const allTurbines = await turbineStorage.getAll();
        setTurbines(allTurbines);
      } catch (error) {
        console.error('Error loading turbines:', error);
        setTurbines([]);
      }
    };
    loadTurbines();
  }, []);

  // Filter turbines based on search term
  const filteredTurbines = React.useMemo(() => {
    if (!turbineSearchTerm.trim()) {
      return turbines;
    }
    
    const searchLower = turbineSearchTerm.toLowerCase();
    return turbines.filter(turbine => {
      const name = (turbine.name || "").toLowerCase();
      const id = (turbine.id || "").toLowerCase();
      const unit = (turbine.unit || "").toLowerCase();
      return name.includes(searchLower) || id.includes(searchLower) || unit.includes(searchLower);
    });
  }, [turbines, turbineSearchTerm]);

  // Get display text for a turbine
  const getTurbineDisplayText = React.useCallback((turbineId: string) => {
    if (turbineId === "unassigned" || !turbineId) {
      return "Unassigned";
    }
    const turbine = turbines.find(t => t.id === turbineId);
    if (!turbine) return turbineId;
    // Display format: "Unit 3A - T-301" (name - id)
    return `${turbine.name} - ${turbine.id}`;
  }, [turbines]);

  // Get current turbine display text
  const currentTurbineDisplay = React.useMemo(() => {
    const turbineId = editedComponent.turbine || "";
    if (!turbineId) return "Unassigned";
    return getTurbineDisplayText(turbineId);
  }, [editedComponent.turbine, getTurbineDisplayText]);

  const v = (x: unknown) =>
    x === null || x === undefined || x === "" ? "—" : String(x);

  const handleAddPiece = async () => {
    if (!selectedPieceId || !positionInput.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      // Find the selected piece
      const pieceToAssign = allPieces.find(
        p => (p.id?.toString() === selectedPieceId) || 
             (p.sn === selectedPieceId) ||
             (String(p.pn) === selectedPieceId)
      );

      if (!pieceToAssign) {
        alert("Selected piece not found.");
        return;
      }

      const componentName = item.componentName || "";

      // Update the piece with the component and position
      const updatedPiece: InventoryItem = {
        ...pieceToAssign,
        component: componentName,
        componentType: item.componentType || pieceToAssign.componentType || "Unknown",
        position: positionInput.trim(),
      };

      const success = await saveInventoryItem(updatedPiece);
      
      if (success) {
        setIsAddDialogOpen(false);
        setSelectedPieceId("");
        setPositionInput("");
        setPieceSearchTerm("");
        setIsPieceDropdownOpen(false);
        
        setIsRefreshing(true);
        // Small delay to ensure database write is committed
        await new Promise(resolve => setTimeout(resolve, 100));
        // Notify parent to refresh
        if (onPieceAdded) {
          await onPieceAdded();
        }
        setIsRefreshing(false);
      } else {
        console.error("Failed to save piece");
        alert("Failed to assign piece. Please try again.");
      }
    } catch (error) {
      console.error("Error assigning piece:", error);
      alert("Error assigning piece. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenDialog = () => {
    setSelectedPieceId("");
    setPositionInput("");
    setPieceSearchTerm("");
    setIsPieceDropdownOpen(false);
    setIsAddDialogOpen(true);
  };

  const handleStartEdit = () => {
    // Store original component values
    const originalComp = {
      componentName: item.componentName || "",
      componentType: item.componentType || "",
      hours: item.hours !== undefined && item.hours !== null ? item.hours : "",
      starts: item.starts !== undefined && item.starts !== null ? item.starts : "",
      trips: item.trips !== undefined && item.trips !== null ? item.trips : "",
      turbine: item.turbine || "",
      status: item.status || "",
      state: item.state || "",
    };
    setOriginalComponent(originalComp);
    
    // Initialize edited component with original values
    setEditedComponent(originalComp);
    
    // Initialize edited piece positions and store originals
    const initialPositions: Record<string, string> = {};
    const initialSNs: Record<string, string> = {};
    const initialSearchTerms: Record<string, string> = {};
    const originalPositions: Record<string, string> = {};
    const originalSNs: Record<string, string> = {};
    
    pieces.forEach(piece => {
      const pieceId = piece.id?.toString() || piece.sn || String(piece.pn);
      const position = piece.position || "";
      const sn = piece.sn || piece.pn?.toString() || "";
      
      // Store original values
      originalPositions[pieceId] = position;
      originalSNs[pieceId] = pieceId; // Store original piece ID
      
      // Initialize edited values with originals
      initialPositions[pieceId] = position;
      initialSNs[pieceId] = pieceId; // Start with current piece
      initialSearchTerms[pieceId] = sn; // Use SN for display
    });
    
    setOriginalPiecePositions(originalPositions);
    setOriginalPieceSNs(originalSNs);
    setEditedPiecePositions(initialPositions);
    setEditedPieceSNs(initialSNs);
    setSnSearchTerms(initialSearchTerms);
    setOpenSnDropdowns({});
    setDeletedPieceIds(new Set());
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    
    // Restore original component values if they were stored
    if (originalComponent) {
      setEditedComponent({
        componentName: originalComponent.componentName,
        componentType: originalComponent.componentType,
        hours: originalComponent.hours,
        starts: originalComponent.starts,
        trips: originalComponent.trips,
        turbine: originalComponent.turbine,
        status: originalComponent.status,
        state: originalComponent.state,
      });
    } else {
      // Fallback to current item values if no original was stored
      setEditedComponent({
        componentName: item.componentName || "",
        componentType: item.componentType || "",
        hours: item.hours !== undefined && item.hours !== null ? item.hours : "",
        starts: item.starts !== undefined && item.starts !== null ? item.starts : "",
        trips: item.trips !== undefined && item.trips !== null ? item.trips : "",
        turbine: item.turbine || "",
        status: item.status || "",
        state: item.state || "",
      });
    }
    
    // Restore original piece positions and SNs
    setEditedPiecePositions({ ...originalPiecePositions });
    setEditedPieceSNs({ ...originalPieceSNs });
    
    // Reset search terms and other edit state
    const resetSearchTerms: Record<string, string> = {};
    pieces.forEach(piece => {
      const pieceId = piece.id?.toString() || piece.sn || String(piece.pn);
      resetSearchTerms[pieceId] = piece.sn || piece.pn?.toString() || "";
    });
    setSnSearchTerms(resetSearchTerms);
    setOpenSnDropdowns({});
    setDeletedPieceIds(new Set());
    
    // Reset turbine search term
    setTurbineSearchTerm("");
    setIsTurbineDropdownOpen(false);
    
    // Clear original values
    setOriginalComponent(null);
    setOriginalPiecePositions({});
    setOriginalPieceSNs({});
  };

  const handleDeletePiece = (pieceId: string) => {
    setDeletedPieceIds(prev => new Set(prev).add(pieceId));
    // Also clear any edits for this piece
    setEditedPiecePositions(prev => {
      const newPositions = { ...prev };
      delete newPositions[pieceId];
      return newPositions;
    });
    setEditedPieceSNs(prev => {
      const newSNs = { ...prev };
      delete newSNs[pieceId];
      return newSNs;
    });
    setSnSearchTerms(prev => {
      const newTerms = { ...prev };
      delete newTerms[pieceId];
      return newTerms;
    });
  };

  const handleUndeletePiece = (pieceId: string) => {
    setDeletedPieceIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(pieceId);
      return newSet;
    });
  };

  const handleSaveComponent = async () => {
    setIsSavingComponent(true);
    try {
      // Try to find existing component by ID first, or by name if ID doesn't exist
      let existingComponent: Component | null = null;
      if (item.id) {
        existingComponent = await componentStorage.get(String(item.id));
      }
      
      // If not found by ID, try to find by name (in case component was created from mock data)
      if (!existingComponent && editedComponent.componentName) {
        const allComponents = await componentStorage.getAll();
        existingComponent = allComponents.find(
          c => c.name === editedComponent.componentName
        ) || null;
      }
      
      // Find or create ComponentType
      let typeCode: string | undefined;
      if (editedComponent.componentType) {
        const normalizedTypeCode = editedComponent.componentType.toLowerCase().replace(/\s+/g, '');
        let componentType = await componentTypeStorage.get(normalizedTypeCode);
        if (!componentType) {
          // Create new component type
          componentType = {
            code: normalizedTypeCode,
            name: editedComponent.componentType,
          };
          await componentTypeStorage.saveAll([componentType]);
        }
        typeCode = componentType.code;
      }
      
      // Prepare component data to save (matching database schema)
      const now = new Date().toISOString();
      
      // Parse hours, trips, starts from edited values
      const parseNumber = (value: string | number | undefined): number => {
        if (typeof value === 'number') return value;
        if (typeof value === 'string' && value !== "" && value !== "—") {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };
      
      const componentHours = parseNumber(editedComponent.hours);
      const componentTrips = parseNumber(editedComponent.trips);
      const componentStarts = parseNumber(editedComponent.starts);
      
      const componentToSave: Component = {
        // Use existing ID if found, otherwise generate new ID
        id: existingComponent?.id || `component-${Date.now()}`,
        name: editedComponent.componentName,
        type_code: typeCode || existingComponent?.type_code || '',
        hours: componentHours,
        trips: componentTrips,
        starts: componentStarts,
        created_at: existingComponent?.created_at || now,
      };

      // Save component to database
      const componentSuccess = await componentStorage.save(componentToSave);
      
      if (!componentSuccess) {
        alert("Failed to save component. Please try again.");
        setIsSavingComponent(false);
        return;
      }
      
      console.log("Component saved successfully:", componentToSave);

      // Save piece position changes, SN replacements, and deletions
      const pieceUpdates: InventoryItem[] = [];
      const componentName = editedComponent.componentName || item.componentName || "";
      const componentType = editedComponent.componentType || item.componentType || "";
      
      // First, handle deleted pieces - remove them from component
      for (const pieceId of deletedPieceIds) {
        const piece = pieces.find(
          p => (p.id?.toString() === pieceId) || 
               (p.sn === pieceId) ||
               (String(p.pn) === pieceId)
        );
        
        if (piece) {
          pieceUpdates.push({
            ...piece,
            component: "",
            position: "",
          });
        }
      }
      
      // Then handle position changes and SN replacements (skip deleted pieces)
      for (const [pieceId, newPosition] of Object.entries(editedPiecePositions)) {
        // Skip if this piece is marked for deletion
        if (deletedPieceIds.has(pieceId)) continue;
        
        const piece = pieces.find(
          p => (p.id?.toString() === pieceId) || 
               (p.sn === pieceId) ||
               (String(p.pn) === pieceId)
        );
        
        if (!piece) continue;
        
        // Check if SN was changed (piece replacement)
        const newPieceId = editedPieceSNs[pieceId];
        if (newPieceId && newPieceId !== pieceId) {
          // Find the new piece to replace with
          const newPiece = allPieces.find(
            p => (p.id?.toString() === newPieceId) || 
                 (p.sn === newPieceId) ||
                 (String(p.pn) === newPieceId)
          );
          
          if (newPiece) {
            // Remove old piece from component (clear its component assignment)
            pieceUpdates.push({
              ...piece,
              component: "",
              position: "",
            });
            
            // Add new piece to component with the position
            pieceUpdates.push({
              ...newPiece,
              component: componentName,
              componentType: componentType || newPiece.componentType,
              position: newPosition.trim() || "",
            });
          }
        } else {
          // Update piece with new position and ensure component name/type are updated
          const updatedPiece: InventoryItem = {
            ...piece,
            component: componentName,
            componentType: componentType || piece.componentType,
            position: newPosition.trim() || piece.position || "",
          };
          
          // Only add to updates if something actually changed
          if (piece.position !== newPosition.trim() || 
              piece.component !== componentName ||
              piece.componentType !== componentType) {
            pieceUpdates.push(updatedPiece);
          }
        }
      }

      // If component name changed, update all pieces that belong to this component
      const oldComponentName = item.componentName || "";
      if (componentName !== oldComponentName && oldComponentName) {
        // Find all pieces that belong to the old component name
        const piecesToUpdate = pieces.filter(p => p.component === oldComponentName);
        piecesToUpdate.forEach(piece => {
          // Only add if not already in updates
          const alreadyInUpdates = pieceUpdates.some(
            p => (p.id?.toString() === piece.id?.toString()) ||
                 (p.sn === piece.sn) ||
                 (String(p.pn) === String(piece.pn))
          );
          
          if (!alreadyInUpdates) {
            pieceUpdates.push({
              ...piece,
              component: componentName,
              componentType: componentType || piece.componentType,
            });
          }
        });
      }

      // Save all piece updates to database
      if (pieceUpdates.length > 0) {
        // Save each piece using saveInventoryItem (handles new database structure)
        const savePromises = pieceUpdates.map(piece => saveInventoryItem(piece));
        const saveResults = await Promise.all(savePromises);
        const successCount = saveResults.filter(result => result === true).length;
        
        if (successCount < pieceUpdates.length) {
          console.error(`Failed to save ${pieceUpdates.length - successCount} of ${pieceUpdates.length} piece position changes`);
          // Still show success for component, but warn about pieces
          alert(`Component saved, but ${pieceUpdates.length - successCount} piece position changes may not have been saved.`);
        } else {
          console.log(`Successfully saved ${pieceUpdates.length} piece updates`);
        }
      }

      // Update pieces with status, state, and turbine if any were edited
      // NOTE: Component hours/trips/starts are independent and should NOT update pieces
      const statusChanged = editedComponent.status !== item.status && editedComponent.status !== "";
      const stateChanged = editedComponent.state !== item.state && editedComponent.state !== "";
      const turbineChanged = editedComponent.turbine !== item.turbine;
      
      if (statusChanged || stateChanged || turbineChanged) {
        const pieceUpdates: InventoryItem[] = [];
        
        // Get all pieces that belong to this component (including ones not in the current pieces list)
        const allComponentPieces = allPieces.filter(p => {
          const pieceComponent = p.component || "";
          return pieceComponent === componentName;
        });
        
        allComponentPieces.forEach(piece => {
          // Skip if piece is marked for deletion
          const pieceId = piece.id?.toString() || piece.sn || String(piece.pn);
          if (deletedPieceIds.has(pieceId)) return;
          
          const updatedPiece: InventoryItem = { ...piece };
          let hasChanges = false;
          
          // Update status if changed
          if (statusChanged && editedComponent.status) {
            updatedPiece.status = editedComponent.status as InventoryItem['status'];
            hasChanges = true;
          }
          
          // Update state if changed
          if (stateChanged && editedComponent.state) {
            updatedPiece.state = editedComponent.state as InventoryItem['state'];
            hasChanges = true;
          }
          
          // Update turbine if changed
          if (turbineChanged) {
            updatedPiece.turbine = editedComponent.turbine || "";
            hasChanges = true;
          }
          
          if (hasChanges) {
            pieceUpdates.push(updatedPiece);
          }
        });
        
        // Save all piece updates (status, state, turbine)
        if (pieceUpdates.length > 0) {
          const savePromises = pieceUpdates.map(piece => saveInventoryItem(piece));
          const saveResults = await Promise.all(savePromises);
          const successCount = saveResults.filter(result => result === true).length;
          
          if (successCount < pieceUpdates.length) {
            console.error(`Failed to save ${pieceUpdates.length - successCount} of ${pieceUpdates.length} piece updates`);
          } else {
            console.log(`Successfully saved ${pieceUpdates.length} piece updates`);
          }
        }
      }

      // Update ComponentAssignment if turbine was changed
      if (turbineChanged && componentToSave.id) {
        try {
          const now = new Date().toISOString();
          
          // Get current assignment (if any)
          const currentAssignment = await componentAssignmentStorage.getCurrentByComponent(componentToSave.id);
          
          // If there's a current assignment to a different turbine, end it
          if (currentAssignment && currentAssignment.turbine_id !== editedComponent.turbine) {
            const oldAssignment: ComponentAssignment = {
              ...currentAssignment,
              valid_to: now,
            };
            await componentAssignmentStorage.save(oldAssignment);
          }
          
          // Create new assignment if turbine is set
          if (editedComponent.turbine && editedComponent.turbine !== "" && editedComponent.turbine !== "unassigned") {
            const newAssignment: ComponentAssignment = {
              id: `assignment-${Date.now()}`,
              turbine_id: editedComponent.turbine,
              component_id: componentToSave.id,
              position: 1, // Default position, could be made editable later
              valid_from: now,
              valid_to: undefined, // Currently assigned
              created_at: now,
            };
            await componentAssignmentStorage.save(newAssignment);
            console.log("Component assignment updated:", newAssignment);
          } else if (currentAssignment) {
            // If turbine is cleared, end the current assignment
            const endedAssignment: ComponentAssignment = {
              ...currentAssignment,
              valid_to: now,
            };
            await componentAssignmentStorage.save(endedAssignment);
            console.log("Component assignment ended:", endedAssignment);
          }
        } catch (error) {
          console.error("Error updating component assignment:", error);
          // Don't fail the whole save if assignment update fails
        }
      }

      setIsEditing(false);
      setEditedPiecePositions({});
      setEditedPieceSNs({});
      setSnSearchTerms({});
      setOpenSnDropdowns({});
      setDeletedPieceIds(new Set());
      
      // Clear original values after successful save
      setOriginalComponent(null);
      setOriginalPiecePositions({});
      setOriginalPieceSNs({});
      
      setIsRefreshing(true);
      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      // Notify parent to refresh
      if (onComponentUpdated) {
        await onComponentUpdated();
      }
      if (onPieceAdded) {
        await onPieceAdded();
      }
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error saving component:", error);
      alert("Error saving component. Please try again.");
    } finally {
      setIsSavingComponent(false);
    }
  };

  const handlePieceSelect = (pieceId: string) => {
    setSelectedPieceId(pieceId);
    setIsPieceDropdownOpen(false);
    // Update search term to show selected piece
    const piece = allPieces.find(
      p => (p.id?.toString() === pieceId) || 
           (p.sn === pieceId) ||
           (String(p.pn) === pieceId)
    );
    if (piece) {
      setPieceSearchTerm(`${piece.sn || "—"} - ${piece.pn || "—"}`);
    }
  };

  const handlePieceSearchChange = (value: string) => {
    setPieceSearchTerm(value);
    setIsPieceDropdownOpen(true);
    
    // Try to find exact match by SN, PN, or ID
    const exactMatch = availablePieces.find(piece => {
      const pieceId = piece.id?.toString() || "";
      const sn = piece.sn || "";
      const pn = String(piece.pn || "");
      return sn === value || pn === value || pieceId === value;
    });
    
    if (exactMatch) {
      const matchId = exactMatch.id?.toString() || exactMatch.sn || String(exactMatch.pn);
      setSelectedPieceId(matchId);
    } else if (selectedPieceId && value !== selectedPieceDisplay) {
      // Clear selection if user is typing something different
      setSelectedPieceId("");
    }
  };
  return (
    <div className="w-full bg-gray-100 rounded-lg p-6 space-y-6 relative">
      {/* Refreshing overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Refreshing data...</p>
          </div>
        </div>
      )}
      
      {/* Top Section: General Component Information */}
      <div className="space-y-4">
        {/* Header Row with Edit Button */}
        <div className="flex justify-end items-center">
          {!isEditing ? (
            <button
              onClick={handleStartEdit}
              className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1"
              title="Edit component"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={handleSaveComponent}
                disabled={isSavingComponent}
                className="px-2 py-1 rounded-md text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 flex items-center gap-1 disabled:opacity-50"
                title="Save changes"
              >
                <Check className="h-3 w-3" />
                {isSavingComponent ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSavingComponent}
                className="px-2 py-1 rounded-md text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 flex items-center gap-1 disabled:opacity-50"
                title="Cancel editing"
              >
                <X className="h-3 w-3" />
                Cancel
              </button>
            </div>
          )}
        </div>
        
        {/* Component Details Row */}
        {isEditing ? (
          <div className="flex justify-between items-center gap-4">
            <Input
              value={editedComponent.componentName}
              onChange={(e) => setEditedComponent(prev => ({ ...prev, componentName: e.target.value }))}
              className="flex-1"
              placeholder="Component Name"
            />
            <Input
              value={editedComponent.componentType}
              onChange={(e) => setEditedComponent(prev => ({ ...prev, componentType: e.target.value }))}
              className="flex-1"
              placeholder="Component Type"
            />
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <div className="text-lg font-semibold text-gray-900">
              {item.componentName || "—"}
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {item.componentType || "—"}
            </div>
          </div>
        )}

        {/* Component Status Section */}
        <div className="bg-white rounded-md p-4 space-y-3 border border-gray-200">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Turbine Engine</span>
            {isEditing ? (
              <div className="relative w-48">
                <Input
                  value={turbineSearchTerm || currentTurbineDisplay}
                  onChange={(e) => {
                    const searchValue = e.target.value;
                    setTurbineSearchTerm(searchValue);
                    setIsTurbineDropdownOpen(true);
                    
                    // Try to find exact match
                    const exactMatch = turbines.find(t => {
                      const name = t.name || "";
                      const id = t.id || "";
                      const unit = t.unit || "";
                      return name === searchValue || id === searchValue || unit === searchValue;
                    });
                    
                    if (exactMatch) {
                      setEditedComponent(prev => ({ ...prev, turbine: exactMatch.id }));
                      setTurbineSearchTerm("");
                      setIsTurbineDropdownOpen(false);
                    } else if (searchValue.toLowerCase() === "unassigned" || searchValue === "") {
                      setEditedComponent(prev => ({ ...prev, turbine: "" }));
                      setTurbineSearchTerm("");
                      setIsTurbineDropdownOpen(false);
                    }
                  }}
                  onFocus={() => {
                    setIsTurbineDropdownOpen(true);
                    // Clear search term on focus so user can start typing fresh
                    if (turbineSearchTerm === currentTurbineDisplay) {
                      setTurbineSearchTerm("");
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => {
                      setIsTurbineDropdownOpen(false);
                      // Reset search term to show current selection
                      setTurbineSearchTerm("");
                    }, 200);
                  }}
                  className="w-full"
                  placeholder="Search turbines..."
                />
                {isTurbineDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                    {/* Unassigned option */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditedComponent(prev => ({ ...prev, turbine: "" }));
                        setTurbineSearchTerm("");
                        setIsTurbineDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                        !editedComponent.turbine ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      Unassigned
                    </button>
                    {filteredTurbines.map((turbine) => {
                      const isSelected = editedComponent.turbine === turbine.id;
                      const displayText = `${turbine.name} - ${turbine.id}`;
                      return (
                        <button
                          key={turbine.id}
                          type="button"
                          onClick={() => {
                            setEditedComponent(prev => ({ ...prev, turbine: turbine.id }));
                            setTurbineSearchTerm("");
                            setIsTurbineDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                            isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          {displayText}
                        </button>
                      );
                    })}
                  </div>
                )}
                {isTurbineDropdownOpen && turbineSearchTerm.trim() && filteredTurbines.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-3">
                    <p className="text-sm text-muted-foreground">No turbines found matching "{turbineSearchTerm}"</p>
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
                {v(item.turbine)}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Status</span>
            {(() => {
              const statusValue = v(item.status);
              const statusTone = getTone(statusValue, 'status', colorSettings);
              const statusColor = getColorName(statusValue, 'status', colorSettings);
              return (
                <Badge 
                  text={statusValue} 
                  tone={statusTone} 
                  colorName={statusColor} 
                />
              );
            })()}
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">State</span>
            {isEditing ? (
              <Select
                value={editedComponent.state}
                onValueChange={(value) => setEditedComponent(prev => ({ ...prev, state: value }))}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Service">In Service</SelectItem>
                  <SelectItem value="Out of Service">Out of Service</SelectItem>
                  <SelectItem value="Standby">Standby</SelectItem>
                  <SelectItem value="Repair">Repair</SelectItem>
                  <SelectItem value="On Order">On Order</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              (() => {
                const stateValue = v(item.state);
                const stateTone = getTone(stateValue, 'state', colorSettings);
                const stateColor = getColorName(stateValue, 'state', colorSettings);
                return (
                  <Badge 
                    text={stateValue} 
                    tone={stateTone} 
                    colorName={stateColor} 
                  />
                );
              })()
            )}
          </div>
        </div>

        {/* Intervals Section */}
        <div className="bg-white rounded-md p-4 space-y-3 border border-gray-200">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Interval FH</span>
            {isEditing ? (
              <Input
                type="number"
                value={editedComponent.hours}
                onChange={(e) => setEditedComponent(prev => ({ ...prev, hours: e.target.value }))}
                className="w-32"
                placeholder="Hours"
              />
            ) : (
              <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
                {item.hours !== undefined && item.hours !== null ? item.hours : "###"}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Interval FS</span>
            {isEditing ? (
              <Input
                type="number"
                value={editedComponent.starts}
                onChange={(e) => setEditedComponent(prev => ({ ...prev, starts: e.target.value }))}
                className="w-32"
                placeholder="Starts"
              />
            ) : (
              <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
                {item.starts !== undefined && item.starts !== null ? item.starts : "###"}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Interval Trips</span>
            {isEditing ? (
              <Input
                type="number"
                value={editedComponent.trips}
                onChange={(e) => setEditedComponent(prev => ({ ...prev, trips: e.target.value }))}
                className="w-32"
                placeholder="Trips"
              />
            ) : (
              <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
                {item.trips !== undefined && item.trips !== null ? item.trips : "###"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Component Parts Table */}
      <div className="space-y-3">
        {/* Table Header */}
        <div className={`grid gap-4 text-sm font-medium text-gray-700 border-b border-gray-300 pb-2 ${isEditing ? 'grid-cols-6' : 'grid-cols-5'}`}>
          <div>Position</div>
          <div>PN</div>
          <div>SN</div>
          <div>Status</div>
          <div>State</div>
          {isEditing && <div className="text-center">Actions</div>}
        </div>

        {/* Table Rows */}
        <div className="space-y-2">
          {sortedPieces.length > 0 ? (
            sortedPieces
              .filter(piece => {
                // Filter out deleted pieces in edit mode
                if (!isEditing) return true;
                const pieceId = piece.id?.toString() || piece.sn || String(piece.pn);
                return !deletedPieceIds.has(pieceId);
              })
              .map((piece, index) => {
              const pieceId = piece.id?.toString() || piece.sn || String(piece.pn);
              const currentPosition = isEditing 
                ? (editedPiecePositions[pieceId] ?? piece.position ?? "")
                : piece.position;
              const isDeleted = deletedPieceIds.has(pieceId);
              
              // Get status and state colors
              const statusTone = getTone(piece.status || "", 'status', colorSettings);
              const stateTone = getTone(piece.state || "", 'state', colorSettings);
              const statusColor = getColorName(piece.status || "", 'status', colorSettings);
              const stateColor = getColorName(piece.state || "", 'state', colorSettings);
              
              return (
                <div 
                  key={piece.id || piece.sn || index} 
                  className={`grid gap-4 text-sm text-gray-900 ${isEditing ? 'grid-cols-6' : 'grid-cols-5'} ${isDeleted ? 'opacity-50 line-through' : ''}`}
                >
                  {isEditing ? (
                    <Input
                      value={currentPosition}
                      onChange={(e) => {
                        setEditedPiecePositions(prev => ({
                          ...prev,
                          [pieceId]: e.target.value,
                        }));
                      }}
                      className="h-8 text-sm"
                      placeholder="Position"
                    />
                  ) : (
                    <div>{v(piece.position)}</div>
                  )}
                  <div>{v(piece.pn)}</div>
                  {isEditing ? (
                    <div className="relative">
                      <Input
                        value={(() => {
                          const selectedPieceId = editedPieceSNs[pieceId];
                          if (selectedPieceId && selectedPieceId !== pieceId) {
                            // Show selected piece's SN
                            const selectedPiece = allPieces.find(
                              p => (p.id?.toString() === selectedPieceId) || 
                                   (p.sn === selectedPieceId) ||
                                   (String(p.pn) === selectedPieceId)
                            );
                            return selectedPiece?.sn || snSearchTerms[pieceId] || piece.sn || "";
                          }
                          return snSearchTerms[pieceId] ?? piece.sn ?? "";
                        })()}
                        onChange={(e) => {
                          const searchValue = e.target.value;
                          setSnSearchTerms(prev => ({
                            ...prev,
                            [pieceId]: searchValue,
                          }));
                          setOpenSnDropdowns(prev => ({
                            ...prev,
                            [pieceId]: true,
                          }));
                          
                          // Try to find exact match
                          const exactMatch = allPieces.find(p => {
                            const pId = p.id?.toString() || p.sn || String(p.pn);
                            const sn = p.sn || "";
                            const pn = String(p.pn || "");
                            return sn === searchValue || pn === searchValue || pId === searchValue;
                          });
                          
                          if (exactMatch) {
                            const matchId = exactMatch.id?.toString() || exactMatch.sn || String(exactMatch.pn);
                            setEditedPieceSNs(prev => ({
                              ...prev,
                              [pieceId]: matchId,
                            }));
                          } else if (editedPieceSNs[pieceId] && searchValue !== getPieceDisplayText(piece)) {
                            // Clear selection if user is typing something different
                            setEditedPieceSNs(prev => {
                              const newSNs = { ...prev };
                              delete newSNs[pieceId];
                              return newSNs;
                            });
                          }
                        }}
                        onFocus={() => {
                          setOpenSnDropdowns(prev => ({
                            ...prev,
                            [pieceId]: true,
                          }));
                        }}
                        onBlur={() => {
                          setTimeout(() => {
                            setOpenSnDropdowns(prev => ({
                              ...prev,
                              [pieceId]: false,
                            }));
                          }, 200);
                        }}
                        className="h-8 text-sm"
                        placeholder="Search SN..."
                      />
                      {openSnDropdowns[pieceId] && getFilteredPiecesForSN(pieceId).length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                          {getFilteredPiecesForSN(pieceId).map((p) => {
                            const pId = p.id?.toString() || p.sn || String(p.pn);
                            const isSelected = editedPieceSNs[pieceId] === pId;
                            return (
                              <button
                                key={pId}
                                type="button"
                                onClick={() => {
                                  setEditedPieceSNs(prev => ({
                                    ...prev,
                                    [pieceId]: pId,
                                  }));
                                  setSnSearchTerms(prev => ({
                                    ...prev,
                                    [pieceId]: p.sn || "",
                                  }));
                                  setOpenSnDropdowns(prev => ({
                                    ...prev,
                                    [pieceId]: false,
                                  }));
                                }}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm ${
                                  isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                                }`}
                              >
                                {getPieceDisplayText(p)}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      {openSnDropdowns[pieceId] && snSearchTerms[pieceId]?.trim() && getFilteredPiecesForSN(pieceId).length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-3">
                          <p className="text-sm text-muted-foreground">No pieces found matching "{snSearchTerms[pieceId]}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>{v(piece.sn)}</div>
                  )}
                  <div>
                    <Badge 
                      text={piece.status || "—"} 
                      tone={statusTone} 
                      colorName={statusColor} 
                    />
                  </div>
                  <div>
                    <Badge 
                      text={piece.state || "—"} 
                      tone={stateTone} 
                      colorName={stateColor} 
                    />
                  </div>
                  {isEditing && (
                    <div className="flex justify-center items-center">
                      <button
                        onClick={() => handleDeletePiece(pieceId)}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Remove piece from component"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-sm text-gray-500 italic text-center py-4">
              No pieces found for this component
            </div>
          )}
          
          {/* Add Row */}
          <div className={`grid gap-4 text-sm pt-2 ${isEditing ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <div className={`${isEditing ? 'col-span-6' : 'col-span-5'} flex justify-center`}>
              <button
                onClick={handleOpenDialog}
                className="px-6 py-2.5 rounded-sm border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 text-gray-600 hover:text-gray-700 transition-all cursor-pointer font-medium text-sm min-w-[140px]"
                title="Add new piece"
              >
                + Add Piece
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Piece Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Piece to Component</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                placeholder="Enter position (e.g., 1, 2, A, B)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="piece">Select Piece</Label>
              <div className="relative">
                <Input
                  id="piece"
                  value={pieceSearchTerm}
                  onChange={(e) => handlePieceSearchChange(e.target.value)}
                  onFocus={() => setIsPieceDropdownOpen(true)}
                  onBlur={() => {
                    // Delay closing to allow click on dropdown item
                    setTimeout(() => setIsPieceDropdownOpen(false), 200);
                  }}
                  placeholder="Type to search for a piece..."
                />
                {isPieceDropdownOpen && filteredPieces.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredPieces.map((piece) => {
                      const pieceId = piece.id?.toString() || piece.sn || String(piece.pn);
                      const displayText = `${piece.sn || "—"} - ${piece.pn || "—"}`;
                      const currentComponent = piece.component ? ` (${piece.component})` : "";
                      const isSelected = selectedPieceId === pieceId;
                      return (
                        <button
                          key={pieceId}
                          type="button"
                          onClick={() => handlePieceSelect(pieceId)}
                          className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <div className="text-sm">
                            {displayText}
                            {currentComponent && (
                              <span className="text-muted-foreground">{currentComponent}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {isPieceDropdownOpen && pieceSearchTerm.trim() && filteredPieces.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border rounded-md shadow-lg p-3">
                    <p className="text-sm text-muted-foreground">No pieces found matching "{pieceSearchTerm}"</p>
                  </div>
                )}
              </div>
              {availablePieces.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  All pieces are already assigned to components.
                </p>
              )}
            </div>

            {selectedPieceId && positionInput.trim() && (
              <div className="space-y-2 p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">Will be assigned to:</p>
                <p className="text-sm text-muted-foreground">
                  Component: <span className="font-medium">{item.componentName || "—"}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Position: <span className="font-medium">{positionInput.trim()}</span>
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPiece}
              disabled={!selectedPieceId || !positionInput.trim() || availablePieces.length === 0 || isSaving}
            >
              {isSaving ? "Adding..." : "Add Piece"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
