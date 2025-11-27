"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type FilterContextType = {
    searchTerms: string[];
    setSearchTerms: (terms: string[]) => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [searchTerms, setSearchTerms] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    return (
        <FilterContext.Provider value={{ searchTerms, setSearchTerms, searchQuery, setSearchQuery }}>
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

