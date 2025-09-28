"use client";

import * as React from "react";
import type { Turbine } from "@/lib/matrix/types";
import StatsMatrix from "@/components/matrix/StatsMatrix";
import PiecesMatrix from "@/components/matrix/PiecesMatrix";
import { Button } from "@/components/ui/button";

const cx = (...parts: Array<string | false  | undefined>) => parts.filter(Boolean).join(" ");

type TurbineCardProps = {
    turbine: Turbine;
    className?: string;
    onActionClick?: () => void;
    actionLabel?: string;
};

export default function TurbineCard({
    turbine,
    className,
    onActionClick,
    actionLabel = "Action",
}: TurbineCardProps) {
    return (
        <section className={cx("rounded-2xl border bg-card p-4", className)}>
            {/* Header */}
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                    <h2>
                        {turbine.name}
                        {turbine.unit ? <span className="ml-2 text-sm font-normal text-muted-foreground">({turbine.unit})</span> : null}
                    </h2>
                </div>
                <div className="shrink-0">
                    <Button variant="outline" size="sm" onClick={onActionClick} aria-label={`${turbine.name} actions`}>
                        {actionLabel}
                    </Button>
                </div>
            </div>

            {/* Matrices */}
            <div className="space-y-4">
                <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Stats</div>
                    <StatsMatrix rows={turbine.stats} />
                </div>

                <div>
                    <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Pieces</div>
                    <PiecesMatrix 
                        rows={turbine.pieces} 
                        emptyLabel="No pieces available" 
                        turbineName={turbine.name}
                    />
                </div>
            </div>
        </section>
    );
}