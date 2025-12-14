// src/app/Filter/Bar/Container
"use client";

import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import FilterBar, { FilterState } from "@/components/FilterBar";
import DrilldownCard from "@/components/DrilldownCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFilter } from "./FilterContext";
import { plantStorage, turbineStorage } from "@/lib/storage/db/storage";

export default function FilterbarContainer() {
    const [powerPlants, setPowerPlants] = useState<Array<{ id: string; name: string }>>([]);
    const [turbines, setTurbines] = useState<Array<{ id: string; name: string }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [fitlers, setFilters] = useState<FilterState>({
        powerPlantId: null,
        turbineId: null,
        tag: "all",
    });

    const [isOpen, setIsOpen] = useState(false);
    const handleToggle = () => setIsOpen((prev) => !prev);

    const { 
        searchTerms, 
        setSearchTerms, 
        searchQuery, 
        setSearchQuery,
        turbineId,
        setTurbineId,
        powerPlantId,
        setPowerPlantId,
        drilldownFilters,
        setDrilldownFilters,
        componentFilters,
        setComponentFilters,
    } = useFilter();

    // Load power plants and turbines from DB
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);

                const [plants, dbTurbines] = await Promise.all([
                    plantStorage.getAll(),
                    turbineStorage.getAll(),
                ]);

                setPowerPlants(plants.map((p) => ({ id: p.id, name: p.name })));
                setTurbines(dbTurbines.map((t) => ({ id: t.id, name: t.id })));
            } catch (e) {
                console.error("Error loading filter data:", e);
                setError(e instanceof Error ? e.message : "Failed to load filter data");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Sync local filter state with context when filter changes
    const handleFilterChange = (next: FilterState) => {
        setFilters(next);
        setTurbineId(next.turbineId);
        setPowerPlantId(next.powerPlantId);
    };

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
        // Remove from search terms
        setSearchTerms(searchTerms.filter((t) => t !== term));
        
        // Check if this is a drilldown filter (hours/trips/starts with operator)
        // Pattern: (hours|trips|starts)(>=|<=|>|<|=)(\d+)
        const drilldownPattern = /^(hours|trips|starts)(>=|<=|>|<|=)(\d+(?:\.\d+)?)$/i;
        const match = term.match(drilldownPattern);
        
        if (match) {
            const [, filterKey, operatorStr, valueStr] = match;
            const key = filterKey.toLowerCase() as "hours" | "trips" | "starts";
            
            // Convert search operator to drilldown operator
            let drilldownOp: ">" | "<" | "=" | "≥" | "≤" = "=";
            if (operatorStr === ">") drilldownOp = ">";
            else if (operatorStr === "<") drilldownOp = "<";
            else if (operatorStr === "=") drilldownOp = "=";
            else if (operatorStr === ">=") drilldownOp = "≥";
            else if (operatorStr === "<=") drilldownOp = "≤";
            
            // Check if the current drilldown filter matches this term
            const currentFilter = drilldownFilters[key];
            if (currentFilter?.enabled && 
                currentFilter.operator === drilldownOp && 
                currentFilter.value === valueStr) {
                // Disable the matching drilldown filter
                setDrilldownFilters(prev => ({
                    ...prev,
                    [key]: null,
                }));
            }
        }
    };

    const removeComponentFilter = (componentType: string) => {
        setComponentFilters(prev => {
            const newSet = new Set(prev);
            newSet.delete(componentType);
            return newSet;
        });
    };

    return (
        <div className="sticky top-0 z-50 border-b bg-white/70 p-2 dark:bg-zinc-900/70">
            <div className="mx-auto max-w-6xl">
                <FilterBar
                    powerPlants={powerPlants}
                    turbines={turbines}
                    value={fitlers}
                    onChange={handleFilterChange}
                    onDrilldown={handleToggle}
                    isOpen={isOpen}
                    onAddFilter={() => alert("Feature Coming Soon...")}
                />

                {isOpen && (
                    <div id="drilldown-panel" className="mt-3">
                        <DrilldownCard onClose={() => setIsOpen(false)} />
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
                    {(searchTerms.length > 0 || componentFilters.size > 0) && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {/* Search term badges */}
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
                            {/* Component filter badges */}
                            {Array.from(componentFilters)
                                .filter(componentType => componentType !== "All") // Don't show "All" as a badge
                                .map((componentType) => (
                                    <Badge
                                        key={componentType}
                                        variant="secondary"
                                        className="flex items-center gap-1.5 rounded-xl px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                    >
                                        <span>{componentType}</span>
                                        <button
                                            onClick={() => removeComponentFilter(componentType)}
                                            className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                                            aria-label={`Remove ${componentType} filter`}
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