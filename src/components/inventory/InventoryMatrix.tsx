"use client";

import * as React from "react";
import MatrixGrid from "@/components/matrix/MatrixGrid";
import type { Cell, MatrixProps, MatrixRow, Tone } from "@/lib/matrix/types";
import type { InventoryItem } from "@/lib/inventory/types";
import { DEFAULT_INVENTORY_COLUMNS } from "@/lib/inventory/constants";

type Props = {
    items: InventoryItem[];
    columns?: MatrixProps["columns"];
    emptyLabel?: string;
};

const statusTone = (s: InventoryItem["status"]): Tone => {
    const v = s.toLowerCase();
    if (v === "ok") return "success";
    if (v === "monitor") return "warning";
    if (v === "replace soon") return "warning";
    if (v === "replace now") return "danger";
    if (v === "spare" || v === "unknown") return "muted";
    return "info";
};

const stateTone = (s: InventoryItem["state"]): Tone => {
    const v = s.toLowerCase();
    if (v === "in service") return "success";
    if (v === "standby") return "info";
    if (v === "repair") return "warning";
    if (v === "out of service") return "danger";
    if (v === "on order") return "muted";
    return "info";
};

function toRows(items: InventoryItem[]): MatrixRow[] {
    return items.map((it, i) => {
        const id = it.id ?? `inv-${i}-${it.sn}`;
        const cells: Cell[] = [
            { kind: "text",   value: it.sn },
            { kind: "text",   value: it.pn },
            { kind: "number", value: it.hours },
            { kind: "number", value: it.trips },
            { kind: "number", value: it.starts },
            { kind: "badge",  value: it.status, tone: statusTone(it.status) },
            { kind: "badge",  value: it.state,  tone: stateTone(it.state) },
            { kind: "text",   value: it.component },
        ];
        return { id, label: it.sn, cells };
    });
}

export default function InventoryMatrix({
    items,
    columns = DEFAULT_INVENTORY_COLUMNS,
    emptyLabel = "No inventory items",
}: Props) {
    const rows = React.useMemo(() => toRows(items), [items]);
    return <MatrixGrid columns={columns} rows={rows} emptyLabel={emptyLabel} />;
}