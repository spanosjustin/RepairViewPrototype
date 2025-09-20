"use client";

import * as React from "react";
import type { Turbine } from "@/lib/matrix/types";
import TurbineCard from "@/components/matrix/TurbineCard";
import EmptyState from "@/components/matrix/EmptyState";

const cx = (...parts: Array<string | false  | undefined>) => parts.filter(Boolean).join(" ");

type TurbineListProps = {
    turbines: Turbine[];
    className?: string;
};

export default function TurbineList({ turbines, className }: TurbineListProps) {
    if(!turbines?.length) {
        return <EmptyState message="No turbines found" />;
    }

    return (
        <div className={cx("space-y-6", className)}>
            {turbines.map((t) => (
                <TurbineCard key={t.id} turbine={t} />
            ))}
        </div>
    );
}