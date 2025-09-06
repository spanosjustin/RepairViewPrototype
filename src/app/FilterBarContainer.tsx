// src/app/Filter/Bar/Container
"use client";

import { useState } from "react";
import FilterBar, { FilterState } from "@/components/FilterBar";

export default function FilterbarContainer() {
    // Replace DB Query later
    const powerPlants = [
        { id: "pp-1", name: "Riverbend" },
        { id: "pp-2", name: "Mountainview" },
        { id: "pp-3", name: "Lakeside" },
    ];
    const turbines = [
        { id: "tb-1", name: "Turbine A" },
        { id: "tb-2", name: "Turbine B" },
        { id: "tb-3", name: "Turbine C" },
    ];

    const [fitlers, setFilters] = useState<FilterState>({
        powerPlantId: null,
        turbineId: null,
        tag: "all",
    });

    return (
        <div className="border-b bg-white/70 p-2 dark:bg-zinc-900/70">
            <div className="mx-auto max-w-6xl">
                <FilterBar
                    powerPlants={powerPlants}
                    turbines={turbines}
                    value={fitlers}
                    onChange={setFilters}
                    onDrilldown={() => alert("Drilldown clicked")}
                    onAddFilter={() => alert("Add filter clicked")}
                />
            </div>
        </div>
    )
}