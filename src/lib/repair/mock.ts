// src/lib/repair/mock.ts

import type { Component, Event, RepairRow } from "./types";

/** Example repair rows for the matrix (bottom table) */
export const MOCK_REPAIR_ROWS: RepairRow[] = [
  {
    pos: 1,
    pn: "PN-123",
    sn: "SN-001",
    altSn: "SN-001A",
    condition: "Crack observed near weld seam",
    repair: "Weld repaired and reinforced",
    status: "Completed",
    verified: true,
  },
  {
    pos: 2,
    pn: "PN-456",
    sn: "SN-002",
    condition: "Coating erosion",
    repair: "Re-applied protective coating",
    status: "In Progress",
    verified: false,
  },
];

/** Example events for a single component */
const MOCK_EVENTS: Event[] = [
  {
    id: "evt-1",
    name: "Hot Section Inspection",
    date: "2025-05-15",
    intervalFH: 1200,
    intervalFS: 900,
    intervalTrips: 50,
    preRepair: {
      intervalFH: 1000,
      intervalFS: 750,
      intervalTrips: 45,
      date: "2025-05-01",
    },
  },
  {
    id: "evt-2",
    name: "Combustor Overhaul",
    date: "2025-06-10",
    intervalFH: 1500,
    intervalFS: 1100,
    intervalTrips: 60,
  },
];

/** Example components (Fuel Liner & Comb Liner) */
export const MOCK_COMPONENTS: Component[] = [
  {
    id: "comp-1",
    name: "Fuel Liner A",
    type: "fuel",
    events: MOCK_EVENTS,
  },
  {
    id: "comp-2",
    name: "Comb Liner A",
    type: "comb",
    events: MOCK_EVENTS,
  },
];
