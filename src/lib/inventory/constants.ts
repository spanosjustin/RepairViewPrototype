import type { Column } from "@/lib/matrix/types";

export const DEFAULT_INVENTORY_COLUMNS: Column[] = [
    { id: "sn",        title: "SN",        kind: "text",   minWidth: 120, align: "left",  sortable: true, pinned: "left" },
    { id: "pn",        title: "PN",        kind: "text",   minWidth: 140, align: "left",  sortable: true },
    { id: "hours",     title: "Hours",     kind: "number", width: 112,    align: "right", sortable: true },
    { id: "trips",     title: "Trips",     kind: "number", width: 112,    align: "right", sortable: true },
    { id: "starts",    title: "Starts",    kind: "number", width: 112,    align: "right", sortable: true },
    { id: "status",    title: "Status",    kind: "badge",  width: 128,    align: "center", sortable: true },
    { id: "state",     title: "State",     kind: "badge",  width: 140,    align: "center", sortable: true },
    { id: "component", title: "Component", kind: "text",   minWidth: 180, align: "left",  sortable: true },
];