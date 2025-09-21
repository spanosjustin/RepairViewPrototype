import type { InventoryItem } from "@/lib/inventory/types";

export const MOCK_INVENTORY: InventoryItem[] = [
    { sn: "SN-00123", pn: "PN-AX45", hours: 18520, trips: 182, starts: 980,  status: "OK",           state: "In Service",  component: "Comb Liner" },
    { sn: "SN-00456", pn: "PN-QZ19", hours: 23270, trips: 201, starts: 1165, status: "Replace Now",  state: "Repair",      component: "Comb Liner" },
    { sn: "SN-00789", pn: "PN-TX88", hours:  7400, trips:  12, starts: 180,  status: "OK",           state: "In Service",  component: "Tran PRC" },
    { sn: "SN-01011", pn: "PN-S1N1", hours:  9240, trips:  33, starts: 402,  status: "Monitor",      state: "In Service",  component: "S1N" },
    { sn: "SN-01314", pn: "PN-S2N2", hours: 15410, trips:  77, starts: 605,  status: "Replace Soon", state: "In Service",  component: "S2N" },
    { sn: "SN-01617", pn: "PN-RTR1", hours: 28100, trips:  15, starts: 220,  status: "OK",           state: "Standby",     component: "Rotor" },
    { sn: "SN-01920", pn: "PN-SPR1", hours:     0, trips:   0, starts:   0,  status: "Spare",        state: "On Order",    component: "Comb Liner" },
    { sn: "SN-02122", pn: "PN-UNK1", hours:  1200, trips:   5, starts:  40,  status: "Unknown",      state: "Out of Service", component: "S3S" },
];