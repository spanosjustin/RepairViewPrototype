"use client";

import * as React from "react";
import type { InventoryItem } from "@/lib/inventory/types";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getTone, getColorName, getBadgeClasses } from "@/lib/settings/colorMapper";
import { ChevronDown } from "lucide-react";

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

export default function PieceInfoCard({ item }: { item: ItemWithExtras }) {
  const [tab, setTab] = React.useState<"repair" | "condition">("repair");
  const [isRepairEventExpanded, setIsRepairEventExpanded] = React.useState(false);
  
  // Load color settings from IndexedDB
  const { data: colorSettings = [] } = useStatusColors();

  /* ---------- Notes State ---------- */
  const notes = item.notes ?? [];
  const [noteIdx, setNoteIdx] = React.useState(0);
  const currentNote = notes[noteIdx] ?? null;

  /* ---------- Repair Events State ---------- */
  const events = item.repairEvents ?? [];
  const [eventIdx, setEventIdx] = React.useState(0);
  const currentEvent = events[eventIdx] ?? null;

  // clamp indices if data changes
  React.useEffect(() => {
    if (noteIdx >= notes.length) setNoteIdx(Math.max(0, notes.length - 1));
  }, [notes.length, noteIdx]);

  React.useEffect(() => {
    if (eventIdx >= events.length) setEventIdx(Math.max(0, events.length - 1));
  }, [events.length, eventIdx]);

  const v = (x: unknown) =>
    x === null || x === undefined || x === "" ? "—" : String(x);

  const hasAnyNotes = notes.length > 0;
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

  return (
    <div className="rounded-xl border p-6 space-y-6">
      {/* Two column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Component Details Card */}
          <InfoCard
            rows={[
              ["Status", statusValue, statusTone, statusColor],
              ["SN", v(item.sn)],
              ["PN", v(item.pn)],
              ["Component", v(item.component)],
              ["Turbine", v(item.turbine)],
            ]}
          />

          {/* Notes Card */}
          <div className="rounded-lg border self-start">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <button
                type="button"
                className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                onClick={() => setNoteIdx((i) => Math.max(0, i - 1))}
                disabled={!hasAnyNotes || noteIdx === 0}
              >
                ◀
              </button>
              <h4 className="text-sm font-medium text-center flex-1">
                Note
              </h4>
              <button
                type="button"
                className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
                onClick={() =>
                  setNoteIdx((i) => Math.min(notes.length - 1, i + 1))
                }
                disabled={!hasAnyNotes || noteIdx === notes.length - 1}
              >
                ▶
              </button>
            </div>
            {hasAnyNotes && (
              <div className="text-center text-xs text-muted-foreground border-b py-1">
                {noteIdx + 1} / {notes.length}
              </div>
            )}
            <div className="px-3 py-3 text-sm text-muted-foreground min-h-[136px]">
              {hasAnyNotes ? v(currentNote) : "No notes available."}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* State/Position/etc Card - shown when expanded, hidden when collapsed */}
          <div 
            className={`rounded-lg border overflow-hidden transition-all duration-500 ease-in-out ${
              isRepairEventExpanded 
                ? 'max-h-0 opacity-0 mb-0' 
                : 'max-h-[500px] opacity-100'
            }`}
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

          {/* Repair Summary Header - shown when State/Position card is collapsed */}
          <div 
            className={`rounded-lg border p-3 transition-all duration-500 ease-in-out cursor-pointer hover:border-primary/50 ${
              isRepairEventExpanded 
                ? 'opacity-100 max-h-[100px] -mt-6' 
                : 'opacity-0 max-h-0 overflow-hidden mb-0'
            }`}
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

          {/* Repair Events Card - full height */}
          <div 
            className={`rounded-lg border cursor-pointer transition-all duration-500 ease-in-out hover:border-primary/50 flex flex-col ${
              isRepairEventExpanded ? 'flex-1' : ''
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

            <div className={`px-3 py-3 text-sm transition-all duration-500 ease-in-out flex-1 ${
              isRepairEventExpanded ? 'min-h-[432px]' : ''
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
