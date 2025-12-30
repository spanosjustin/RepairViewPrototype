"use client";

import * as React from "react";
import type { InventoryItem, RepairEvent } from "@/lib/inventory/types";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getTone, getColorName, getBadgeClasses } from "@/lib/settings/colorMapper";
import { ChevronDown, Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveInventoryItem } from "@/lib/storage/db/adapters";
import { turbineStorage, componentStorage, componentAssignmentStorage } from "@/lib/storage/db/storage";
import type { Turbine, Component } from "@/lib/storage/db/types";

type ItemWithExtras = InventoryItem & {
  turbine?: string | null;
  position?: string | null;
  notes?: (string | null)[] | null;     // multiple general notes
  repairEvents?: RepairEvent[] | null; // list of repair events
};

export default function PieceInfoCard({ 
  item,
  onNotesUpdate,
  onPieceUpdated,
  onRepairEventsUpdate
}: { 
  item: ItemWithExtras;
  onNotesUpdate?: (pieceId: string, notes: string[]) => void;
  onPieceUpdated?: () => void;
  onRepairEventsUpdate?: (pieceId: string, repairEvents: RepairEvent[]) => void;
}) {
  const [tab, setTab] = React.useState<"repair" | "condition">("repair");
  const [isRepairEventExpanded, setIsRepairEventExpanded] = React.useState(false);
  
  // Load color settings from IndexedDB
  const { data: colorSettings = [] } = useStatusColors();

  // Load turbines from database
  const [turbines, setTurbines] = React.useState<Turbine[]>([]);
  
  // Load components from database
  const [components, setComponents] = React.useState<Component[]>([]);
  
  // Turbine combobox state
  const [turbineSearchTerm, setTurbineSearchTerm] = React.useState<string>("");
  const [isTurbineDropdownOpen, setIsTurbineDropdownOpen] = React.useState(false);
  
  // Component combobox state
  const [componentSearchTerm, setComponentSearchTerm] = React.useState<string>("");
  const [isComponentDropdownOpen, setIsComponentDropdownOpen] = React.useState(false);
  // Track if user has manually edited the component search term (to prevent auto-repopulation)
  const componentSearchTermUserEditedRef = React.useRef(false);
  
  // Component's turbine value (read-only, from ComponentAssignment)
  const [componentTurbine, setComponentTurbine] = React.useState<string | null>(null);
  
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
  
  React.useEffect(() => {
    const loadComponents = async () => {
      try {
        const allComponents = await componentStorage.getAll();
        setComponents(allComponents);
      } catch (error) {
        console.error('Error loading components:', error);
        setComponents([]);
      }
    };
    
    loadComponents();
  }, []);
  
  // Function to load component's turbine value
  // Accepts componentName parameter to support both item.component and editedPiece.component
  const loadComponentTurbine = React.useCallback(async (componentName?: string) => {
    // Use provided componentName, or fall back to item.component
    const nameToUse = componentName || item.component || "";
    if (!nameToUse) {
      setComponentTurbine(null);
      return;
    }
    
    try {
      // Reload components to ensure we have the latest data (in case component was updated)
      const allComponents = await componentStorage.getAll();
      setComponents(allComponents);
      
      // Find component by name
      const component = allComponents.find(c => c.name === nameToUse);
      if (!component || !component.id) {
        setComponentTurbine(null);
        return;
      }
      
      // Get component assignment to find turbine (this is the source of truth)
      const currentAssignment = await componentAssignmentStorage.getCurrentByComponent(String(component.id));
      if (currentAssignment && currentAssignment.turbine_id) {
        setComponentTurbine(currentAssignment.turbine_id);
      } else {
        setComponentTurbine("unassigned");
      }
    } catch (error) {
      console.error('Error loading component turbine:', error);
      setComponentTurbine(null);
    }
  }, [item.component]);
  

  
  // Filter turbines based on search term
  const filteredTurbines = React.useMemo(() => {
    if (!turbineSearchTerm.trim()) {
      return turbines;
    }
    
    const searchLower = turbineSearchTerm.toLowerCase();
    return turbines.filter(t => {
      const name = (t.name || "").toLowerCase();
      const id = (t.id || "").toLowerCase();
      const unit = (t.unit || "").toLowerCase();
      const displayText = `${t.name} - ${t.id}`.toLowerCase();
      return name.includes(searchLower) || 
             id.includes(searchLower) || 
             unit.includes(searchLower) ||
             displayText.includes(searchLower);
    });
  }, [turbines, turbineSearchTerm]);
  
  // Get display text for a turbine
  const getTurbineDisplayText = React.useCallback((turbineId: string) => {
    if (turbineId === "unassigned" || !turbineId) {
      return "Unassigned";
    }
    const turbine = turbines.find(t => t.id === turbineId);
    if (!turbine) return turbineId;
    return `${turbine.name} - ${turbine.id}`;
  }, [turbines]);
  
  // Filter components based on search term
  const filteredComponents = React.useMemo(() => {
    if (!componentSearchTerm || !componentSearchTerm.trim()) {
      return components;
    }
    
    const searchLower = componentSearchTerm.toLowerCase();
    return components.filter(c => {
      const name = (c.name || "").toLowerCase();
      const id = (c.id || "").toLowerCase();
      const typeCode = (c.type_code || "").toLowerCase();
      return name.includes(searchLower) || 
             id.includes(searchLower) || 
             typeCode.includes(searchLower);
    });
  }, [components, componentSearchTerm]);
  
  // Get display text for a component
  const getComponentDisplayText = React.useCallback((componentName: string) => {
    if (!componentName) return "";
    // Try to find component by name first
    const component = components.find(c => c.name === componentName);
    if (component) {
      return component.name;
    }
    // If not found, just return the name as-is
    return componentName;
  }, [components]);

  /* ---------- Edit Mode State ---------- */
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [editedPiece, setEditedPiece] = React.useState<InventoryItem>({
    id: item.id,
    sn: item.sn || "",
    pn: item.pn || "",
    hours: typeof item.hours === "number" ? item.hours : 0,
    trips: typeof item.trips === "number" ? item.trips : 0,
    starts: typeof item.starts === "number" ? item.starts : 0,
    status: item.status || "OK",
    state: item.state || "In Service",
    component: item.component || "",
    componentType: item.componentType || "",
    turbine: item.turbine || "",
    position: item.position || "",
  });
  const [editedNotes, setEditedNotes] = React.useState<Array<{ id: string; text: string }>>([]);
  const [editedRepairEvents, setEditedRepairEvents] = React.useState<Array<{ id: string; event: RepairEvent }>>([]);

  /* ---------- Notes State ---------- */
  const notes = item.notes ?? [];
  const [noteIdx, setNoteIdx] = React.useState(0);
  const currentNote = notes[noteIdx] ?? null;
  const [isEditingNote, setIsEditingNote] = React.useState(false);
  const [editedNote, setEditedNote] = React.useState("");
  // Initialize localNotes with valid notes only (filter out empty/null)
  const initialNotes = (item.notes ?? [])
    .filter(n => n != null && String(n).trim() !== "")
    .map(n => String(n));
  const [localNotes, setLocalNotes] = React.useState<string[]>(initialNotes);

  /* ---------- Repair Events State ---------- */
  const events = item.repairEvents ?? [];
  const [eventIdx, setEventIdx] = React.useState(0);
  const currentEvent = events[eventIdx] ?? null;
  const [localEvents, setLocalEvents] = React.useState<RepairEvent[]>(events);
  const [isEditingRepairEvent, setIsEditingRepairEvent] = React.useState(false);
  const [editedRepairDetails, setEditedRepairDetails] = React.useState("");
  const [editedConditionDetails, setEditedConditionDetails] = React.useState("");

  // Update editedPiece when item changes (when not in edit mode)
  React.useEffect(() => {
    if (!isEditing) {
      setEditedPiece({
        id: item.id,
        sn: item.sn || "",
        pn: item.pn || "",
        hours: typeof item.hours === "number" ? item.hours : 0,
        trips: typeof item.trips === "number" ? item.trips : 0,
        starts: typeof item.starts === "number" ? item.starts : 0,
        status: item.status || "OK",
        state: item.state || "In Service",
        component: item.component || "",
        componentType: item.componentType || "",
        turbine: item.turbine || "",
        position: item.position || "",
      });
      // Reset component search when exiting edit mode
      setComponentSearchTerm("");
      setIsComponentDropdownOpen(false);
    }
  }, [item, isEditing]);

  // Update component turbine when editedPiece.component changes during editing
  // This ensures the turbine field updates immediately when user changes the component
  React.useEffect(() => {
    console.log('Turbine update effect triggered:', { isEditing, component: editedPiece.component });
    
    if (isEditing && editedPiece.component) {
      const loadTurbine = async () => {
        try {
          console.log('Loading turbine for component:', editedPiece.component);
          
          // Load components if not already loaded
          const allComponents = await componentStorage.getAll();
          setComponents(allComponents);
          
          console.log('Loaded components:', allComponents.length);
          
          // Find component by name
          const component = allComponents.find(c => c.name === editedPiece.component);
          console.log('Found component:', component);
          
          if (!component || !component.id) {
            console.log('Component not found or no ID');
            setComponentTurbine(null);
            return;
          }
          
          // Get component assignment to find turbine
          const currentAssignment = await componentAssignmentStorage.getCurrentByComponent(String(component.id));
          console.log('Component assignment:', currentAssignment);
          
          if (currentAssignment && currentAssignment.turbine_id) {
            console.log('Setting turbine to:', currentAssignment.turbine_id);
            setComponentTurbine(currentAssignment.turbine_id);
          } else {
            console.log('No assignment found, setting to unassigned');
            setComponentTurbine("unassigned");
          }
        } catch (error) {
          console.error('Error loading component turbine:', error);
          setComponentTurbine(null);
        }
      };
      
      loadTurbine();
    } else if (isEditing && !editedPiece.component) {
      // Component cleared - clear turbine
      console.log('Component cleared, clearing turbine');
      setComponentTurbine(null);
    }
  }, [isEditing, editedPiece.component]);


  // Load component turbine when item.component changes (fallback for external updates)
  // This runs when not in edit mode to catch updates from parent component
  React.useEffect(() => {
    if (!isEditing && item.component) {
      const loadTurbine = async () => {
        try {
          // Load components if not already loaded
          const allComponents = await componentStorage.getAll();
          setComponents(allComponents);
          
          // Find component by name
          const component = allComponents.find(c => c.name === item.component);
          if (!component || !component.id) {
            setComponentTurbine(null);
            return;
          }
          
          // Get component assignment to find turbine
          const currentAssignment = await componentAssignmentStorage.getCurrentByComponent(String(component.id));
          if (currentAssignment && currentAssignment.turbine_id) {
            setComponentTurbine(currentAssignment.turbine_id);
          } else {
            setComponentTurbine("unassigned");
          }
        } catch (error) {
          console.error('Error loading component turbine:', error);
          setComponentTurbine(null);
        }
      };
      
      loadTurbine();
    }
  }, [item.component, item.id, isEditing]);

  // Refresh component turbine periodically to catch assignment changes
  // This handles the case where component assignment changes in ComponentInfoCard
  // but the piece item doesn't change (since assignment is stored separately)
  React.useEffect(() => {
    if (!item.component || isEditing) return; // Don't poll while editing
    
    // Refresh component turbine every 3 seconds when card is open and not editing
    // This ensures the turbine field updates when component assignment is changed
    const interval = setInterval(async () => {
      try {
        const allComponents = await componentStorage.getAll();
        const component = allComponents.find(c => c.name === item.component);
        if (component && component.id) {
          const currentAssignment = await componentAssignmentStorage.getCurrentByComponent(String(component.id));
          if (currentAssignment && currentAssignment.turbine_id) {
            setComponentTurbine(currentAssignment.turbine_id);
          } else {
            setComponentTurbine("unassigned");
          }
        }
      } catch (error) {
        console.error('Error refreshing component turbine:', error);
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [item.component, isEditing]);

  // Update local notes when item.notes changes
  React.useEffect(() => {
    const newNotes = item.notes ?? [];
    // Filter out null/undefined and empty strings, then map to strings
    const validNotes = newNotes
      .filter(n => n != null && String(n).trim() !== "")
      .map(n => String(n));
    setLocalNotes(validNotes);
    // Also update editedNotes if not in edit mode (to sync after save)
    // Convert to structure with IDs
    if (!isEditing) {
      setEditedNotes(
        validNotes.map((text, idx) => ({ id: `note-${Date.now()}-${idx}`, text }))
      );
    }
  }, [item.notes, isEditing]);

  // clamp indices if data changes
  React.useEffect(() => {
    if (noteIdx >= localNotes.length) setNoteIdx(Math.max(0, localNotes.length - 1));
  }, [localNotes.length, noteIdx]);

  // Initialize edited note when entering edit mode
  React.useEffect(() => {
    if (isEditingNote) {
      // If there are no notes, start with empty string to allow adding a new note
      if (localNotes.length === 0) {
        setEditedNote("");
      } else {
        setEditedNote(localNotes[noteIdx] ?? "");
      }
    }
  }, [isEditingNote, noteIdx, localNotes]);

  React.useEffect(() => {
    if (eventIdx >= events.length) setEventIdx(Math.max(0, events.length - 1));
  }, [events.length, eventIdx]);

  // Update local events when item.repairEvents changes
  React.useEffect(() => {
    const newEvents = item.repairEvents ?? [];
    setLocalEvents(newEvents);
    // Also update editedRepairEvents if not in edit mode (to sync after save)
    if (!isEditing) {
      setEditedRepairEvents(
        newEvents.map((event, idx) => ({ id: `event-${Date.now()}-${idx}`, event }))
      );
    }
  }, [item.repairEvents, isEditing]);

  // Initialize edited repair/condition details when entering edit mode
  React.useEffect(() => {
    if (isEditingRepairEvent && currentEvent) {
      setEditedRepairDetails(currentEvent.repairDetails ?? "");
      setEditedConditionDetails(currentEvent.conditionDetails ?? "");
    }
  }, [isEditingRepairEvent, currentEvent]);

  // Track if we've initialized search terms for this edit session
  const searchTermsInitializedRef = React.useRef(false);
  
  // Initialize search terms when entering edit mode (only once per edit session)
  // Only depend on isEditing to prevent re-initialization when other values change
  React.useEffect(() => {
    if (isEditing && !searchTermsInitializedRef.current) {
      // Initialize component search term if we have a component value
      if (editedPiece.component) {
        setComponentSearchTerm(editedPiece.component);
      }
      // Turbine field is now read-only, so no need to initialize search term
      searchTermsInitializedRef.current = true;
      componentSearchTermUserEditedRef.current = false; // Reset user edit flag when entering edit mode
    } else if (!isEditing) {
      // Reset the flags when exiting edit mode
      searchTermsInitializedRef.current = false;
      componentSearchTermUserEditedRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]); // Only depend on isEditing - don't re-run when editedPiece or search terms change

  // Update component search term when components load and we're in edit mode
  // This ensures the search terms show the proper display text
  // BUT only if the user hasn't manually edited the field
  // IMPORTANT: Only update if searchTerm matches the value AND user hasn't edited - this prevents repopulation
  React.useEffect(() => {
    // Only update component search term if:
    // 1. We're in edit mode
    // 2. Components are loaded
    // 3. Search term matches the component value (meaning it hasn't been user-edited to something else)
    // 4. User hasn't manually edited the field
    // 5. Search term is NOT empty (if empty, user cleared it, so don't repopulate)
    if (isEditing && 
        components.length > 0 && 
        componentSearchTerm === editedPiece.component && 
        editedPiece.component && 
        componentSearchTerm !== "" &&  // Don't repopulate if user cleared it
        !componentSearchTermUserEditedRef.current) {
      const displayText = getComponentDisplayText(editedPiece.component);
      if (displayText && displayText !== componentSearchTerm) {
        setComponentSearchTerm(displayText);
      }
    }
    // Turbine field is now read-only, so no need to update search term
  }, [isEditing, editedPiece.component, components.length, componentSearchTerm, getComponentDisplayText]);

  const v = (x: unknown) =>
    x === null || x === undefined || x === "" ? "—" : String(x);

  // Helper function to extract and format date from repair event
  const formatEventDate = (event: RepairEvent | null): string => {
    if (!event) return "—";
    
    // First, try to use the date field if it exists
    if (event.date) {
      try {
        const date = new Date(event.date);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        }
      } catch (e) {
        // If date parsing fails, fall through to title extraction
      }
    }
    
    // If no date field, try to extract from title (format: "Title - YYYY-MM-DD")
    if (event.title) {
      const dateMatch = event.title.match(/- (\d{4}-\d{2}-\d{2})$/);
      if (dateMatch) {
        try {
          const date = new Date(dateMatch[1]);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
          }
        } catch (e) {
          // If date parsing fails, return dash
        }
      }
    }
    
    return "—";
  };

  const hasAnyNotes = localNotes.length > 0;
  const currentNoteValue = localNotes[noteIdx] ?? null;
  const hasAnyEvents = localEvents.length > 0;
  const currentLocalEvent = localEvents[eventIdx] ?? null;
  const hasRepair = !!currentLocalEvent?.repairDetails;
  const hasCondition = !!currentLocalEvent?.conditionDetails;
  const bothNull = currentLocalEvent ? !hasRepair && !hasCondition : true;
  
  // Get color information for status and state
  const statusValue = v(item.status);
  const stateValue = v(item.state);
  const statusTone = getTone(statusValue, 'status', colorSettings);
  const stateTone = getTone(stateValue, 'state', colorSettings);
  const statusColor = getColorName(statusValue, 'status', colorSettings);
  const stateColor = getColorName(stateValue, 'state', colorSettings);

  const handleRepairEventClick = () => {
    setIsRepairEventExpanded(prev => !prev);
  };

  const handleEditNote = () => {
    // Don't allow individual note editing when in main edit mode
    if (!isEditing) {
      setIsEditingNote(true);
    }
  };

  const handleSaveNote = async () => {
    const trimmedNote = editedNote.trim();
    
    // If there are no notes and we're adding one, create a new array
    // Otherwise, update the existing note at the current index
    let updatedNotes: string[];
    if (localNotes.length === 0) {
      // Adding first note
      updatedNotes = trimmedNote ? [trimmedNote] : [];
    } else {
      // Updating existing note
      updatedNotes = [...localNotes];
      if (trimmedNote) {
        updatedNotes[noteIdx] = trimmedNote;
      } else {
        // If note is empty, remove it (or keep it as empty string)
        updatedNotes[noteIdx] = "";
      }
    }
    
    // Filter out empty notes before saving
    const notesToSave = updatedNotes.filter(n => n.trim() !== "");
    
    setLocalNotes(updatedNotes);
    setIsEditingNote(false);
    
    // Save notes to the database by updating the piece
    try {
      const pieceToSave: InventoryItem = {
        ...item,
        notes: notesToSave.length > 0 ? notesToSave : undefined,
      };
      
      const success = await saveInventoryItem(pieceToSave);
      if (!success) {
        console.error("Failed to save notes to database");
        // Still update UI even if database save fails
      }
      
      // Notify parent component of the update
      if (onNotesUpdate) {
        const pieceId = item.sn || item.id || String(item.pn);
        onNotesUpdate(pieceId, notesToSave);
      }
      
      setIsRefreshing(true);
      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      // Notify parent to refresh piece data
      if (onPieceUpdated) {
        await onPieceUpdated();
      }
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error saving notes:", error);
      // Still update UI even if database save fails
      if (onNotesUpdate) {
        const pieceId = item.sn || item.id || String(item.pn);
        onNotesUpdate(pieceId, notesToSave);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditingNote(false);
    setEditedNote(localNotes[noteIdx] ?? "");
  };

  const handleEditRepairEvent = () => {
    if (!isEditing && currentLocalEvent) {
      setIsEditingRepairEvent(true);
    }
  };

  const handleSaveRepairEvent = async () => {
    if (!currentLocalEvent) return;
    
    const updatedEvents = [...localEvents];
    updatedEvents[eventIdx] = {
      ...currentLocalEvent,
      repairDetails: editedRepairDetails.trim() || null,
      conditionDetails: editedConditionDetails.trim() || null,
    };
    
    setLocalEvents(updatedEvents);
    setIsEditingRepairEvent(false);
    
    // Save repair events to the database by updating the piece
    // Note: Repair events are stored in the InventoryItem for now
    // In the future, they should be stored in RepairOrder/RepairLineItem tables
    try {
      const pieceToSave: InventoryItem = {
        ...item,
        repairEvents: updatedEvents.length > 0 ? updatedEvents : undefined,
      };
      
      const success = await saveInventoryItem(pieceToSave);
      if (!success) {
        console.error("Failed to save repair events to database");
        // Still update UI even if database save fails
      }
      
      // Notify parent component of the update
      if (onRepairEventsUpdate) {
        const pieceId = item.sn || item.id || String(item.pn);
        onRepairEventsUpdate(pieceId, updatedEvents);
      }
      
      setIsRefreshing(true);
      // Small delay to ensure database write is committed
      await new Promise(resolve => setTimeout(resolve, 100));
      // Notify parent to refresh piece data
      if (onPieceUpdated) {
        await onPieceUpdated();
      }
      setIsRefreshing(false);
    } catch (error) {
      console.error("Error saving repair events:", error);
      // Still update UI even if database save fails
      if (onRepairEventsUpdate) {
        const pieceId = item.sn || item.id || String(item.pn);
        onRepairEventsUpdate(pieceId, updatedEvents);
      }
    }
  };

  const handleCancelRepairEventEdit = () => {
    setIsEditingRepairEvent(false);
    if (currentLocalEvent) {
      setEditedRepairDetails(currentLocalEvent.repairDetails ?? "");
      setEditedConditionDetails(currentLocalEvent.conditionDetails ?? "");
    }
  };

  /* ---------- Piece Edit Handlers ---------- */
  const handleStartEdit = () => {
    setEditedPiece({
      id: item.id,
      sn: item.sn || "",
      pn: item.pn || "",
      hours: typeof item.hours === "number" ? item.hours : 0,
      trips: typeof item.trips === "number" ? item.trips : 0,
      starts: typeof item.starts === "number" ? item.starts : 0,
      status: item.status || "OK",
      state: item.state || "In Service",
      component: item.component || "",
      componentType: item.componentType || "",
      turbine: item.turbine || "",
      position: item.position || "",
    });
    // Initialize component search term directly with the component name
    // This ensures it shows immediately when entering edit mode
    // Always set to a string (never undefined) so the value logic works consistently
    setComponentSearchTerm(item.component || "");
    // Turbine field is now read-only, so no need to initialize search term
    // Initialize edited notes from current notes with unique IDs
    const currentNotes = item.notes ?? [];
    setEditedNotes(
      currentNotes
        .map(n => n ?? "")
        .filter(n => n !== "")
        .map((text, idx) => ({ id: `note-${Date.now()}-${idx}`, text }))
    );
    // Initialize edited repair events from current events with unique IDs
    const currentEvents = item.repairEvents ?? [];
    setEditedRepairEvents(
      currentEvents.map((event, idx) => ({ id: `event-${Date.now()}-${idx}`, event }))
    );
    setIsEditing(true);
  };

  const handleCancelPieceEdit = () => {
    setIsEditing(false);
    // Reset edited piece to original values
    setEditedPiece({
      id: item.id,
      sn: item.sn || "",
      pn: item.pn || "",
      hours: typeof item.hours === "number" ? item.hours : 0,
      trips: typeof item.trips === "number" ? item.trips : 0,
      starts: typeof item.starts === "number" ? item.starts : 0,
      status: item.status || "OK",
      state: item.state || "In Service",
      component: item.component || "",
      componentType: item.componentType || "",
      turbine: item.turbine || "",
      position: item.position || "",
    });
    // Reset edited notes to original values with unique IDs
    const currentNotes = item.notes ?? [];
    setEditedNotes(
      currentNotes
        .map(n => n ?? "")
        .filter(n => n !== "")
        .map((text, idx) => ({ id: `note-${Date.now()}-${idx}`, text }))
    );
    // Reset edited repair events to original values with unique IDs
    const currentEvents = item.repairEvents ?? [];
    setEditedRepairEvents(
      currentEvents.map((event, idx) => ({ id: `event-${Date.now()}-${idx}`, event }))
    );
  };

  const handleSavePiece = async () => {
    setIsSaving(true);
    try {
      const pieceToSave: InventoryItem = {
        ...editedPiece,
        hours: Number(editedPiece.hours) || 0,
        trips: Number(editedPiece.trips) || 0,
        starts: Number(editedPiece.starts) || 0,
      };

      // Include notes in the piece to save (extract text from note objects)
      const notesToSave = editedNotes
        .map(n => n.text.trim())
        .filter(text => text !== "");
      // Include repair events in the piece to save (extract events from event objects)
      const repairEventsToSave = editedRepairEvents
        .map(e => e.event)
        .filter(event => {
          // Keep events that have at least a title, repair details, or condition details
          return event.title || event.repairDetails || event.conditionDetails;
        });
      const pieceWithNotes: InventoryItem = {
        ...pieceToSave,
        notes: notesToSave.length > 0 ? notesToSave : undefined,
        repairEvents: repairEventsToSave.length > 0 ? repairEventsToSave : undefined,
      };

      const success = await saveInventoryItem(pieceWithNotes);
      if (success) {
        // Save notes via callback
        if (onNotesUpdate) {
          const pieceId = item.sn || item.id || String(item.pn);
          onNotesUpdate(pieceId, notesToSave);
        }
        // Save repair events via callback
        if (onRepairEventsUpdate) {
          const pieceId = item.sn || item.id || String(item.pn);
          onRepairEventsUpdate(pieceId, repairEventsToSave);
        }
        
        // Reload turbine immediately using the saved component value
        // This ensures the turbine field updates instantly after save
        if (editedPiece.component) {
          try {
            const allComponents = await componentStorage.getAll();
            const component = allComponents.find(c => c.name === editedPiece.component);
            if (component && component.id) {
              const currentAssignment = await componentAssignmentStorage.getCurrentByComponent(String(component.id));
              if (currentAssignment && currentAssignment.turbine_id) {
                setComponentTurbine(currentAssignment.turbine_id);
              } else {
                setComponentTurbine("unassigned");
              }
            }
          } catch (error) {
            console.error('Error reloading turbine after save:', error);
          }
        }
        
        setIsEditing(false);
        setIsRefreshing(true);
        // Small delay to ensure database write is committed
        await new Promise(resolve => setTimeout(resolve, 100));
        // Notify parent to refresh
        if (onPieceUpdated) {
          await onPieceUpdated();
        }
        setIsRefreshing(false);
      } else {
        alert("Error saving piece. Please try again.");
      }
    } catch (error) {
      console.error("Error saving piece:", error);
      alert("Error saving piece. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-xl border p-6 space-y-6 relative">
      {/* Refreshing overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Refreshing data...</p>
          </div>
        </div>
      )}
      
      {/* Header with Edit Button */}
      <div className="flex justify-end items-center border-b pb-4">
        {!isEditing ? (
          <button
            onClick={handleStartEdit}
            className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1"
            title="Edit piece"
          >
            <Pencil className="h-3 w-3" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSavePiece}
              disabled={isSaving}
              className="px-2 py-1 rounded-md text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 flex items-center gap-1 disabled:opacity-50"
              title="Save changes"
            >
              <Check className="h-3 w-3" />
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancelPieceEdit}
              disabled={isSaving}
              className="px-2 py-1 rounded-md text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 flex items-center gap-1 disabled:opacity-50"
              title="Cancel editing"
            >
              <X className="h-3 w-3" />
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* 2x2 Grid Layout: Row 1 = top cards, Row 2 = bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1, Column 1: Component Details Card */}
        <div className="md:row-start-1 md:col-start-1">
          {isEditing ? (
            <EditableInfoCard
              rows={[
                {
                  label: "Status",
                  value: editedPiece.status,
                  type: "readonly",
                  tone: getTone(editedPiece.status, 'status', colorSettings),
                  colorName: getColorName(editedPiece.status, 'status', colorSettings),
                },
                {
                  label: "SN",
                  value: editedPiece.sn,
                  type: "text",
                  onChange: (value) => setEditedPiece(prev => ({ ...prev, sn: value })),
                },
                {
                  label: "PN",
                  value: editedPiece.pn,
                  type: "text",
                  onChange: (value) => setEditedPiece(prev => ({ ...prev, pn: value })),
                },
                {
                  label: "Component",
                  value: editedPiece.component || "",
                  type: "combobox",
                  options: components.map(c => c.name),
                  optionLabels: Object.fromEntries(components.map(c => [c.name, c.name])),
                  onChange: (value) => {
                    // Set search term FIRST, before updating editedPiece
                    // This ensures the field updates immediately
                    // NOTE: This only updates local state - database save happens in handleSavePiece
                    const displayText = getComponentDisplayText(value);
                    const finalDisplayText = displayText || value;
                    setComponentSearchTerm(finalDisplayText);
                    componentSearchTermUserEditedRef.current = false; // Reset edit flag since this is a selection, not manual typing
                    // Then update the actual piece component value (local state only, not saved to DB yet)
                    setEditedPiece(prev => ({ ...prev, component: value }));
                  },
                  // Combobox-specific props
                  searchTerm: componentSearchTerm,
                  onSearchChange: setComponentSearchTerm,
                  onSearchChangeWithEditFlag: (value: string) => {
                    setComponentSearchTerm(value);
                    componentSearchTermUserEditedRef.current = true;
                  },
                  isOpen: isComponentDropdownOpen,
                  onOpenChange: setIsComponentDropdownOpen,
                  filteredOptions: filteredComponents.map(c => c.name),
                  getDisplayText: getComponentDisplayText,
                },
                {
                  label: "Turbine",
                  value: componentTurbine !== null 
                    ? (componentTurbine === "unassigned" ? "Unassigned" : getTurbineDisplayText(componentTurbine))
                    : "—",
                  type: "readonly",
                },
              ]}
            />
          ) : (
            <InfoCard
              rows={[
                ["Status", statusValue, statusTone, statusColor],
                ["SN", v(item.sn)],
                ["PN", v(item.pn)],
                ["Component", v(item.component)],
                ["Turbine", componentTurbine !== null 
                  ? (componentTurbine === "unassigned" ? "Unassigned" : getTurbineDisplayText(componentTurbine))
                  : "—"],
              ]}
            />
          )}
        </div>

        {/* Row 1, Column 2: State/Position Card or Repair Summary Header */}
        <div className="md:row-start-1 md:col-start-2">
          {/* State/Position Card - shown when not expanded */}
          {!isRepairEventExpanded && (
            <div 
              className="rounded-lg border overflow-hidden transition-all duration-500 ease-in-out max-h-[500px] opacity-100"
            >
              {isEditing ? (
                <EditableInfoCard
                  rows={[
                    {
                      label: "State",
                      value: editedPiece.state,
                      type: "select",
                      options: ["In Service", "Out of Service", "Standby", "Repair", "On Order"],
                      onChange: (value) => setEditedPiece(prev => ({ ...prev, state: value as InventoryItem["state"] })),
                      tone: getTone(editedPiece.state, 'state', colorSettings),
                      colorName: getColorName(editedPiece.state, 'state', colorSettings),
                    },
                    {
                      label: "Position",
                      value: editedPiece.position,
                      type: "text",
                      onChange: (value) => setEditedPiece(prev => ({ ...prev, position: value })),
                    },
                    {
                      label: "Hours",
                      value: String(editedPiece.hours),
                      type: "number",
                      onChange: (value) => setEditedPiece(prev => ({ ...prev, hours: Number(value) || 0 })),
                    },
                    {
                      label: "Starts",
                      value: String(editedPiece.starts),
                      type: "number",
                      onChange: (value) => setEditedPiece(prev => ({ ...prev, starts: Number(value) || 0 })),
                    },
                    {
                      label: "Trips",
                      value: String(editedPiece.trips),
                      type: "number",
                      onChange: (value) => setEditedPiece(prev => ({ ...prev, trips: Number(value) || 0 })),
                    },
                  ]}
                />
              ) : (
                <InfoCard
                  rows={[
                    ["State", stateValue, stateTone, stateColor],
                    ["Position", v(item.position)],
                    ["Hours", v(item.hours)],
                    ["Starts", v(item.starts)],
                    ["Trips", v(item.trips)],
                  ]}
                />
              )}
            </div>
          )}
          
          {/* Repair Summary Header - shown when State/Position card is collapsed */}
          {isRepairEventExpanded && (
            <div 
              className="rounded-lg border p-3 transition-all duration-500 ease-in-out opacity-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300">
                    Repair
                  </span>
                  <span className="text-sm">
                    <span className="text-muted-foreground">Hrs:</span>
                    <span className="font-bold ml-1">{v(item.hours)}</span>
                  </span>
                  <span className="text-sm">
                    <span className="text-muted-foreground">Strt:</span>
                    <span className="font-bold ml-1">{v(item.starts)}</span>
                  </span>
                  <span className="text-sm">
                    <span className="text-muted-foreground">Trp:</span>
                    <span className="font-bold ml-1">{v(item.trips)}</span>
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Row 2, Column 1: Notes Card */}
        <div className="md:row-start-2 md:col-start-1 rounded-lg border relative">
          {isEditing ? (
            /* Edit Mode: Show all notes as editable */
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <h4 className="text-sm font-medium">Notes</h4>
                <button
                  type="button"
                  onClick={() => setEditedNotes([...editedNotes, { id: `note-${Date.now()}-${Math.random()}`, text: "" }])}
                  className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1"
                  title="Add note"
                >
                  + Add Note
                </button>
              </div>
              <div className="px-3 py-3 space-y-3 max-h-[400px] overflow-y-auto">
                {editedNotes.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No notes. Click "Add Note" to create one.
                  </div>
                ) : (
                  editedNotes.map((note, index) => (
                    <div key={note.id} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Note {index + 1}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newNotes = editedNotes.filter(n => n.id !== note.id);
                            setEditedNotes(newNotes);
                            // Adjust noteIdx if needed
                            // If we deleted the note at the current index or after it, adjust
                            if (noteIdx >= index) {
                              if (newNotes.length === 0) {
                                setNoteIdx(0);
                              } else if (noteIdx >= newNotes.length) {
                                setNoteIdx(newNotes.length - 1);
                              } else if (noteIdx === index) {
                                // If we deleted the current note, stay at the same index (which now points to the next note)
                                // or move to the last note if we deleted the last one
                                setNoteIdx(Math.min(noteIdx, newNotes.length - 1));
                              }
                            }
                          }}
                          className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
                          title="Delete note"
                        >
                          Delete
                        </button>
                      </div>
                      <textarea
                        value={note.text}
                        onChange={(e) => {
                          const newNotes = editedNotes.map(n => 
                            n.id === note.id ? { ...n, text: e.target.value } : n
                          );
                          setEditedNotes(newNotes);
                        }}
                        className="w-full h-40 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter note text..."
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* View Mode: Show notes with navigation */
            <>
              <div className="border-b px-3 py-2">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                    onClick={() => setNoteIdx((i) => Math.max(0, i - 1))}
                    disabled={!hasAnyNotes || noteIdx === 0 || isEditingNote}
                  >
                    ◀
                  </button>
                  <h4 className="text-sm font-medium text-center flex-1">
                    Note
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                      onClick={() =>
                        setNoteIdx((i) => Math.min(localNotes.length - 1, i + 1))
                      }
                      disabled={!hasAnyNotes || noteIdx === localNotes.length - 1 || isEditingNote}
                    >
                      ▶
                    </button>
                  </div>
                </div>
                {/* Placeholder for created-at; wire real dates here when available */}
                <div className="mt-1 text-xs text-muted-foreground text-center">
                  Created: —
                </div>
              </div>
              {hasAnyNotes && (
                <div className="text-center text-xs text-muted-foreground border-b py-1">
                  {noteIdx + 1} / {localNotes.length}
                </div>
              )}
              <div className="px-3 py-3 min-h-[240px] flex flex-col">
                {isEditingNote ? (
                  <div className="space-y-3 flex-1" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Note</label>
                      <textarea
                        value={editedNote}
                        onChange={(e) => setEditedNote(e.target.value)}
                        className="w-full h-48 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter note text..."
                        autoFocus
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveNote}
                        className="px-3 py-1.5 rounded-md text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 flex items-center gap-1"
                        title="Save changes"
                      >
                        <Check className="h-3 w-3" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-md text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 flex items-center gap-1"
                        title="Cancel editing"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1">
                    <p className={`${hasAnyNotes ? "" : "text-muted-foreground"} text-sm`}>
                      {hasAnyNotes ? v(currentNoteValue) : "No notes available."}
                    </p>
                  </div>
                )}
              </div>
              {!isEditing && !isEditingNote && (
                <div className="absolute bottom-3 left-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNote();
                    }}
                    className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1"
                    title="Edit note"
                  >
                    <Pencil className="h-3 w-3" />
                    Edit
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Row 2, Column 2: Repair Events Card - spans rows 1-2 when expanded */}
        <div className={`md:col-start-2 flex flex-col ${
          isRepairEventExpanded ? 'md:row-start-1 md:row-span-2' : 'md:row-start-2'
        }`}>
          {isEditing ? (
            /* Edit Mode: Show all repair events as editable */
            <div className="rounded-lg border flex flex-col h-full">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <h4 className="text-sm font-medium">Repair Events</h4>
                <button
                  type="button"
                  onClick={() => {
                    const newEvent: RepairEvent = {
                      title: `Repair Event ${editedRepairEvents.length + 1}`,
                      date: new Date().toISOString().split('T')[0],
                      repairDetails: null,
                      conditionDetails: null,
                    };
                    setEditedRepairEvents([...editedRepairEvents, { id: `event-${Date.now()}-${Math.random()}`, event: newEvent }]);
                  }}
                  className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1"
                  title="Add repair event"
                >
                  + Add Event
                </button>
              </div>
              <div className="px-3 py-3 space-y-3 max-h-[400px] overflow-y-auto">
                {editedRepairEvents.length === 0 ? (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No repair events. Click "Add Event" to create one.
                  </div>
                ) : (
                  editedRepairEvents.map((eventObj, index) => (
                    <div key={eventObj.id} className="space-y-2 border rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Event {index + 1}</span>
                          {eventObj.event.title && (
                            <span className="text-xs font-medium">{eventObj.event.title}</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            const newEvents = editedRepairEvents.filter(e => e.id !== eventObj.id);
                            setEditedRepairEvents(newEvents);
                          }}
                          className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
                          title="Delete event"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <Input
                            type="text"
                            value={eventObj.event.title || ""}
                            onChange={(e) => {
                              const newEvents = editedRepairEvents.map(e => 
                                e.id === eventObj.id 
                                  ? { ...e, event: { ...e.event, title: e.target.value || null } }
                                  : e
                              );
                              setEditedRepairEvents(newEvents);
                            }}
                            className="h-8 text-sm mt-1"
                            placeholder="Enter event title..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Date</label>
                          <Input
                            type="date"
                            value={eventObj.event.date || ""}
                            onChange={(e) => {
                              const newEvents = editedRepairEvents.map(e => 
                                e.id === eventObj.id 
                                  ? { ...e, event: { ...e.event, date: e.target.value || null } }
                                  : e
                              );
                              setEditedRepairEvents(newEvents);
                            }}
                            className="h-8 text-sm mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Repair Details</label>
                          <textarea
                            value={eventObj.event.repairDetails || ""}
                            onChange={(e) => {
                              const newEvents = editedRepairEvents.map(e => 
                                e.id === eventObj.id 
                                  ? { ...e, event: { ...e.event, repairDetails: e.target.value || null } }
                                  : e
                              );
                              setEditedRepairEvents(newEvents);
                            }}
                            className="w-full h-32 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                            placeholder="Enter repair details..."
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Condition Details</label>
                          <textarea
                            value={eventObj.event.conditionDetails || ""}
                            onChange={(e) => {
                              const newEvents = editedRepairEvents.map(e => 
                                e.id === eventObj.id 
                                  ? { ...e, event: { ...e.event, conditionDetails: e.target.value || null } }
                                  : e
                              );
                              setEditedRepairEvents(newEvents);
                            }}
                            className="w-full h-32 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary mt-1"
                            placeholder="Enter condition details..."
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* View Mode: Show repair events with navigation */
            <div 
              className={`rounded-lg border transition-all duration-500 ease-in-out flex flex-col flex-1 ${
                isRepairEventExpanded ? 'h-full' : 'min-h-[136px]'
              }`}
            >
              <div className="flex items-center justify-between border-b px-3 py-2">
                {isEditingRepairEvent ? (
                  <div className="flex-1" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={String(eventIdx)}
                      onValueChange={(value) => {
                        const newIdx = parseInt(value, 10);
                        if (!isNaN(newIdx) && newIdx >= 0 && newIdx < localEvents.length) {
                          setEventIdx(newIdx);
                          // Update edited values when switching events
                          const selectedEvent = localEvents[newIdx];
                          if (selectedEvent) {
                            setEditedRepairDetails(selectedEvent.repairDetails ?? "");
                            setEditedConditionDetails(selectedEvent.conditionDetails ?? "");
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue>
                          {hasAnyEvents
                            ? v(currentLocalEvent?.title ?? `Repair Event ${eventIdx + 1}`)
                            : "Repair Event"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {localEvents.map((event, idx) => (
                          <SelectItem key={idx} value={String(idx)}>
                            {v(event.title ?? `Repair Event ${idx + 1}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventIdx((i) => Math.max(0, i - 1));
                      }}
                      disabled={!hasAnyEvents || eventIdx === 0}
                    >
                      ◀
                    </button>
                    <div className="text-center flex-1 flex flex-col items-center">
                      <h4 className="text-sm font-medium">
                        {hasAnyEvents
                          ? v(currentLocalEvent?.title ?? `Repair Event ${eventIdx + 1}`)
                          : "Repair Event"}
                      </h4>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        {formatEventDate(currentLocalEvent)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEventIdx((i) => Math.min(localEvents.length - 1, i + 1));
                      }}
                      disabled={!hasAnyEvents || eventIdx === localEvents.length - 1}
                    >
                      ▶
                    </button>
                  </>
                )}
              </div>
              {hasAnyEvents && (
                <div className="text-center text-xs text-muted-foreground border-b py-1">
                  {eventIdx + 1} / {localEvents.length}
                </div>
              )}

              {/* Toggle buttons underneath */}
              <div className="flex justify-center gap-2 border-b px-3 py-2">
                <Toggle
                  small
                  active={tab === "repair"}
                  onClick={(e) => {
                    e?.stopPropagation();
                    setTab("repair");
                  }}
                >
                  Repair Details
                </Toggle>
                <Toggle
                  small
                  active={tab === "condition"}
                  onClick={(e) => {
                    e?.stopPropagation();
                    setTab("condition");
                  }}
                >
                  Condition Details
                </Toggle>
              </div>

              <div className={`px-3 py-3 text-sm transition-all duration-500 ease-in-out relative ${
                isRepairEventExpanded ? 'flex-1 overflow-auto' : 'min-h-[240px]'
              }`}>
                {!hasAnyEvents ? (
                  <p className="text-muted-foreground">No repair events.</p>
                ) : bothNull && !isEditingRepairEvent ? (
                  <p className="text-muted-foreground">No details for this event.</p>
                ) : isEditingRepairEvent ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Repair Details</label>
                      <textarea
                        value={editedRepairDetails}
                        onChange={(e) => setEditedRepairDetails(e.target.value)}
                        className="w-full h-48 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter repair details..."
                        autoFocus
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Condition Details</label>
                      <textarea
                        value={editedConditionDetails}
                        onChange={(e) => setEditedConditionDetails(e.target.value)}
                        className="w-full h-48 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Enter condition details..."
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        type="button"
                        onClick={handleSaveRepairEvent}
                        className="px-3 py-1.5 rounded-md text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 flex items-center gap-1"
                        title="Save changes"
                      >
                        <Check className="h-3 w-3" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRepairEventEdit}
                        className="px-3 py-1.5 rounded-md text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 flex items-center gap-1"
                        title="Cancel editing"
                      >
                        <X className="h-3 w-3" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : tab === "repair" ? (
                  <div className="space-y-2">
                    <p className={`${hasRepair ? "" : "text-muted-foreground"} transition-all duration-500 ${
                      isRepairEventExpanded ? 'text-base leading-relaxed' : 'text-sm'
                    }`}>
                      {v(currentLocalEvent?.repairDetails)}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className={`${hasCondition ? "" : "text-muted-foreground"} transition-all duration-500 ${
                      isRepairEventExpanded ? 'text-base leading-relaxed' : 'text-sm'
                    }`}>
                      {v(currentLocalEvent?.conditionDetails)}
                    </p>
                  </div>
                )}
                {!isEditing && !isEditingRepairEvent && hasAnyEvents && !bothNull && (
                  <div className="absolute bottom-3 left-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRepairEvent();
                      }}
                      className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1"
                      title={tab === "repair" ? "Edit repair details" : "Edit condition details"}
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function InfoCard({ rows }: { rows: Array<[label: string, value: string, tone?: any, colorName?: string]> }) {
  return (
    <div className="rounded-lg border p-3">
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value, tone, colorName]) => {
          const isStatusOrState = label === "Status" || label === "State";
          const shouldShowBadge = isStatusOrState && tone !== undefined;
          
          return (
            <div
              key={label}
              className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-1.5"
            >
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="font-medium text-right truncate">
                {shouldShowBadge ? (
                  <span className={getBadgeClasses(tone, colorName)}>{value}</span>
                ) : (
                  value
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

type EditableRow = {
  label: string;
  value: string;
  type: "text" | "number" | "select" | "readonly" | "combobox";
  options?: string[];
  optionLabels?: Record<string, string>; // Map of option values to display labels
  onChange?: (value: string) => void;
  tone?: any;
  colorName?: string;
  // Combobox-specific props
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onSearchChangeWithEditFlag?: (value: string) => void; // Callback that also marks field as user-edited
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  filteredOptions?: string[];
  getDisplayText?: (value: string) => string;
};

function EditableInfoCard({ rows }: { rows: EditableRow[] }) {
  return (
    <div className="rounded-lg border p-3">
      <dl className="space-y-2 text-sm">
        {rows.map((row) => {
          const isStatusOrState = row.label === "Status" || row.label === "State";
          const shouldShowBadge = isStatusOrState && row.tone !== undefined && row.type === "readonly";
          
          return (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-1.5"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium text-right flex-1 max-w-[60%]">
                {row.type === "readonly" ? (
                  shouldShowBadge ? (
                    <span className={getBadgeClasses(row.tone, row.colorName)}>{row.value}</span>
                  ) : (
                    <span className="truncate">{row.value}</span>
                  )
                ) : row.type === "select" ? (
                  <Select value={row.value} onValueChange={row.onChange!}>
                    <SelectTrigger className="h-8 text-sm w-full">
                      <SelectValue>
                        {row.optionLabels && row.optionLabels[row.value]
                          ? row.optionLabels[row.value]
                          : row.value}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {row.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {row.optionLabels && row.optionLabels[option]
                            ? row.optionLabels[option]
                            : option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : row.type === "combobox" ? (
                  <div className="relative w-full">
                    <Input
                      type="text"
                      value={row.searchTerm || ""}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        // Always update search term when user types - this enables filtering
                        // Use the edit flag callback if available (marks field as user-edited to prevent auto-repopulation)
                        if (row.onSearchChangeWithEditFlag) {
                          row.onSearchChangeWithEditFlag(newValue);
                        } else if (row.onSearchChange) {
                          row.onSearchChange(newValue);
                        }
                        // Don't update the actual value while typing - only when an option is selected
                        // This allows the user to type freely and see filtered results
                        if (row.onOpenChange) {
                          row.onOpenChange(true);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Mark as user-edited when user presses any key (including delete/backspace)
                        if (row.onSearchChangeWithEditFlag && (e.key === "Backspace" || e.key === "Delete" || e.key.length === 1)) {
                          // The onChange will handle the actual update, but we mark it as edited here too
                          // This ensures that even if the user deletes all text, it stays deleted
                          if (row.label === "Component") {
                            componentSearchTermUserEditedRef.current = true;
                          }
                        }
                      }}
                      onFocus={(e) => {
                        // Only initialize searchTerm on first focus if it's truly uninitialized
                        // Don't repopulate if user has intentionally cleared the field
                        // We check if searchTerm is empty AND value exists AND searchTerm was never set to a non-empty value
                        // Since componentSearchTerm is initialized to "" in handleStartEdit, we need a different approach
                        // Only initialize if searchTerm is empty AND we haven't initialized it yet (track via ref)
                        // Actually, since we initialize in handleStartEdit, onFocus should NOT repopulate
                        // The field should already be populated when entering edit mode
                        // So we skip the initialization here - it's handled in handleStartEdit
                        if (row.onOpenChange) {
                          row.onOpenChange(true);
                        }
                      }}
                      onBlur={(e) => {
                        // Delay closing to allow click events
                        setTimeout(() => {
                          if (row.onOpenChange) {
                            row.onOpenChange(false);
                          }
                          // Don't clear search term on blur - only clear when an option is selected
                          // This prevents the field from reverting when user deletes all text
                        }, 200);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && row.filteredOptions && row.filteredOptions.length > 0) {
                          e.preventDefault();
                          // Select first filtered option - onChange will handle setting the search term
                          const firstOption = row.filteredOptions[0];
                          if (row.onChange) {
                            row.onChange(firstOption);
                          }
                          if (row.onOpenChange) {
                            row.onOpenChange(false);
                          }
                        } else if (e.key === "Escape") {
                          if (row.onOpenChange) {
                            row.onOpenChange(false);
                          }
                          // Don't clear search term on Escape - let user keep what they typed
                        }
                      }}
                      className="h-8 text-sm w-full"
                      placeholder="Type to search..."
                    />
                    {row.isOpen && row.filteredOptions && row.filteredOptions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-[300px] overflow-auto">
                        {row.filteredOptions.map((option) => {
                          const displayText = row.getDisplayText 
                            ? row.getDisplayText(option)
                            : (row.optionLabels && row.optionLabels[option]
                              ? row.optionLabels[option]
                              : option);
                          return (
                            <div
                              key={option}
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground"
                              onMouseDown={(e) => {
                                e.preventDefault(); // Prevent input blur
                                // Just call onChange - it will handle setting both editedPiece and searchTerm
                                // NOTE: This only updates local state - database save happens when user clicks Save
                                if (row.onChange) {
                                  row.onChange(option);
                                }
                                if (row.onOpenChange) {
                                  row.onOpenChange(false);
                                }
                              }}
                            >
                              {displayText}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : row.type === "number" ? (
                  <Input
                    type="number"
                    value={row.value}
                    onChange={(e) => row.onChange!(e.target.value)}
                    className="h-8 text-sm text-right"
                  />
                ) : (
                  <Input
                    type="text"
                    value={row.value}
                    onChange={(e) => row.onChange!(e.target.value)}
                    className="h-8 text-sm text-right"
                  />
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

function Toggle({
  active,
  onClick,
  children,
  small = false,
}: {
  active: boolean;
  onClick: (e?: React.MouseEvent) => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      className={[
        small ? "px-2 py-1 text-xs" : "px-2.5 py-1.5 text-sm",
        "rounded-md",
        active
          ? "bg-black text-white"
          : "bg-muted hover:bg-muted/70",
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
