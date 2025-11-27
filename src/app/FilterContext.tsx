"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type FilterContextType = {
    searchTerms: string[];
    setSearchTerms: (terms: string[]) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    turbineId: string | null;
    setTurbineId: (id: string | null) => void;
    powerPlantId: string | null;
    setPowerPlantId: (id: string | null) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [turbineId, setTurbineId] = useState<string | null>(null);
    const [powerPlantId, setPowerPlantId] = useState<string | null>(null);

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

