"use client";

import * as React from "react";
import type { Turbine } from "@/lib/matrix/types";
import TurbineCard from "@/components/matrix/TurbineCard";
import EmptyState from "@/components/matrix/EmptyState";

const cx = (...parts: Array<string | false  | undefined>) => parts.filter(Boolean).join(" ");

type TurbineListProps = {
    turbines: Turbine[];
    className?: string;
    onCellEdit?: (turbineId: string, rowId: string, cellIndex: number, newValue: string | number) => void;
    editable?: boolean;
    editingCell?: { turbineId: string; rowId: string; cellIndex: number } | null;
    onStartEdit?: (turbineId: string, rowId: string, cellIndex: number) => void;
    onStopEdit?: () => void;
    actionLabel?: string;
};

export default function TurbineList({ 
    turbines, 
    className, 
    onCellEdit, 
    editable = false,
    editingCell,
    onStartEdit,
    onStopEdit,
    actionLabel = "Edit",
}: TurbineListProps) {
    if(!turbines?.length) {
        return <EmptyState message="No turbines found" />;
    }

    return (
        <div className={cx("space-y-6", className)}>
            {turbines.map((t) => {
                const isEditingThisTurbine = editingCell?.turbineId === t.id;
                const turbineEditingCell = isEditingThisTurbine 
                    ? { rowId: editingCell.rowId, cellIndex: editingCell.cellIndex }
                    : null;

                return (
                    <TurbineCard 
                        key={t.id} 
                        turbine={t} 
                        onCellEdit={onCellEdit}
                        editable={editable}
                        editingCell={turbineEditingCell}
                        onStartEdit={onStartEdit}
                        onStopEdit={onStopEdit}
                        actionLabel={actionLabel}
                    />
                );
            })}
        </div>
    );
}