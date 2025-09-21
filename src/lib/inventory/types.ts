import type { ID } from "@/lib/matrix/types";

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
};