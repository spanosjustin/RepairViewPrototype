// src/lib/repair/types.ts

/** A turbine component, e.g. Fuel Liner or Comb Liner */
export type Component = {
    id: string;                 // unique id
    name: string;               // e.g. "Fuel Liner A"
    type: "fuel" | "comb";      // which group it belongs to
    events: Event[];            // repair events tied to this component
  };
  
  /** A repair event tied to a component */
  export type Event = {
    id: string;
    name: string;               // e.g. "Hot Section Inspection"
    date: string;               // ISO date string
    intervalFH: number;         // interval flight hours
    intervalFS: number;         // interval flight starts
    intervalTrips: number;      // interval trips
    preRepair?: PreRepairInfo;  // optional: pre-repair event info
  };
  
  /** Pre-repair event details */
  export type PreRepairInfo = {
    intervalFH: number;
    intervalFS: number;
    intervalTrips: number;
    date: string;
  };
  
  /** A row in the repair matrix (bottom table) */
  export type RepairRow = {
    pos: number;                // Position/row number
    pn: string;                 // Part Number
    sn: string;                 // Serial Number
    altSn?: string;             // Alternate Serial Number (optional)
    condition: string;          // Condition Details
    repair: string;             // Repair Details
    status: string;             // Status (e.g. Completed, In Progress)
    verified?: boolean;          // Whether the repair is verified (optional)
  };
  