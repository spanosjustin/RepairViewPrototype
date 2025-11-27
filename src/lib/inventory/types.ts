import type { ID } from "@/lib/matrix/types";

export type RepairEvent = {
    title?: string | null;
    date?: string | null;
    repairDetails?: string | null;
    conditionDetails?: string | null;
};

export type InventoryItem = {
    id?: ID;
    sn: string;
    pn: string;
    hours: number;
    trips: number;
    starts: number;
    status: "OK" | "Monitor" | "Replace Soon" | "Replace Now" | "Spare" | "Degraded" | "Unknown";
    state: "In Service" | "Out of Service" | "Standby" | "Repair" | "On Order";
    component: string;
    componentType: string;
    turbine: string;
    position: string;
    notes?: string[]; // Optional array of notes
    repairEvents?: RepairEvent[]; // Optional array of repair events
};