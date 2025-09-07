// src/components/FilterBar.tsx
"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type IdName = { id: string; name: string; };

export type FilterState = {
    powerPlantId: string | null;
    turbineId: string | null;
    tag?: "all" | "outages";
};

type FilterBarProps = {
    powerPlants: IdName[];
    turbines: IdName[];
    value: FilterState;
    onChange: (next: FilterState) => void;
    onDrilldown?: () => void;
    onAddFilter?: () => void;
    isOpen?: boolean;
    className?: string;
};

export default function FilterBar({
    powerPlants,
    turbines,
    value,
    onChange,
    onDrilldown,
    onAddFilter,
    isOpen,
    className = "",
}: FilterBarProps) {
    const set = (patch: Partial<FilterState>) => 
        onChange({ ...value, ...patch });

    return (
        <div
            className={[
                "w-full rounded-2xl border bg-zinc-50/60 p-2 shadow-sm",
                "dark:bg-zinc-900/60 dark:border-zinc-800",
                className,
            ].join(" ")}
        >
            <div className="flex flex-wrap items-center gap-2">
                {/* Power Plant Selector */}
                <Select
                    value={value.powerPlantId ?? "all"}
                    onValueChange={(v: string) => set({ powerPlantId: v === "all" ? null : v })}
                >
                    <SelectTrigger className="w-[260px] rounded-xl bg-white/70 dark:bg-zinc-900/70">
                        <SelectValue placeholder="Power Plant" />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-xl">
                        <SelectItem value="all">All Power Plants</SelectItem>
                        {powerPlants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {/* Turbine Selector */}
                <Select
                    value={value.turbineId ?? "all"}
                    onValueChange={(v: string) => set({ turbineId: v === "all" ? null : v })}
                >
                    <SelectTrigger className="w-[260px] rounded-xl bg-white/70 dark:bg-zinc-900/70">
                        <SelectValue placeholder="Turbine" />
                    </SelectTrigger>
                    <SelectContent align="start" className="rounded-xl">
                        <SelectItem value="all">All Turbines</SelectItem>
                        {turbines.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                                {t.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* `Tag` Selector */}
                <div className="ml-0 flex items-center gap-2 sm:ml-2">
                    <Button
                        size="sm"
                        variant={value.tag === "all" ? "default" : "secondary"}
                        className="rounded-xl"
                        onClick={() => set({ tag: "all" })}
                    >
                        All
                    </Button>
                    <Button
                        size="sm"
                        variant={value.tag === "outages" ? "default" : "secondary"}
                        className="rounded-xl"
                        onClick={() => set({ tag: "outages" })}
                    >
                        Outages
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        className="rounded-xl"
                        onClick={onAddFilter}
                        aria-label="Add filter"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <div className="mx-2 grow" />
                <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={onDrilldown}
                    variant="secondary"
                    aria-pressed={!!isOpen}
                    aria-expanded={!!isOpen}
                    aria-controls="drilldown-panel"
                >
                    {isOpen ? "Close" : "More Filters"}
                </Button>
            </div>
        </div>
    )
}