// src/components/inventory/InventoryMatrix.tsx
"use client";

import * as React from "react";

const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

type PieceItem = any;

type ComponentRow = {
  componentType: string;
  componentName: string;
  hours: number | string;
  trips: number | string;
  starts: number | string;
  status: string;
  state: string;
  turbine: string;
  id?: string | number; // if you have ids, great
};

type InventoryMatrixProps =
  | {
      dataset: "pieces";
      items: PieceItem[];
      onSelectPiece?: (item: PieceItem) => void;
    }
  | {
      dataset: "components";
      componentStats: ComponentRow[];
      onSelectComponent?: (row: ComponentRow) => void;
    };

/* -------------------- Status/State color logic -------------------- */
const norm = (s: unknown) => String(s ?? "").trim().toLowerCase();

function statusTone(status: string) {
  const s = norm(status);
  if (["ok", "good", "healthy", "active"].includes(s)) return "ok";
  if (["warning", "degraded", "service soon"].includes(s)) return "warn";
  if (["failed", "fault", "bad", "down", "out of service"].includes(s)) return "bad";
  return "neutral";
}

function stateTone(state: string) {
  const s = norm(state);
  if (["spare", "standby", "stock"].includes(s)) return "info";
  if (["installed", "running", "active"].includes(s)) return "ok";
  if (["repair", "rma", "maintenance", "in shop"].includes(s)) return "warn";
  return "neutral";
}

function rowStripeClass(tone: ReturnType<typeof statusTone>) {
  switch (tone) {
    case "ok":
      return "border-l-4 border-emerald-500";
    case "warn":
      return "border-l-4 border-amber-500";
    case "bad":
      return "border-l-4 border-rose-600";
    default:
      return "border-l-4 border-transparent";
  }
}

function badgeClass(tone: "ok" | "warn" | "bad" | "info" | "neutral") {
  switch (tone) {
    case "ok":
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "warn":
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
    case "bad":
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300";
    case "info":
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300";
    default:
      return "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-muted text-foreground/80 dark:bg-muted/60";
  }
}

const Badge = ({ text, tone }: { text: React.ReactNode; tone: "ok" | "warn" | "bad" | "info" | "neutral" }) => (
  <span className={badgeClass(tone)}>{text}</span>
);

/* -------------------- First-cell helper: pseudo dot + spacing -------------------- */
const firstCellBase =
  // give space for the green left stripe and our dot
  "py-2 pr-3 relative pl-6 " +
  // dataset dot (pseudo-element so it can't steal clicks)
  "before:content-[''] before:absolute before:left-2 before:top-1/2 before:-translate-y-1/2 " +
  "before:h-2.5 before:w-2.5 before:rounded-full before:pointer-events-none";

/* -------------------- Components View -------------------- */
function ComponentsTable({
  rows,
  onSelect,
}: {
  rows: ComponentRow[];
  onSelect?: (row: ComponentRow) => void;
}) {
  // dataset color vars for the pseudo dot
  const style = {
    // @ts-ignore custom CSS vars
    "--dot-color": "#8b5cf6", // violet-500
    "--dot-ring": "rgba(139, 92, 246, 0.35)",
  } as React.CSSProperties;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm" style={style}>
        <thead className="text-left">
          <tr className="border-b">
            <th className="py-2 pr-3">Component Type</th>
            <th className="py-2 pr-3">Component Name</th>
            <th className="py-2 pr-3">Hours</th>
            <th className="py-2 pr-3">Trips</th>
            <th className="py-2 pr-3">Starts</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">State</th>
            <th className="py-2 pr-3">Turbine</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={8} className="py-6 text-muted-foreground">
                No component stats.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => {
              const sTone = statusTone(r.status);
              const stTone = stateTone(r.state);
              return (
                <tr
                  key={r.id ?? i}
                  className={cx(
                    "border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                    rowStripeClass(sTone)
                  )}
                  onClick={() => onSelect?.(r)}
                >
                  <td
                    className={`${firstCellBase} before:bg-[var(--dot-color)] before:shadow-[0_0_0_2px_var(--dot-ring)]`}
                    // optional data attribute if you do delegated clicks elsewhere
                    data-component-id={r.id ?? r.componentName}
                  >
                    {r.componentType}
                  </td>
                  <td className="py-2 pr-3">{r.componentName}</td>
                  <td className="py-2 pr-3">{r.hours}</td>
                  <td className="py-2 pr-3">{r.trips}</td>
                  <td className="py-2 pr-3">{r.starts}</td>
                  <td className="py-2 pr-3">
                    <Badge text={r.status || "—"} tone={sTone} />
                  </td>
                  <td className="py-2 pr-3">
                    <Badge text={r.state || "—"} tone={stTone} />
                  </td>
                  <td className="py-2 pr-3">{r.turbine}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- Pieces View -------------------- */
function PiecesTable({
  items,
  onSelect,
}: {
  items: PieceItem[];
  onSelect?: (item: PieceItem) => void;
}) {
  const style = {
    // @ts-ignore custom CSS vars
    "--dot-color": "#06b6d4", // cyan-500
    "--dot-ring": "rgba(6, 182, 212, 0.35)",
  } as React.CSSProperties;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-sm" style={style}>
        <thead className="text-left">
          <tr className="border-b">
            <th className="py-2 pr-3">Piece</th>
            <th className="py-2 pr-3">SN</th>
            <th className="py-2 pr-3">Hours</th>
            <th className="py-2 pr-3">Trips</th>
            <th className="py-2 pr-3">Starts</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2 pr-3">State</th>
            <th className="py-2 pr-3">Turbine</th>
          </tr>
        </thead>
        <tbody>
          {(items ?? []).map((it: any, i: number) => {
            const sTone = statusTone(it.status ?? it.health);
            const stTone = stateTone(it.state ?? it.condition);
            return (
              <tr
                key={it.id ?? i}
                className={cx(
                  "border-b last:border-0 hover:bg-muted/50 transition-colors cursor-pointer",
                  rowStripeClass(sTone)
                )}
                onClick={() => onSelect?.(it)}
                // keyboard activation (Enter/Space) when row is focused
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect?.(it);
                  }
                }}
              >
                <td
                  className={`${firstCellBase} before:bg-[var(--dot-color)] before:shadow-[0_0_0_2px_var(--dot-ring)]`}
                  data-piece-id={it.id ?? it.sn ?? it.piece ?? it.name}
                >
                  {it.piece ?? it.name ?? "—"}
                </td>
                <td className="py-2 pr-3">{it.sn ?? it.serial ?? "—"}</td>
                <td className="py-2 pr-3">{it.hours ?? "—"}</td>
                <td className="py-2 pr-3">{it.trips ?? "—"}</td>
                <td className="py-2 pr-3">{it.starts ?? "—"}</td>
                <td className="py-2 pr-3">
                  <Badge text={it.status ?? it.health ?? "—"} tone={sTone} />
                </td>
                <td className="py-2 pr-3">
                  <Badge text={it.state ?? it.condition ?? "—"} tone={stTone} />
                </td>
                <td className="py-2 pr-3">{it.turbine ?? "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------- Main Export -------------------- */
export default function InventoryMatrix(props: InventoryMatrixProps) {
  if (props.dataset === "components") {
    return (
      <ComponentsTable
        rows={props.componentStats ?? []}
        onSelect={props.onSelectComponent}
      />
    );
  }
  return (
    <PiecesTable
      items={props.items ?? []}
      onSelect={props.onSelectPiece}
    />
  );
}
