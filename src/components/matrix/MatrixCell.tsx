"use client";

import * as React from "react";
import type { Align, Cell } from "@/lib/matrix/types";
import { TONE_BADGE_CLASS } from "@/lib/matrix/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/** tiny class combiner to avoid pulling in a utils file */
const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");

type MatrixCellProps = {
  cell: Cell;
  align?: Align;
  className?: string;
  /** optional click handler; no-ops by default */
  onClick?: () => void;
};

const alignClass: Record<Align, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const fmtNumber = (n: number) =>
  new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(n);

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
}: MatrixCellProps) {
  const clickable = typeof onClick === "function";

  const common = cx(
    "px-2 py-1 text-sm leading-5 whitespace-nowrap overflow-hidden text-ellipsis",
    alignClass[align],
    clickable && "cursor-pointer select-none",
    className
  );

  if (cell.kind === "badge") {
    const text = (cell.value ?? "—") as string | number;
    const toneClass = TONE_BADGE_CLASS[cell.tone ?? "default"] ?? "";
    return (
      <div className={common} onClick={onClick}>
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
      <div className={common} onClick={onClick}>
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
      <div className={common} onClick={onClick}>
        {n === null ? "—" : fmtNumber(n)}
      </div>
    );
  }

  // default: "text"
  const text = cell.value ?? "—";
  return (
    <div className={common} onClick={onClick} title={typeof text === "string" ? text : undefined}>
      {String(text)}
    </div>
  );
}
