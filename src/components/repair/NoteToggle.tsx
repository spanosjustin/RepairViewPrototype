// src/components/repair/NoteToggle.tsx

"use client";

import * as React from "react";

type NoteToggleProps = {
  aLabel?: string;          // e.g., "Condition Details"
  bLabel?: string;          // e.g., "Repair Details"
  aText?: string | null;    // condition text
  bText?: string | null;    // repair text
  defaultView?: "a" | "b";  // which to show first
  className?: string;       // optional wrapper classes
  /** If true, render smaller pills and tighter spacing */
  compact?: boolean;
};

export default function NoteToggle({
  aLabel = "Condition Details",
  bLabel = "Repair Details",
  aText = "",
  bText = "",
  defaultView = "a",
  className = "",
  compact = true,
}: NoteToggleProps) {
  const [view, setView] = React.useState<"a" | "b">(defaultView);

  const pillBase =
    "px-2 py-1 rounded-full text-xs transition border select-none";
  const pillOn = "bg-blue-600 text-white border-transparent";
  const pillOff = "bg-transparent text-gray-700 border-gray-300 hover:bg-gray-100";

  const wrapPad = compact ? "p-2" : "p-3";
  const textSize = compact ? "text-sm" : "text-base";

  const text = view === "a" ? aText : bText;
  const empty = !text || String(text).trim().length === 0;

  return (
    <div className={`border rounded-lg ${wrapPad} ${className}`}>
      {/* Toggle pills */}
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          className={`${pillBase} ${view === "a" ? pillOn : pillOff}`}
          onClick={() => setView("a")}
          aria-pressed={view === "a"}
        >
          {aLabel}
        </button>
        <button
          type="button"
          className={`${pillBase} ${view === "b" ? pillOn : pillOff}`}
          onClick={() => setView("b")}
          aria-pressed={view === "b"}
        >
          {bLabel}
        </button>
      </div>

      {/* Body */}
      <div className={`${textSize} leading-snug whitespace-pre-wrap`}>
        {empty ? (
          <span className="text-gray-500">No notes</span>
        ) : (
          text
        )}
      </div>
    </div>
  );
}
