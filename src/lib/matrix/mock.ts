import type { Turbine, StatRow, PieceRow, Tone, Cell } from "./types";

/**
 * Helpers ---------------------------------------------------------------------
 */

const textCell = (value: string, note?: string | null): Cell => ({
  kind: "text",
  value,
  note: note ?? null,
});

const numberCell = (value: number): Cell => ({
  kind: "number",
  value,
});

const badgeCell = (value: string, tone: Tone = "default", note?: string | null): Cell => ({
  kind: "badge",
  value,
  tone,
  note: note ?? null,
});

const noteCell = (value: string): Cell => ({
  kind: "note",
  value,
  note: value || null,
});

const conditionTone = (condition: string): Tone => {
  const c = condition.toLowerCase();
  if (/(ok|good|normal)/.test(c)) return "success";
  if (/(monitor|watch|inspect)/.test(c)) return "warning";
  if (/(replace now|fault|failed|bad)/.test(c)) return "danger";
  if (/(spare|unknown|na)/.test(c)) return "muted";
  return "info";
};

const remainingTone = (remaining: number, interval: number): Tone => {
  // Simple visual cue: low remaining vs interval window.
  if (remaining <= 0) return "danger";
  const pct = remaining / Math.max(1, interval);
  if (pct < 0.15) return "warning";
  return "success";
};

/**
 * Stats & Pieces row factories -------------------------------------------------
 */

function makeStatRows(
  rows: Array<{
    label: string;
    target: number;
    interval: number;
    actual: number;
    note?: string;
  }>,
  prefix: string
): StatRow[] {
  return rows.map((r, i) => {
    const remaining = Math.max(0, r.target - r.actual);
    return {
      id: `${prefix}-stat-${i}`,
      label: r.label,
      cells: [
        // Column order must match DEFAULT_STATS_COLUMNS:
        // metric | target | interval | actual | remaining | note
        textCell(r.label),
        numberCell(r.target),
        numberCell(r.interval),
        numberCell(r.actual),
        { kind: "number", value: remaining, tone: remainingTone(remaining, r.interval) },
        noteCell(r.note ?? ""),
      ],
    };
  });
}

function makePieceRows(
  rows: Array<{
    piece: string;
    position: string;   // e.g., S1N, S2S, Rotor
    condition: string;  // e.g., OK, Monitor, Replace Soon, Replace Now
    setIn?: string;     // YYYY-MM-DD
    setOut?: string;    // YYYY-MM-DD | "-"
    notes?: string;
  }>,
  prefix: string
): PieceRow[] {
  return rows.map((r, i) => {
    return {
      id: `${prefix}-piece-${i}`,
      label: r.piece,
      cells: [
        // Column order must match DEFAULT_PIECES_COLUMNS:
        // piece | position | condition | setIn | setOut | notes
        textCell(r.piece),
        badgeCell(r.position, "info"),
        badgeCell(r.condition, conditionTone(r.condition)),
        textCell(r.setIn ?? "-"),
        textCell(r.setOut ?? "-"),
        noteCell(r.notes ?? ""),
      ],
    };
  });
}

/**
 * Mock datasets ---------------------------------------------------------------
 * All values are UI-only. Adjust as needed to match your visual demos.
 */

const T1_STATS: StatRow[] = makeStatRows(
  [
    { label: "Hours",  target: 24000, interval: 8000, actual: 18520, note: "Within window" },
    { label: "Starts", target: 1200,  interval: 400,  actual: 980,   note: "Monitor usage trend" },
    { label: "Trips",  target: 200,   interval: 50,   actual: 182,   note: "Close to limit" },
  ],
  "T1"
);

const T1_PIECES: PieceRow[] = makePieceRows(
  [
    { piece: "Liner Caps", position: "Comb", condition: "OK", setIn: "2024-11-03", setOut: "-", notes: "Standard installation, proper clearance verified. Operating within normal temperature range." },
    { piece: "Comb Liners", position: "Comb", condition: "Monitor", setIn: "2025-02-18", setOut: "-", notes: "Minor scoring" },
    { piece: "Tran PRC", position: "Tran", condition: "OK", setIn: "2024-08-22", setOut: "-", notes: "Pressure regulation stable. Calibration checked during last inspection. No drift detected." },
    { piece: "S1N", position: "S1N", condition: "OK", setIn: "2025-04-10", setOut: "-", notes: "Newly installed stage 1 nozzle. Airfoil geometry within spec. Flow characteristics nominal." },
    { piece: "S2N", position: "S2N", condition: "Replace Soon", setIn: "2024-06-12", setOut: "-", notes: "Edge wear" },
    { piece: "S3N", position: "S3N", condition: "Monitor", setIn: "2024-09-01", setOut: "-", notes: "Stage 3 nozzle showing typical wear pattern. Efficiency remains acceptable. Next inspection scheduled." },
    { piece: "Rotor", position: "Rotor", condition: "OK", setIn: "2023-12-05", setOut: "-", notes: "Rotor balance verified. Blade attachment integrity confirmed. Vibration levels within tolerance." },
  ],
  "T1"
);

