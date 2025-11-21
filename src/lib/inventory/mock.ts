import type { InventoryItem } from "@/lib/inventory/types";

// Component types that each turbine should have
const COMPONENT_TYPES = [
    "Fuel Nozzles", "Liner Caps", "Comb Liners", "Tran PRC", 
    "S1N", "S2N", "S3N", "S1S", "S2S", "S3S", "S1B", "S2B", "S3B", "Rotor"
];

// Turbine IDs from matrix mock data
const TURBINE_IDS = ["T-101", "T-202", "T-303"];

// Generate unique part numbers and serial numbers for each component
const generateComponentData = (turbineId: string, componentType: string, index: number) => {
    const componentPrefixes: Record<string, string> = {
        "Fuel Nozzles": "FN",
        "Liner Caps": "CP", 
        "Comb Liners": "CL",
        "Tran PRC": "TP",
        "S1N": "1N",
        "S2N": "2N", 
        "S3N": "3N",
        "S1S": "1S",
        "S2S": "2S",
        "S3S": "3S",
        "S1B": "1B",
        "S2B": "2B", 
        "S3B": "3B",
        "Rotor": "RT"
    };

    const prefix = componentPrefixes[componentType] || "XX";
    const turbineNum = turbineId.split('-')[1];
    const pn = `${prefix}-${turbineNum}${String(index).padStart(2, '0')}`;
    const sn = `SN-${turbineNum}${String(index).padStart(3, '0')}`;
    
    // Generate component name in format like "CP-14B", "TP-16A", "1S-17A"
    // Number is based on turbine number and component index, letter is A or B
    const componentNumber = parseInt(turbineNum) * 10 + index;
    const componentLetter = Math.random() < 0.5 ? 'A' : 'B';
    const componentName = `${prefix}-${componentNumber}${componentLetter}`;
    
    // Generate realistic hours, trips, and starts with some variation
    const baseHours = Math.floor(Math.random() * 20000) + 5000;
    const trips = Math.floor(baseHours / 100) + Math.floor(Math.random() * 50);
    const starts = Math.floor(trips / 2) + Math.floor(Math.random() * 20);
    
    // Generate realistic status distribution
    const statuses: Array<"OK" | "Monitor" | "Replace Soon" | "Replace Now" | "Spare" | "Degraded" | "Unknown"> = 
        ["OK", "OK", "OK", "Monitor", "Replace Soon", "Replace Now", "Spare", "Degraded", "Unknown"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    const states: Array<"In Service" | "Out of Service" | "Standby" | "Repair" | "On Order"> = 
        ["In Service", "In Service", "In Service", "Standby", "Repair", "Out of Service", "On Order"];
    const state = states[Math.floor(Math.random() * states.length)];

    return {
        sn,
        pn,
        hours: baseHours,
        trips,
        starts,
        status,
        state,
        component: componentName,
        componentName: componentName,
        componentType: componentType,
        turbine: turbineId,
        position: `${turbineId}-${componentType.replace(/\s+/g, '')}`
    };
};

// Generate inventory data for all turbines with all component types
export const MOCK_INVENTORY: InventoryItem[] = TURBINE_IDS.flatMap((turbineId, turbineIndex) =>
    COMPONENT_TYPES.map((componentType, componentIndex) => 
        generateComponentData(turbineId, componentType, componentIndex + 1)
    )
);