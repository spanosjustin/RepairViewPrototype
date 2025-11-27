"use client";

import * as React from "react";
import type { InventoryItem } from "@/lib/inventory/types";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getTone, getColorName, getBadgeClasses } from "@/lib/settings/colorMapper";
import { ChevronDown, Pencil, Check, X } from "lucide-react";

type RepairEvent = {
  title?: string | null;
  repairDetails?: string | null;
  conditionDetails?: string | null;
};

type ItemWithExtras = InventoryItem & {
  turbine?: string | null;
  position?: string | null;
  notes?: (string | null)[] | null;     // multiple general notes
  repairEvents?: RepairEvent[] | null; // list of repair events
};

export default function PieceInfoCard({ 
  item,
  onNotesUpdate
}: { 
  item: ItemWithExtras;
  onNotesUpdate?: (pieceId: string, notes: string[]) => void;
}) {
  const [tab, setTab] = React.useState<"repair" | "condition">("repair");
  const [isRepairEventExpanded, setIsRepairEventExpanded] = React.useState(false);
  
  // Load color settings from IndexedDB
  const { data: colorSettings = [] } = useStatusColors();

  /* ---------- Notes State ---------- */
  const notes = item.notes ?? [];
  const [noteIdx, setNoteIdx] = React.useState(0);
  const currentNote = notes[noteIdx] ?? null;
  const [isEditingNote, setIsEditingNote] = React.useState(false);
  const [editedNote, setEditedNote] = React.useState("");
  const [localNotes, setLocalNotes] = React.useState<string[]>(notes.map(n => n ?? ""));

  /* ---------- Repair Events State ---------- */
  const events = item.repairEvents ?? [];
  const [eventIdx, setEventIdx] = React.useState(0);
  const currentEvent = events[eventIdx] ?? null;

  // Update local notes when item.notes changes
  React.useEffect(() => {
    const newNotes = item.notes ?? [];
    setLocalNotes(newNotes.map(n => n ?? ""));
  }, [item.notes]);

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

  const v = (x: unknown) =>
    x === null || x === undefined || x === "" ? "—" : String(x);

  const hasAnyNotes = localNotes.length > 0;
  const currentNoteValue = localNotes[noteIdx] ?? null;
  const hasAnyEvents = events.length > 0;
  const hasRepair = !!currentEvent?.repairDetails;
  const hasCondition = !!currentEvent?.conditionDetails;
  const bothNull = currentEvent ? !hasRepair && !hasCondition : true;
  
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
    setIsEditingNote(true);
  };

  const handleSaveNote = () => {
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
    
    setLocalNotes(updatedNotes);
    setIsEditingNote(false);
    
    // Notify parent component of the update
    if (onNotesUpdate) {
      const pieceId = item.sn || item.id || String(item.pn);
      onNotesUpdate(pieceId, updatedNotes);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingNote(false);
    setEditedNote(localNotes[noteIdx] ?? "");
  };

  return (
    <div className="rounded-xl border p-6 space-y-6">
      {/* 2x2 Grid Layout: Row 1 = top cards, Row 2 = bottom cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Row 1, Column 1: Component Details Card */}
        <div className="md:row-start-1 md:col-start-1">
          <InfoCard
            rows={[
              ["Status", statusValue, statusTone, statusColor],
              ["SN", v(item.sn)],
              ["PN", v(item.pn)],
              ["Component", v(item.component)],
              ["Turbine", v(item.turbine)],
            ]}
          />
        </div>

        {/* Row 1, Column 2: State/Position Card or Repair Summary Header */}
        <div className="md:row-start-1 md:col-start-2">
          {/* State/Position Card - shown when not expanded */}
          {!isRepairEventExpanded && (
            <div 
              className="rounded-lg border overflow-hidden transition-all duration-500 ease-in-out max-h-[500px] opacity-100"
            >
              <InfoCard
                rows={[
                  ["State", stateValue, stateTone, stateColor],
                  ["Position", v(item.position)],
                  ["Hours", v(item.hours)],
                  ["Starts", v(item.starts)],
                  ["Trips", v(item.trips)],
                ]}
              />
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
        <div className="md:row-start-2 md:col-start-1 rounded-lg border">
            <div className="flex items-center justify-between border-b px-3 py-2">
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
                {!isEditingNote ? (
                  <button
                    type="button"
                    className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNote();
                    }}
                    title="Edit note"
                  >
                    <Pencil className="h-3 w-3" />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-xs bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveNote();
                      }}
                      title="Save note"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md text-xs bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      title="Cancel editing"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                )}
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
            {hasAnyNotes && (
              <div className="text-center text-xs text-muted-foreground border-b py-1">
                {noteIdx + 1} / {localNotes.length}
              </div>
            )}
            <div className="px-3 py-3 min-h-[136px]">
              {isEditingNote ? (
                <textarea
                  value={editedNote}
                  onChange={(e) => setEditedNote(e.target.value)}
                  className="w-full h-32 p-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter note text..."
                  autoFocus
                />
              ) : (
                <div className="text-sm text-muted-foreground">
                  {hasAnyNotes ? v(currentNoteValue) : "No notes available. Click the edit button to add a note."}
                </div>
              )}
            </div>
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
              <h4 className="text-sm font-medium text-center flex-1">
                {hasAnyEvents
                  ? v(currentEvent?.title ?? `Repair Event ${eventIdx + 1}`)
                  : "Repair Event"}
              </h4>
              <button
                type="button"
                className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setEventIdx((i) => Math.min(events.length - 1, i + 1));
                }}
                disabled={!hasAnyEvents || eventIdx === events.length - 1}
              >
                ▶
              </button>
            </div>
            {hasAnyEvents && (
              <div className="text-center text-xs text-muted-foreground border-b py-1">
                {eventIdx + 1} / {events.length}
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
              ) : bothNull ? (
                <p className="text-muted-foreground">No details for this event.</p>
              ) : tab === "repair" ? (
                <p className={`${hasRepair ? "" : "text-muted-foreground"} transition-all duration-500 ${
                  isRepairEventExpanded ? 'text-base leading-relaxed' : 'text-sm'
                }`}>
                  {v(currentEvent?.repairDetails)}
                </p>
              ) : (
                <p className={`${hasCondition ? "" : "text-muted-foreground"} transition-all duration-500 ${
                  isRepairEventExpanded ? 'text-base leading-relaxed' : 'text-sm'
                }`}>
                  {v(currentEvent?.conditionDetails)}
                </p>
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
