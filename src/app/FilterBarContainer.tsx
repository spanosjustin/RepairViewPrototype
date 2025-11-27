// src/app/Filter/Bar/Container
"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import FilterBar, { FilterState } from "@/components/FilterBar";
import DrilldownCard from "@/components/DrilldownCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFilter } from "./FilterContext";

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

    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = () => setIsOpen((prev) => !prev);

    const { searchTerms, setSearchTerms, searchQuery, setSearchQuery } = useFilter();

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchQuery.trim()) {
            e.preventDefault();
            const trimmedQuery = searchQuery.trim();
            if (!searchTerms.includes(trimmedQuery)) {
                setSearchTerms([...searchTerms, trimmedQuery]);
            }
            setSearchQuery("");
        }
    };

    const removeSearchTerm = (term: string) => {
        setSearchTerms(searchTerms.filter((t) => t !== term));
    };

    return (
        <div className="border-b bg-white/70 p-2 dark:bg-zinc-900/70">
            <div className="mx-auto max-w-6xl">
                <FilterBar
                    powerPlants={powerPlants}
                    turbines={turbines}
                    value={fitlers}
                    onChange={setFilters}
                    onDrilldown={handleToggle}
                    isOpen={isOpen}
                    onAddFilter={() => alert("Feature Coming Soon...")}
                />

                {isOpen && (
                    <div id="drilldown-panel" className="mt-3">
                        <DrilldownCard />
                    </div>
                )}

                {/* Search Bar */}
                <div className="mt-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search... (Press Enter to add)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            className="w-full rounded-xl bg-white/70 pl-9 dark:bg-zinc-900/70"
                        />
                    </div>
                    {searchTerms.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {searchTerms.map((term) => (
                                <Badge
                                    key={term}
                                    variant="secondary"
                                    className="flex items-center gap-1.5 rounded-xl px-3 py-1"
                                >
                                    <span>{term}</span>
                                    <button
                                        onClick={() => removeSearchTerm(term)}
                                        className="hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full p-0.5 transition-colors"
                                        aria-label={`Remove ${term}`}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}