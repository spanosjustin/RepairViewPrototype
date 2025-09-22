/** A turbine component, e.g. Fuel Liner or Comb Liner **/
export type Component = {
    id: string;
    name: string;
    type: "fuel" | "comb";
    events: Event[];    
};

export type Event = {
    id: string;
    name: string;
    date: string; // ISO date string
    intervalFH: number;         // interval flight hours
    intervalFS: number;         // interval flight starts
    intervalTrips: number;      // interval trips
}

/** Pre-repair event details */
export type PreRepairInfo = {
    intervalFH: number;
    intervalFS: number;
    intervalTrips: number;
    date: string;
};

/** A row in the repair matrix (bottom table) */
export type RepairRow = {
    pos: number;                // Position index
    pn: string;                 // Part Number
    sn: string;                 // Serial Number
    altSn?: string;             // Optional secondary SN (your sketch shows 2 SNs)
    condition: string;          // Condition Details
    repair: string;             // Repair Details
    status: string;             // Status (e.g. Active, Removed)
    verified: boolean;          // "V" column in your sketch
};