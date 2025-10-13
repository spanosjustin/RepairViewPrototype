"use client";

import * as React from "react";
import type { Align, Cell } from "@/lib/matrix/types";
import { TONE_BADGE_CLASS } from "@/lib/matrix/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** tiny class combiner to avoid pulling in a utils file */
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

type MatrixCellProps = {
  cell: Cell;
  align?: Align;
  className?: string;
  /** optional click handler; no-ops by default */
  onClick?: () => void;
  /** whether this cell is editable */
  editable?: boolean;
  /** callback when cell value changes */
  onValueChange?: (newValue: string | number) => void;
  /** whether this cell is currently being edited */
  isEditing?: boolean;
  /** callback to start editing */
  onStartEdit?: () => void;
  /** callback to stop editing */
  onStopEdit?: () => void;
};

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const fmtNumber = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

const CONDITION_OPTIONS = [
  "OK",
  "Monitor", 
  "Replace Soon",
  "Replace Now",
  "Fault",
  "Failed",
  "Unknown",
];

const POSITION_OPTIONS = [
  "Comb",
  "Tran",
  "S1N", "S1S", "S1B",
  "S2N", "S2S", "S2B", 
  "S3N", "S3S", "S3B",
  "Rotor",
];

/**
 * Stateless renderer for a single matrix cell.
 * - text / number: simple inline text
 * - badge: pill-style status (tone → class via constants)
 * - note: truncated text with tooltip on hover (placeholder UX)
 */
export default function MatrixCell({
  cell,
  align = "left",
  className,
  onClick,
  editable = false,
  onValueChange,
  isEditing = false,
  onStartEdit,
  onStopEdit,
}: MatrixCellProps) {
  const [editValue, setEditValue] = React.useState<string>("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing) {
      setEditValue(String(cell.value ?? ""));
      // Focus the input after a brief delay to ensure it's rendered
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isEditing, cell.value]);

  const handleSave = () => {
    if (cell.kind === "number") {
      const numValue = parseFloat(editValue);
      if (!isNaN(numValue)) {
        onValueChange?.(numValue);
      }
    } else {
      onValueChange?.(editValue);
    }
    onStopEdit?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onStopEdit?.();
    }
  };

  const handleClick = () => {
    if (editable && !isEditing) {
      onStartEdit?.();
    } else {
      onClick?.();
    }
  };

  const clickable = typeof onClick === "function" || editable;

  const common = cx(
    "px-2 py-1 text-sm leading-5 whitespace-nowrap overflow-hidden text-ellipsis",
    alignClass[align],
    clickable && "cursor-pointer select-none hover:bg-gray-50 transition-colors",
    editable && "border border-transparent hover:border-gray-300 rounded",
    isEditing && "border-blue-300 bg-blue-50",
    className
  );

  // Render editing mode
  if (isEditing) {
    if (cell.kind === "number") {
      return (
        <div className={common}>
          <Input
            ref={inputRef}
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="h-6 text-sm border-0 p-0 bg-transparent focus:ring-0"
          />
        </div>
      );
    }

    if (cell.kind === "badge") {
      // Determine if this is a condition or position field based on common values
      const isCondition = CONDITION_OPTIONS.includes(String(cell.value));
      const isPosition = POSITION_OPTIONS.includes(String(cell.value));
      
      if (isCondition || isPosition) {
        const options = isCondition ? CONDITION_OPTIONS : POSITION_OPTIONS;
        return (
          <div className={common}>
            <Select value={editValue} onValueChange={setEditValue}>
              <SelectTrigger className="h-6 text-xs border-0 p-0 bg-transparent focus:ring-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }
    }

    // Default text input
    return (
      <div className={common}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="h-6 text-sm border-0 p-0 bg-transparent focus:ring-0"
        />
      </div>
    );
  }

  if (cell.kind === "badge") {
    const text = (cell.value ?? "—") as string | number;
    const toneClass = TONE_BADGE_CLASS[cell.tone ?? "default"] ?? "";
    return (
      <div className={common} onClick={handleClick}>
        <span
          className={cx(
            "inline-flex items-center rounded-full px-2 h-6 text-xs font-medium",
            toneClass
          )}
          title={typeof text === "string" ? text : String(text)}
        >
          {text}
        </span>
      </div>
    );
  }

  if (cell.kind === "note") {
    const text = (cell.value ?? "") as string;
    const display = text.trim().length ? text : "—";
    return (
      <div className={common} onClick={handleClick}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-block max-w-full overflow-hidden text-ellipsis align-middle">
                {display}
              </span>
            </TooltipTrigger>
            {/* Placeholder tooltip; content mirrors note/value for now */}
            <TooltipContent className="max-w-xs">
              <p className="text-xs leading-snug">{(cell.note ?? text) || "No notes"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  if (cell.kind === "number") {
    const n = typeof cell.value === "number" ? cell.value : null;
    return (
      <div className={common} onClick={handleClick}>
        {n === null ? "—" : fmtNumber(n)}
      </div>
    );
  }

  // default: "text"
  const text = cell.value ?? "—";
  return (
    <div className={common} onClick={handleClick} title={typeof text === "string" ? text : undefined}>
      {String(text)}
    </div>
  );
}
