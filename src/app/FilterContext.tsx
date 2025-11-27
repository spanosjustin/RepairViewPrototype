"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type DrilldownFilter = {
    enabled: boolean;
    operator: ">" | "<" | "=" | "≥" | "≤";
    value: string;
} | null;

type DrilldownFilters = {
    hours: DrilldownFilter;
    trips: DrilldownFilter;
    starts: DrilldownFilter;
};

type FilterContextType = {
    searchTerms: string[];
    setSearchTerms: (terms: string[]) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    turbineId: string | null;
    setTurbineId: (id: string | null) => void;
    powerPlantId: string | null;
    setPowerPlantId: (id: string | null) => void;
    drilldownFilters: DrilldownFilters;
    setDrilldownFilters: (filters: DrilldownFilters | ((prev: DrilldownFilters) => DrilldownFilters)) => void;
    componentFilters: Set<string>;
    setComponentFilters: (filters: Set<string> | ((prev: Set<string>) => Set<string>)) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [turbineId, setTurbineId] = useState<string | null>(null);
    const [powerPlantId, setPowerPlantId] = useState<string | null>(null);
    const [drilldownFilters, setDrilldownFilters] = useState<DrilldownFilters>({
        hours: null,
        trips: null,
        starts: null,
    });
    const [componentFilters, setComponentFilters] = useState<Set<string>>(new Set());

    return (
        <FilterContext.Provider value={{ 
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
        }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error("useFilter must be used within a FilterProvider");
    }
    return context;
}