const T2_STATS: StatRow[] = makeStatRows(
  [
    { label: "Hours",  target: 24000, interval: 8000, actual: 23270, note: "Approaching interval" },
    { label: "Starts", target: 1200,  interval: 400,  actual: 1165,  note: "Near limit" },
    { label: "Trips",  target: 200,   interval: 50,   actual: 201,   note: "Exceeded; investigate" },
  ],
  "T2"
);

const T2_PIECES: PieceRow[] = makePieceRows(
  [
    { piece: "Liner Caps", position: "Comb", condition: "Monitor", setIn: "2024-10-19", setOut: "-", notes: "Hot spots" },
    { piece: "Comb Liners", position: "Comb", condition: "Replace Now", setIn: "2024-03-07", setOut: "-", notes: "Cracks visible" },
    { piece: "Tran PRC", position: "Tran", condition: "OK", setIn: "2023-11-30", setOut: "-", notes: "Long-service pressure control valve. Response time consistent. Maintenance history shows regular calibration." },
    { piece: "S1S", position: "S1S", condition: "OK", setIn: "2025-05-21", setOut: "-", notes: "Recent stage 1 stator installation. Cooling passages clear. Thermal barrier coating intact." },
    { piece: "S2S", position: "S2S", condition: "Monitor", setIn: "2024-07-14", setOut: "-", notes: "Vibration trend" },
    { piece: "S3S", position: "S3S", condition: "OK", setIn: "2024-12-02", setOut: "-", notes: "Stage 3 stator performing well. No erosion concerns. Blade count verified during last inspection." },
    { piece: "Rotor", position: "Rotor", condition: "OK", setIn: "2023-08-09", setOut: "-", notes: "Rotor assembly in good condition. Shaft alignment verified. Bearing clearances within specification." },
  ],
  "T2"
);

const T3_STATS: StatRow[] = makeStatRows(
  [
    { label: "Hours",  target: 24000, interval: 8000, actual: 7400, note: "Fresh after overhaul" },
    { label: "Starts", target: 1200,  interval: 400,  actual: 180,  note: "" },
    { label: "Trips",  target: 200,   interval: 50,   actual: 12,   note: "" },
  ],
  "T3"
);

const T3_PIECES: PieceRow[] = makePieceRows(
  [
    { piece: "Liner Caps", position: "Comb", condition: "OK", setIn: "2025-06-01", setOut: "-", notes: "Fresh installation post-overhaul. All caps properly seated and torqued. Thermal expansion clearance confirmed." },
    { piece: "Comb Liners", position: "Comb", condition: "OK", setIn: "2025-06-01", setOut: "-", notes: "New combustor liners installed. Coating application verified. No hot spots detected during initial run." },
    { piece: "Tran PRC", position: "Tran", condition: "OK", setIn: "2025-06-01", setOut: "-", notes: "Pressure control valve replaced during overhaul. Factory calibration certified. Response characteristics nominal." },
    { piece: "S1B", position: "S1B", condition: "OK", setIn: "2025-06-01", setOut: "-", notes: "Stage 1 blade set newly installed. Airfoil profiles within tolerance. Root attachment integrity verified." },
    { piece: "S2B", position: "S2B", condition: "OK", setIn: "2025-06-01", setOut: "-", notes: "Stage 2 blades fresh from overhaul. Cooling holes inspected and clear. Tip clearance set to specification." },
    { piece: "S3B", position: "S3B", condition: "OK", setIn: "2025-06-01", setOut: "-", notes: "Stage 3 blade assembly replaced. Material certification on file. Operating hours reset to zero." },
    { piece: "Rotor", position: "Rotor", condition: "OK", setIn: "2025-06-01", setOut: "-", notes: "Complete rotor rebuild completed. Dynamic balance performed. All blade attachments torqued to spec. Service life reset." },
  ],
  "T3"
);

/**
 * Public export ----------------------------------------------------------------
 * Import this into your page/state hook to render the Matrix UI with no backend.
 */

export const MOCK_TURBINES: Turbine[] = [
  { id: "T-101", name: "Unit 1A", unit: "GT-01", stats: T1_STATS, pieces: T1_PIECES },
  { id: "T-202", name: "Unit 2B", unit: "GT-02", stats: T2_STATS, pieces: T2_PIECES },
  { id: "T-303", name: "Unit 3C", unit: "GT-03", stats: T3_STATS, pieces: T3_PIECES },
];

/**
 * Convenience empty set used by EmptyState testing.
 */
export const MOCK_EMPTY: Turbine[] = [];
