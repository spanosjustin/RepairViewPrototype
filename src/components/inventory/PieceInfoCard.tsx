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
import { piecesStorage } from "@/lib/storage/indexedDB";

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

  /* ---------- Edit Mode State ---------- */
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
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
  const [editedNotes, setEditedNotes] = React.useState<string[]>([]);

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

  // Update local notes when item.notes changes
  React.useEffect(() => {
    const newNotes = item.notes ?? [];
    // Filter out null/undefined and empty strings, then map to strings
    const validNotes = newNotes
      .filter(n => n != null && String(n).trim() !== "")
      .map(n => String(n));
    setLocalNotes(validNotes);
    // Also update editedNotes if not in edit mode (to sync after save)
    if (!isEditing) {
      setEditedNotes(validNotes);
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
  }, [item.repairEvents]);

  // Initialize edited repair/condition details when entering edit mode
  React.useEffect(() => {
    if (isEditingRepairEvent && currentEvent) {
      setEditedRepairDetails(currentEvent.repairDetails ?? "");
      setEditedConditionDetails(currentEvent.conditionDetails ?? "");
    }
  }, [isEditingRepairEvent, currentEvent]);

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
      
      const success = await piecesStorage.save(pieceToSave);
      if (!success) {
        console.error("Failed to save notes to database");
        // Still update UI even if database save fails
      }
      
      // Notify parent component of the update
      if (onNotesUpdate) {
        const pieceId = item.sn || item.id || String(item.pn);
        onNotesUpdate(pieceId, notesToSave);
      }
      
      // Notify parent to refresh piece data
      if (onPieceUpdated) {
        onPieceUpdated();
      }
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
    try {
      const pieceToSave: InventoryItem = {
        ...item,
        repairEvents: updatedEvents.length > 0 ? updatedEvents : undefined,
      };
      
      const success = await piecesStorage.save(pieceToSave);
      if (!success) {
        console.error("Failed to save repair events to database");
        // Still update UI even if database save fails
      }
      
      // Notify parent component of the update
      if (onRepairEventsUpdate) {
        const pieceId = item.sn || item.id || String(item.pn);
        onRepairEventsUpdate(pieceId, updatedEvents);
      }
      
      // Notify parent to refresh piece data
      if (onPieceUpdated) {
        onPieceUpdated();
      }
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
    // Initialize edited notes from current notes
    const currentNotes = item.notes ?? [];
    setEditedNotes(currentNotes.map(n => n ?? "").filter(n => n !== ""));
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
    // Reset edited notes to original values
    const currentNotes = item.notes ?? [];
    setEditedNotes(currentNotes.map(n => n ?? "").filter(n => n !== ""));
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

      // Include notes in the piece to save
      const notesToSave = editedNotes.filter(n => n.trim() !== "");
      const pieceWithNotes: InventoryItem = {
        ...pieceToSave,
        notes: notesToSave.length > 0 ? notesToSave : undefined,
      };

      const success = await piecesStorage.save(pieceWithNotes);
      if (success) {
        // Save notes via callback
        if (onNotesUpdate) {
          const pieceId = item.sn || item.id || String(item.pn);
          onNotesUpdate(pieceId, notesToSave);
        }
        
        setIsEditing(false);
        // Notify parent to refresh
        if (onPieceUpdated) {
          onPieceUpdated();
        }
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
    <div className="rounded-xl border p-6 space-y-6">
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
                  value: editedPiece.component,
                  type: "text",
                  onChange: (value) => setEditedPiece(prev => ({ ...prev, component: value })),
                },
                {
                  label: "Turbine",
                  value: editedPiece.turbine,
                  type: "text",
                  onChange: (value) => setEditedPiece(prev => ({ ...prev, turbine: value })),
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
                ["Turbine", v(item.turbine)],
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
              className="rounded-lg border p-3 transition-all duration-500 ease-in-out cursor-pointer hover:border-primary/50 opacity-100"
              onClick={handleRepairEventClick}
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
                  onClick={() => setEditedNotes([...editedNotes, ""])}
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
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Note {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newNotes = editedNotes.filter((_, i) => i !== index);
                            setEditedNotes(newNotes);
                            // Adjust noteIdx if needed
                            if (noteIdx >= newNotes.length && newNotes.length > 0) {
                              setNoteIdx(newNotes.length - 1);
                            }
                          }}
                          className="px-1.5 py-0.5 rounded text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300"
                          title="Delete note"
                        >
                          Delete
                        </button>
                      </div>
                      <textarea
                        value={note}
                        onChange={(e) => {
                          const newNotes = [...editedNotes];
                          newNotes[index] = e.target.value;
                          setEditedNotes(newNotes);
                        }}
                        className="w-full h-24 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
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
              <div className="px-3 py-3 min-h-[136px] flex flex-col">
                {isEditingNote ? (
                  <div className="space-y-3 flex-1" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground">Note</label>
                      <textarea
                        value={editedNote}
                        onChange={(e) => setEditedNote(e.target.value)}
                        className="w-full h-32 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div 
            className={`rounded-lg border cursor-pointer transition-all duration-500 ease-in-out hover:border-primary/50 flex flex-col flex-1 ${
              isRepairEventExpanded ? 'h-full' : 'min-h-[136px]'
            }`}
            onClick={handleRepairEventClick}
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

            <div className={`px-3 py-3 text-sm transition-all duration-500 ease-in-out ${
              isRepairEventExpanded ? 'flex-1 overflow-auto' : ''
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
                      className="w-full h-32 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter repair details..."
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Condition Details</label>
                    <textarea
                      value={editedConditionDetails}
                      onChange={(e) => setEditedConditionDetails(e.target.value)}
                      className="w-full h-32 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
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
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRepairEvent();
                      }}
                      className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1 mt-2"
                      title="Edit repair details"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className={`${hasCondition ? "" : "text-muted-foreground"} transition-all duration-500 ${
                    isRepairEventExpanded ? 'text-base leading-relaxed' : 'text-sm'
                  }`}>
                    {v(currentLocalEvent?.conditionDetails)}
                  </p>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditRepairEvent();
                      }}
                      className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 flex items-center gap-1 mt-2"
                      title="Edit condition details"
                    >
                      <Pencil className="h-3 w-3" />
                      Edit
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
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
  type: "text" | "number" | "select" | "readonly";
  options?: string[];
  onChange?: (value: string) => void;
  tone?: any;
  colorName?: string;
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
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {row.options?.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
