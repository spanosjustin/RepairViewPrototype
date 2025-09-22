"use client";

import * as React from "react";
import type { InventoryItem } from "@/lib/inventory/types";

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

  return (
    <div className="rounded-xl border p-6 space-y-6">
      {/* Top: two info columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          rows={[
            ["Status", v(item.status)],
            ["SN", v(item.sn)],
            ["PN", v(item.pn)],
            ["Component", v(item.component)],
            ["Turbine", v(item.turbine)],
          ]}
        />
        <InfoCard
          rows={[
            ["State", v(item.state)],
            ["Position", v(item.position)],
            ["Hours", v(item.hours)],
            ["Starts", v(item.starts)],
            ["Trips", v(item.trips)],
          ]}
        />
      </div>

      {/* Bottom: Notes + Repair Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Notes (left) */}
        <div className="rounded-lg border">
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
          <div className="px-3 py-3 text-sm text-muted-foreground min-h-24">
            {hasAnyNotes ? v(currentNote) : "No notes available."}
          </div>
        </div>

        {/* Repair Events (right) */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <button
              type="button"
              className="px-2 py-1 rounded-md text-xs bg-muted hover:bg-muted/70 disabled:opacity-50"
              onClick={() => setEventIdx((i) => Math.max(0, i - 1))}
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
              onClick={() =>
                setEventIdx((i) => Math.min(events.length - 1, i + 1))
              }
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
              onClick={() => setTab("repair")}
            >
              Repair Details
            </Toggle>
            <Toggle
              small
              active={tab === "condition"}
              onClick={() => setTab("condition")}
            >
              Condition Details
            </Toggle>
          </div>

          <div className="px-3 py-3 text-sm min-h-24">
            {!hasAnyEvents ? (
              <p className="text-muted-foreground">No repair events.</p>
            ) : bothNull ? (
              <p className="text-muted-foreground">No details for this event.</p>
            ) : tab === "repair" ? (
              <p className={hasRepair ? "" : "text-muted-foreground"}>
                {v(currentEvent?.repairDetails)}
              </p>
            ) : (
              <p className={hasCondition ? "" : "text-muted-foreground"}>
                {v(currentEvent?.conditionDetails)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function InfoCard({ rows }: { rows: Array<[label: string, value: string]> }) {
  return (
    <div className="rounded-lg border p-3">
      <dl className="space-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-1.5"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="font-medium text-right truncate">{value}</dd>
          </div>
        ))}
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
  onClick: () => void;
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
          ? "bg-primary text-primary-foreground"
          : "bg-muted hover:bg-muted/70",
      ].join(" ")}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
