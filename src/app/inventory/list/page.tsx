// src/app/inventory/page.tsx
"use client";

import * as React from "react";
import InventoryMatrix from "@/components/inventory/InventoryMatrix";
import { MOCK_INVENTORY } from "@/lib/inventory/mock";
import type { InventoryItem } from "@/lib/inventory/types";
import { MOCK_TURBINES } from "@/lib/matrix/mock";
import { useFilter } from "@/app/FilterContext";

// shadcn/ui dialog (modal) to show the card
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ← import your card
import PieceInfoCard from "@/components/inventory/PieceInfoCard";
import ComponentInfoCard from "@/components/inventory/ComponentInfoCard";
import TreeView from "@/components/TreeView";
import VisualTreeView from "@/components/VisualTreeView";
import { piecesStorage, componentsStorage, type Component } from "@/lib/storage/indexedDB";
import { getMockRepairEvents } from "@/lib/inventory/mockRepairEvents";

type ViewMode = "pieces" | "components" | "list" | "tree";

type ComponentRow = {
  componentType: string;
  componentName: string;
  hours: number | string;
  trips: number | string;
  starts: number | string;
  status: string;
  state: string;
  turbine: string;
  id?: string | number;
};

type SortableColumn = keyof ComponentRow;
type SortDirection = "asc" | "desc" | null;

// Sortable columns for pieces
type SortablePieceColumn = "pn" | "piece" | "sn" | "hours" | "trips" | "starts" | "status" | "state" | "turbine" | "component" | "componentType";

function buildComponentStatsFromMock(mock: any[]): ComponentRow[] {
  return (mock ?? []).map((it) => ({
    componentType: it.componentType ?? it.type ?? "—",
    componentName: it.componentName ?? it.name ?? it.title ?? "—",
    hours: it.hours ?? it.stats?.hours ?? "—",
    trips: it.trips ?? it.stats?.trips ?? "—",
    starts: it.starts ?? it.stats?.starts ?? "—",
    status: it.status ?? it.health ?? "—",
    state: it.state ?? it.condition ?? "—",
    turbine: it.turbine ?? it.turbineName ?? it.turbine_name ?? "—",
    id: it.id ?? it.sn ?? it.name ?? undefined,
  }));
}

// Function to aggregate pieces into component stats
function aggregatePiecesIntoComponentStats(pieces: InventoryItem[]): ComponentRow[] {
  if (!pieces || pieces.length === 0) {
    return [];
  }

  // Group pieces by component name
  const componentMap = new Map<string, InventoryItem[]>();
  
  pieces.forEach((piece) => {
    const componentName = piece.component || "";
    if (!componentName) return;
    
    if (!componentMap.has(componentName)) {
      componentMap.set(componentName, []);
    }
    componentMap.get(componentName)!.push(piece);
  });

  // Aggregate stats for each component
  const componentStats: ComponentRow[] = Array.from(componentMap.entries()).map(([componentName, componentPieces]) => {
    if (componentPieces.length === 0) {
      return {
        componentName,
        componentType: "—",
        hours: "—",
        trips: "—",
        starts: "—",
        status: "—",
        state: "—",
        turbine: "—",
      };
    }

    // Get metadata from first piece
    const firstPiece = componentPieces[0];
    const componentType = firstPiece.componentType || "—";
    const turbine = firstPiece.turbine || "—";

    // Aggregate numeric values (average)
    const validHours = componentPieces
      .map(p => typeof p.hours === 'number' ? p.hours : null)
      .filter((h): h is number => h !== null);
    const validTrips = componentPieces
      .map(p => typeof p.trips === 'number' ? p.trips : null)
      .filter((t): t is number => t !== null);
    const validStarts = componentPieces
      .map(p => typeof p.starts === 'number' ? p.starts : null)
      .filter((s): s is number => s !== null);

    const avgHours = validHours.length > 0 
      ? Math.round(validHours.reduce((sum, h) => sum + h, 0) / validHours.length)
      : "—";
    const avgTrips = validTrips.length > 0
      ? Math.round(validTrips.reduce((sum, t) => sum + t, 0) / validTrips.length)
      : "—";
    const avgStarts = validStarts.length > 0
      ? Math.round(validStarts.reduce((sum, s) => sum + s, 0) / validStarts.length)
      : "—";

    // Determine status: use worst status if multiple pieces have different statuses
    // Priority: Replace Now > Replace Soon > Degraded > Monitor > Unknown > Spare > OK
    const statusPriority: Record<string, number> = {
      "Replace Now": 7,
      "Replace Soon": 6,
      "Degraded": 5,
      "Monitor": 4,
      "Unknown": 3,
      "Spare": 2,
      "OK": 1,
    };
    
    const statuses = componentPieces
      .map(p => p.status)
      .filter((s): s is InventoryItem['status'] => !!s);
    
    let status = "—";
    if (statuses.length > 0) {
      status = statuses.reduce((worst, current) => {
        const worstPriority = statusPriority[worst] || 0;
        const currentPriority = statusPriority[current] || 0;
        return currentPriority > worstPriority ? current : worst;
      }, statuses[0]);
    }

    // Determine state: use most common state, or worst case
    const stateCounts = new Map<string, number>();
    componentPieces.forEach(piece => {
      if (piece.state) {
        stateCounts.set(piece.state, (stateCounts.get(piece.state) || 0) + 1);
      }
    });
    
    let state = "—";
    if (stateCounts.size > 0) {
      // Find most common state
      let maxCount = 0;
      stateCounts.forEach((count, stateValue) => {
        if (count > maxCount) {
          maxCount = count;
          state = stateValue;
        }
      });
    }

    return {
      componentName,
      componentType,
      hours: avgHours,
      trips: avgTrips,
      starts: avgStarts,
      status,
      state,
      turbine,
      id: componentName, // Use component name as ID
    };
  });

  return componentStats;
}

// Function to merge database components with aggregated piece stats
function mergeComponentsWithPieceStats(
  pieces: InventoryItem[],
  dbComponents: Component[]
): ComponentRow[] {
  // First, aggregate stats from pieces
  const aggregatedStats = aggregatePiecesIntoComponentStats(pieces);
  
  // Create a map of database components by name for quick lookup
  const dbComponentMap = new Map<string, Component>();
  dbComponents.forEach(comp => {
    const name = comp.name || "";
    if (name) {
      dbComponentMap.set(name, comp);
    }
  });
  
  // Merge: use database component data for component-level fields,
  // but keep aggregated status/state from pieces
  const mergedStats: ComponentRow[] = aggregatedStats.map(aggregated => {
    const dbComponent = dbComponentMap.get(aggregated.componentName);
    
    if (dbComponent) {
      // Component exists in database - use its data for component-level fields
      return {
        componentName: dbComponent.name || aggregated.componentName,
        componentType: dbComponent.type || dbComponent.componentType || aggregated.componentType,
        hours: dbComponent.hours !== undefined && dbComponent.hours !== null 
          ? dbComponent.hours 
          : aggregated.hours,
        trips: dbComponent.trips !== undefined && dbComponent.trips !== null
          ? dbComponent.trips
          : aggregated.trips,
        starts: dbComponent.starts !== undefined && dbComponent.starts !== null
          ? dbComponent.starts
          : aggregated.starts,
        status: aggregated.status, // Always use aggregated status from pieces
        state: dbComponent.state || aggregated.state, // Use DB state if available, otherwise aggregated
        turbine: dbComponent.turbine || aggregated.turbine,
        id: dbComponent.id || aggregated.id || aggregated.componentName,
      };
    } else {
      // Component not in database - use aggregated data
      return aggregated;
    }
  });
  
  // Also include components from database that don't have any pieces yet
  dbComponents.forEach(dbComponent => {
    const name = dbComponent.name || "";
    if (name && !mergedStats.some(stat => stat.componentName === name)) {
      mergedStats.push({
        componentName: name,
        componentType: dbComponent.type || dbComponent.componentType || "—",
        hours: dbComponent.hours !== undefined && dbComponent.hours !== null ? dbComponent.hours : "—",
        trips: dbComponent.trips !== undefined && dbComponent.trips !== null ? dbComponent.trips : "—",
        starts: dbComponent.starts !== undefined && dbComponent.starts !== null ? dbComponent.starts : "—",
        status: "—", // No pieces, so no status
        state: dbComponent.state || "—",
        turbine: dbComponent.turbine || "—",
        id: dbComponent.id || name,
      });
    }
  });
  
  return mergedStats;
}

// Function to generate 12 pieces per component
function generatePiecesForComponents(components: any[]): InventoryItem[] {
  const generatedPieces: InventoryItem[] = [];
  
  components.forEach((component, componentIndex) => {
    const componentName = component.name || component.componentName || `Component-${componentIndex + 1}`;
    const componentType = component.type || component.componentType || "Unknown";
    const turbineName = component.turbine_name || component.turbine || "Unknown Turbine";
    
    // Generate 12 pieces for this component
    for (let i = 1; i <= 12; i++) {
      const pieceNumber = String(i).padStart(2, '0');
      const sn = `SN-${String(componentIndex + 1).padStart(3, '0')}-${pieceNumber}`;
      const pn = `PN-${componentType.replace(/\s+/g, '')}-${pieceNumber}`;
      
      // Generate realistic operational data with some variation
      const baseHours = Math.floor(Math.random() * 30000) + 1000;
      const baseTrips = Math.floor(Math.random() * 500) + 10;
      const baseStarts = Math.floor(Math.random() * 2000) + 50;
      
      // Determine status based on operational data
      let status: InventoryItem['status'] = 'OK';
      if (baseHours > 25000 || baseTrips > 400 || baseStarts > 1500) {
        status = 'Replace Soon';
      } else if (baseHours > 15000 || baseTrips > 200 || baseStarts > 800) {
        status = 'Monitor';
      }
      
      // Randomly assign some pieces as spares or out of service
      const stateRandom = Math.random();
      let state: InventoryItem['state'] = 'In Service';
      if (stateRandom < 0.1) {
        state = 'On Order';
        status = 'Spare';
      } else if (stateRandom < 0.15) {
        state = 'Out of Service';
        status = 'Unknown';
      } else if (stateRandom < 0.2) {
        state = 'Repair';
      } else if (stateRandom < 0.25) {
        state = 'Standby';
      }
      
      generatedPieces.push({
        id: `${componentIndex}-${i}`,
        sn,
        pn,
        hours: baseHours,
        trips: baseTrips,
        starts: baseStarts,
        status,
        state,
        component: componentName,
        componentType: componentType,
        turbine: turbineName,
        position: `Position ${pieceNumber}`,
      });
    }
  });
  
  return generatedPieces;
}

export default function InventoryListPage() {
  const { searchTerms, searchQuery } = useFilter();
  const [viewMode, setViewMode] = React.useState<ViewMode>("pieces");
  const [pieces, setPieces] = React.useState<any[]>([]);
  const [components, setComponents] = React.useState<any[]>([]);
  const [dbComponents, setDbComponents] = React.useState<Component[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Store updated notes by piece SN (serial number)
  const [updatedNotes, setUpdatedNotes] = React.useState<Record<string, string[]>>({});
  
  // Store updated repair events by piece SN (serial number)
  const [updatedRepairEvents, setUpdatedRepairEvents] = React.useState<Record<string, any[]>>({});
  
  // Create a mutable copy of MOCK_TURBINES for updates
  const [mutableTurbines, setMutableTurbines] = React.useState(() => {
    try {
      // Deep clone the mock turbines to make them mutable
      return MOCK_TURBINES.map(turbine => ({
        ...turbine,
        pieces: turbine.pieces.map(piece => ({
          ...piece,
          cells: piece.cells ? [...piece.cells] : [],
        })),
      }));
    } catch (error) {
      console.error("Error initializing mutableTurbines:", error);
      return [];
    }
  });
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 50;

  // Sorting state for components view
  const [sortColumn, setSortColumn] = React.useState<SortableColumn | undefined>(undefined);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);
  
  // Search state for components view
  const [componentSearchQuery, setComponentSearchQuery] = React.useState("");
  
  // Search state for pieces view
  const [pieceSearchQuery, setPieceSearchQuery] = React.useState("");
  
  // Sorting state for pieces view
  const [pieceSortColumn, setPieceSortColumn] = React.useState<SortablePieceColumn | undefined>(undefined);
  const [pieceSortDirection, setPieceSortDirection] = React.useState<SortDirection>(null);

  // Load pieces from database or generate them
  React.useEffect(() => {
    const loadPieces = async () => {
      try {
        // Try to load from database first
        const dbPieces = await piecesStorage.getAll();
        
        if (dbPieces.length > 0) {
          // Use pieces from database
          setPieces(dbPieces);
        } else if (components.length > 0) {
          // Generate pieces if we have components but no database pieces
          const generatedPieces = generatePiecesForComponents(components);
          // Save generated pieces to database
          await piecesStorage.saveAll(generatedPieces);
          setPieces(generatedPieces);
        } else {
          // Fallback to mock data
          setPieces(MOCK_INVENTORY);
        }
      } catch (error) {
        console.error('Error loading pieces:', error);
        // Fallback to mock data on error
        if (components.length > 0) {
          const generatedPieces = generatePiecesForComponents(components);
          setPieces(generatedPieces);
        } else {
          setPieces(MOCK_INVENTORY);
        }
      }
    };

    loadPieces();
  }, [components]);

  // Load components from database
  React.useEffect(() => {
    const loadComponents = async () => {
      try {
        const dbComps = await componentsStorage.getAll();
        setDbComponents(dbComps);
      } catch (error) {
        console.error('Error loading components from database:', error);
        setDbComponents([]);
      }
    };
    
    loadComponents();
  }, []);

  // Fetch components from database (or use mock data)
  React.useEffect(() => {
    // For now, use mock data directly since API routes don't exist
    // TODO: Uncomment when API routes are available
    /*
    const fetchComponents = async () => {
      try {
        const response = await fetch('/api/components');
        if (response.ok) {
          const data = await response.json();
          setComponents(data);
        } else {
          setComponents(MOCK_INVENTORY);
        }
      } catch (error) {
        setComponents(MOCK_INVENTORY);
      } finally {
        setLoading(false);
      }
    };
    fetchComponents();
    */
    
    // Use mock data directly
    setComponents(MOCK_INVENTORY);
    setLoading(false);
  }, []);

  // Build component stats by merging database components with aggregated piece stats
  const componentStats = React.useMemo(
    () => mergeComponentsWithPieceStats(pieces, dbComponents),
    [pieces, dbComponents]
  );

  // Filter component stats based on search query and FilterBarContainer search terms
  const filteredComponentStats = React.useMemo(() => {
    let filtered = componentStats;

    // Helper function to check if component matches search criteria
    const matchesSearch = (component: ComponentRow, searchText: string) => {
      const searchableText = [
        String(component.componentName || ""),
        String(component.componentType || ""),
        String(component.status || ""),
        String(component.state || ""),
        String(component.turbine || ""),
      ].join(" ").toLowerCase();
      
      return searchableText.includes(searchText.toLowerCase());
    };

    // Helper function to check if any piece in a component matches search criteria
    const hasMatchingPiece = (component: ComponentRow, searchText: string) => {
      const componentName = component.componentName || "";
      const matchingPieces = pieces.filter((piece) => {
        const pieceComponent = piece.component || piece.piece || piece.name || "";
        if (pieceComponent !== componentName) return false;
        
        const pieceSearchableText = [
          String(piece.pn || ""),
          String(piece.sn || piece.serial || ""),
          String(piece.component || piece.piece || piece.name || ""),
          String(piece.componentType || ""),
          String(piece.status || piece.health || ""),
          String(piece.state || piece.condition || ""),
          String(piece.turbine || ""),
          String(piece.position || ""),
        ].join(" ").toLowerCase();
        
        return pieceSearchableText.includes(searchText.toLowerCase());
      });
      
      return matchingPieces.length > 0;
    };

    // Apply FilterBarContainer search terms (all terms must match)
    if (searchTerms.length > 0) {
      filtered = filtered.filter((component) => {
        // Check if component matches all terms OR if any piece matches all terms
        const componentMatches = searchTerms.every(term => matchesSearch(component, term));
        const pieceMatches = searchTerms.every(term => hasMatchingPiece(component, term));
        return componentMatches || pieceMatches;
      });
    }

    // Apply FilterBarContainer current search query (real-time filtering)
    if (searchQuery.trim()) {
      filtered = filtered.filter((component) => {
        // Check if component matches OR if any piece matches
        return matchesSearch(component, searchQuery) || hasMatchingPiece(component, searchQuery);
      });
    }

    // Apply component search query
    if (componentSearchQuery.trim()) {
      const query = componentSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((component) => {
        // Check component fields
        const componentName = String(component.componentName || "").toLowerCase();
        const componentType = String(component.componentType || "").toLowerCase();
        const status = String(component.status || "").toLowerCase();
        const state = String(component.state || "").toLowerCase();
        const turbine = String(component.turbine || "").toLowerCase();
        
        const componentMatches = (
          componentName.includes(query) ||
          componentType.includes(query) ||
          status.includes(query) ||
          state.includes(query) ||
          turbine.includes(query)
        );
        
        // Also check if any piece matches
        return componentMatches || hasMatchingPiece(component, query);
      });
    }

    return filtered;
  }, [componentStats, componentSearchQuery, searchTerms, searchQuery, pieces]);

  // Sort component stats based on sortColumn and sortDirection
  const sortedComponentStats = React.useMemo(() => {
    if (!sortColumn || !sortDirection) {
      return filteredComponentStats;
    }

    return [...filteredComponentStats].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle numeric columns (hours, trips, starts)
      if (sortColumn === "hours" || sortColumn === "trips" || sortColumn === "starts") {
        let aNum = typeof aValue === "number" ? aValue : typeof aValue === "string" && aValue !== "—" ? parseFloat(aValue) : -Infinity;
        let bNum = typeof bValue === "number" ? bValue : typeof bValue === "string" && bValue !== "—" ? parseFloat(bValue) : -Infinity;
        
        if (isNaN(aNum)) aNum = -Infinity;
        if (isNaN(bNum)) bNum = -Infinity;
        
        if (sortDirection === "asc") {
          return aNum - bNum;
        } else {
          return bNum - aNum;
        }
      }

      // Handle string columns (componentType, componentName, status, state, turbine)
      const aStr = String(aValue || "—").toLowerCase();
      const bStr = String(bValue || "—").toLowerCase();

      if (sortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredComponentStats, sortColumn, sortDirection]);

  // Filter pieces based on search query and FilterBarContainer search terms
  const filteredPieces = React.useMemo(() => {
    let filtered = pieces;

    // Helper function to check if piece matches search criteria
    const matchesSearch = (piece: any, searchText: string) => {
      const searchableText = [
        String(piece.pn || ""),
        String(piece.sn || piece.serial || ""),
        String(piece.component || piece.piece || piece.name || ""),
        String(piece.componentType || ""),
        String(piece.status || piece.health || ""),
        String(piece.state || piece.condition || ""),
        String(piece.turbine || ""),
        String(piece.position || ""),
      ].join(" ").toLowerCase();
      
      return searchableText.includes(searchText.toLowerCase());
    };

    // Apply FilterBarContainer search terms (all terms must match)
    if (searchTerms.length > 0) {
      filtered = filtered.filter((piece) => {
        // All search terms must be found in the searchable text
        return searchTerms.every(term => matchesSearch(piece, term));
      });
    }

    // Apply FilterBarContainer current search query (real-time filtering)
    if (searchQuery.trim()) {
      filtered = filtered.filter((piece) => {
        return matchesSearch(piece, searchQuery);
      });
    }

    // Apply piece search query
    if (pieceSearchQuery.trim()) {
      const query = pieceSearchQuery.toLowerCase().trim();
      filtered = filtered.filter((piece) => {
        // Search across multiple fields
        const pn = String(piece.pn || "").toLowerCase();
        const sn = String(piece.sn || piece.serial || "").toLowerCase();
        const component = String(piece.component || piece.piece || piece.name || "").toLowerCase();
        const componentType = String(piece.componentType || "").toLowerCase();
        const status = String(piece.status || piece.health || "").toLowerCase();
        const state = String(piece.state || piece.condition || "").toLowerCase();
        const turbine = String(piece.turbine || "").toLowerCase();
        const position = String(piece.position || "").toLowerCase();
        
        return (
          pn.includes(query) ||
          sn.includes(query) ||
          component.includes(query) ||
          componentType.includes(query) ||
          status.includes(query) ||
          state.includes(query) ||
          turbine.includes(query) ||
          position.includes(query)
        );
      });
    }

    return filtered;
  }, [pieces, pieceSearchQuery, searchTerms, searchQuery]);

  // Sort pieces based on pieceSortColumn and pieceSortDirection
  const sortedPieces = React.useMemo(() => {
    if (!pieceSortColumn || !pieceSortDirection) {
      return filteredPieces;
    }

    return [...filteredPieces].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Map column names to piece properties
      switch (pieceSortColumn) {
        case "pn":
          aValue = a.pn ?? "—";
          bValue = b.pn ?? "—";
          break;
        case "piece":
          aValue = a.component ?? a.piece ?? a.name ?? "—";
          bValue = b.component ?? b.piece ?? b.name ?? "—";
          break;
        case "sn":
          aValue = a.sn ?? a.serial ?? "—";
          bValue = b.sn ?? b.serial ?? "—";
          break;
        case "hours":
          aValue = a.hours;
          bValue = b.hours;
          break;
        case "trips":
          aValue = a.trips;
          bValue = b.trips;
          break;
        case "starts":
          aValue = a.starts;
          bValue = b.starts;
          break;
        case "status":
          aValue = a.status ?? a.health ?? "—";
          bValue = b.status ?? b.health ?? "—";
          break;
        case "state":
          aValue = a.state ?? a.condition ?? "—";
          bValue = b.state ?? b.condition ?? "—";
          break;
        case "turbine":
          aValue = a.turbine ?? "—";
          bValue = b.turbine ?? "—";
          break;
        case "component":
          aValue = a.component ?? "—";
          bValue = b.component ?? "—";
          break;
        case "componentType":
          aValue = a.componentType ?? "—";
          bValue = b.componentType ?? "—";
          break;
        default:
          return 0;
      }

      // Handle numeric columns (hours, trips, starts)
      if (pieceSortColumn === "hours" || pieceSortColumn === "trips" || pieceSortColumn === "starts") {
        const aNum = typeof aValue === "number" ? aValue : typeof aValue === "string" && aValue !== "—" ? parseFloat(aValue) : -Infinity;
        const bNum = typeof bValue === "number" ? bValue : typeof bValue === "string" && bValue !== "—" ? parseFloat(bValue) : -Infinity;
        
        const aFinal = isNaN(aNum) ? -Infinity : aNum;
        const bFinal = isNaN(bNum) ? -Infinity : bNum;
        
        if (pieceSortDirection === "asc") {
          return aFinal - bFinal;
        } else {
          return bFinal - aFinal;
        }
      }

      // Handle string columns
      const aStr = String(aValue || "—").toLowerCase();
      const bStr = String(bValue || "—").toLowerCase();

      if (pieceSortDirection === "asc") {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [filteredPieces, pieceSortColumn, pieceSortDirection]);

  // Handle sort column click for components
  const handleSort = React.useCallback((column: SortableColumn) => {
    if (sortColumn === column) {
      // Toggle direction: asc -> desc -> null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortDirection(null);
        setSortColumn(undefined);
      }
    } else {
      // New column, start with ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  }, [sortColumn, sortDirection]);

  // Handle sort column click for pieces
  const handlePieceSort = React.useCallback((column: SortablePieceColumn) => {
    if (pieceSortColumn === column) {
      // Toggle direction: asc -> desc -> null
      if (pieceSortDirection === "asc") {
        setPieceSortDirection("desc");
      } else if (pieceSortDirection === "desc") {
        setPieceSortDirection(null);
        setPieceSortColumn(undefined);
      }
    } else {
      // New column, start with ascending
      setPieceSortColumn(column);
      setPieceSortDirection("asc");
    }
  }, [pieceSortColumn, pieceSortDirection]);

  // Reset page when switching view modes, sorting, or search
  React.useEffect(() => {
    setCurrentPage(1);
  }, [viewMode, sortColumn, sortDirection, pieceSortColumn, pieceSortDirection, componentSearchQuery, pieceSearchQuery, searchTerms, searchQuery]);

  // Pagination logic - only apply pagination to pieces and components views
  const currentData = viewMode === "pieces" ? sortedPieces : 
                     viewMode === "components" ? sortedComponentStats : 
                     pieces; // For turbines and tree views, use pieces data
  
  const shouldPaginate = viewMode === "pieces" || viewMode === "components";
  const totalPages = shouldPaginate ? Math.ceil(currentData.length / itemsPerPage) : 1;
  const startIndex = shouldPaginate ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = shouldPaginate ? startIndex + itemsPerPage : currentData.length;
  const paginatedData = shouldPaginate ? currentData.slice(startIndex, endIndex) : currentData;

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  // Helper function to find notes for a piece from matrix data
  const findNotesForPiece = React.useCallback((piece: any): string[] | null => {
    if (!piece) return null;
    
    const sn = piece.sn || "";
    const pieceId = sn || piece.id || String(piece.pn);
    
    // First, check if the piece has notes from the database
    if (piece.notes && Array.isArray(piece.notes) && piece.notes.length > 0) {
      return piece.notes.filter((n: any) => n && String(n).trim() !== "");
    }
    
    // Check if we have updated notes for this piece
    if (updatedNotes[pieceId]) {
      return updatedNotes[pieceId];
    }
    
    // Special case: SN-001-01 gets 3 notes
    if (sn === "SN-001-01") {
      return [
        "Initial installation completed on 2024-01-15. All clearances verified within specification.",
        "Routine inspection on 2024-06-20: Component performing within normal parameters. No anomalies detected.",
        "Last maintenance check on 2024-11-10: Thermal barrier coating intact. Operating hours tracking as expected."
      ];
    }
    
    const turbineId = piece.turbine || piece.turbineName || piece.turbine_name;
    const componentType = piece.componentType || piece.component || piece.type;
    
    if (!turbineId || !componentType) return null;
    
    // Find the matching turbine in matrix data (use mutable copy if available)
    if (!mutableTurbines || mutableTurbines.length === 0) {
      return null;
    }
    const turbine = mutableTurbines.find(t => t.id === turbineId);
    if (!turbine) return null;
    
    // Find the matching piece in the turbine's pieces array
    // The piece name in matrix data matches componentType
    const matrixPiece = turbine.pieces.find(p => {
      const pieceName = p.label; // e.g., "Liner Caps", "S1N", etc.
      return pieceName === componentType;
    });
    
    if (!matrixPiece) return null;
    
    // Extract notes from the piece cells (column 5 is notes)
    // Column order: piece | position | condition | setIn | setOut | notes
    if (!matrixPiece.cells || matrixPiece.cells.length < 6) {
      return null;
    }
    
    const notesValue = matrixPiece.cells[5]?.value;
    
    // Convert to string and check if it's not empty
    const notesString = notesValue ? String(notesValue) : "";
    
    // Return as array if notes exist, null otherwise
    return notesString && notesString.trim() ? [notesString] : null;
  }, [updatedNotes, mutableTurbines]);

  // ---------- Piece Details modal state ----------
  const [pieceOpen, setPieceOpen] = React.useState(false);
  const [selectedPiece, setSelectedPiece] = React.useState<any | null>(null);

  const openPieceCard = React.useCallback((item: any) => {
    // Enrich the piece with notes - prioritize database notes, then fall back to findNotesForPiece
    const notes = (item.notes && item.notes.length > 0) 
      ? item.notes 
      : findNotesForPiece(item);
    
    // Enrich the piece with repair events - prioritize database repair events, then updated state, then mock
    const pieceId = item.sn || item.id || String(item.pn);
    const repairEvents = (item.repairEvents && item.repairEvents.length > 0)
      ? item.repairEvents
      : (updatedRepairEvents[pieceId] || getMockRepairEvents(item));
    
    const enrichedPiece = {
      ...item,
      notes: notes,
      repairEvents: repairEvents.length > 0 ? repairEvents : null,
    };
    setSelectedPiece(enrichedPiece);
    setPieceOpen(true);
  }, [findNotesForPiece, updatedRepairEvents]);

  // Handle notes updates from PieceInfoCard
  const handleNotesUpdate = React.useCallback((pieceId: string, notes: string[]) => {
    // Store the updated notes (create new array to ensure reference change)
    setUpdatedNotes(prev => ({
      ...prev,
      [pieceId]: [...notes], // Create new array reference
    }));
    
    // Update the selected piece if it's the one being edited
    setSelectedPiece((prev: any) => {
      if (!prev) return prev;
      
      const currentPieceId = prev.sn || prev.id || String(prev.pn);
      
      if (currentPieceId === pieceId) {
        // Create new object with new notes array to trigger re-render
        return {
          ...prev,
          notes: [...notes], // Create new array reference
        };
      }
      
      // Also update the mutable turbines data (for matrix pieces with single notes)
      const turbineId = prev.turbine || prev.turbineName || prev.turbine_name;
      const componentType = prev.componentType || prev.component || prev.type;
      
      if (turbineId && componentType && pieceId !== "SN-001-01") {
        // Only update matrix data for pieces that come from matrix (not special cases like SN-001-01)
        setMutableTurbines(prevTurbines => prevTurbines.map(turbine => {
          if (turbine.id === turbineId) {
            return {
              ...turbine,
              pieces: turbine.pieces.map(piece => {
                const pieceName = piece.label;
                if (pieceName === componentType) {
                  // Update the notes cell (column 5)
                  // For matrix pieces, we typically have a single note, so use the first one
                  const updatedCells = [...piece.cells];
                  const notesString = notes.length > 0 ? notes[0] : "";
                  if (updatedCells[5]) {
                    updatedCells[5] = {
                      ...updatedCells[5],
                      value: notesString,
                      note: notesString || null,
                    };
                  }
                  return {
                    ...piece,
                    cells: updatedCells,
                  };
                }
                return piece;
              }),
            };
          }
          return turbine;
        }));
      }
      
      return prev;
    });
  }, []);

  // Handle repair events updates from PieceInfoCard
  const handleRepairEventsUpdate = React.useCallback((pieceId: string, repairEvents: any[]) => {
    // Store the updated repair events
    setUpdatedRepairEvents(prev => ({
      ...prev,
      [pieceId]: [...repairEvents], // Create new array reference
    }));
    
    // Update the selected piece if it's the one being edited
    setSelectedPiece((prev: any) => {
      if (!prev) return prev;
      
      const currentPieceId = prev.sn || prev.id || String(prev.pn);
      
      if (currentPieceId === pieceId) {
        // Create new object with new repair events array to trigger re-render
        return {
          ...prev,
          repairEvents: [...repairEvents], // Create new array reference
        };
      }
      
      return prev;
    });
  }, []);

  // ---------- Component Details modal state ----------
  const [componentOpen, setComponentOpen] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState<any | null>(null);
  const [componentPieces, setComponentPieces] = React.useState<InventoryItem[]>([]);

  const openComponentCard = React.useCallback(async (item: any) => {
    setSelectedComponent(item);
    setComponentOpen(true);
    
    // Fetch pieces for this component
    try {
      const componentName = item.componentName || item.name || item.component;
      if (componentName) {
        const piecesForComponent = pieces.filter(
          (p) => p.component === componentName
        );
        setComponentPieces(piecesForComponent);
      } else {
        setComponentPieces([]);
      }
    } catch (error) {
      console.error('Error loading pieces for component:', error);
      setComponentPieces([]);
    }
  }, [pieces]);

  // Wrapper for TreeView that looks up full component data from componentStats
  const handleTreeViewComponentSelect = React.useCallback((componentName: string, piecesForComponent: InventoryItem[]) => {
    // Find the full component data from componentStats
    const fullComponentData = componentStats.find(
      (comp) => comp.componentName === componentName
    );
    
    if (fullComponentData) {
      // Use the full component data from componentStats
      openComponentCard(fullComponentData);
    } else {
      // Fallback: aggregate stats from the pieces provided
      if (piecesForComponent.length === 0) {
        // No pieces available, create minimal component
        const fallbackComponent = {
          componentName: componentName,
          componentType: "—",
          hours: "—",
          trips: "—",
          starts: "—",
          status: "—",
          state: "—",
          turbine: "—",
        };
        openComponentCard(fallbackComponent);
        return;
      }

      // Aggregate stats from pieces
      const firstPiece = piecesForComponent[0];
      const componentType = firstPiece.componentType || "—";
      const turbine = firstPiece.turbine || "—";

      // Aggregate numeric values (average)
      const validHours = piecesForComponent
        .map(p => typeof p.hours === 'number' ? p.hours : null)
        .filter((h): h is number => h !== null);
      const validTrips = piecesForComponent
        .map(p => typeof p.trips === 'number' ? p.trips : null)
        .filter((t): t is number => t !== null);
      const validStarts = piecesForComponent
        .map(p => typeof p.starts === 'number' ? p.starts : null)
        .filter((s): s is number => s !== null);

      const avgHours = validHours.length > 0 
        ? Math.round(validHours.reduce((sum, h) => sum + h, 0) / validHours.length)
        : "—";
      const avgTrips = validTrips.length > 0
        ? Math.round(validTrips.reduce((sum, t) => sum + t, 0) / validTrips.length)
        : "—";
      const avgStarts = validStarts.length > 0
        ? Math.round(validStarts.reduce((sum, s) => sum + s, 0) / validStarts.length)
        : "—";

      // Determine status: use worst status
      const statusPriority: Record<string, number> = {
        "Replace Now": 7,
        "Replace Soon": 6,
        "Degraded": 5,
        "Monitor": 4,
        "Unknown": 3,
        "Spare": 2,
        "OK": 1,
      };
      
      const statuses = piecesForComponent
        .map(p => p.status)
        .filter((s): s is InventoryItem['status'] => !!s);
      
      let status = "—";
      if (statuses.length > 0) {
        status = statuses.reduce((worst, current) => {
          const worstPriority = statusPriority[worst] || 0;
          const currentPriority = statusPriority[current] || 0;
          return currentPriority > worstPriority ? current : worst;
        }, statuses[0]);
      }

      // Determine state: use most common state
      const stateCounts = new Map<string, number>();
      piecesForComponent.forEach(piece => {
        if (piece.state) {
          stateCounts.set(piece.state, (stateCounts.get(piece.state) || 0) + 1);
        }
      });
      
      let state = "—";
      if (stateCounts.size > 0) {
        let maxCount = 0;
        stateCounts.forEach((count, stateValue) => {
          if (count > maxCount) {
            maxCount = count;
            state = stateValue;
          }
        });
      }

      const fallbackComponent = {
        componentName: componentName,
        componentType: componentType,
        hours: avgHours,
        trips: avgTrips,
        starts: avgStarts,
        status: status,
        state: state,
        turbine: turbine,
      };
      openComponentCard(fallbackComponent);
    }
  }, [componentStats, openComponentCard]);

  // Handle piece added - refresh pieces from database
  const handlePieceAdded = React.useCallback(async () => {
    try {
      const dbPieces = await piecesStorage.getAll();
      setPieces(dbPieces);
      
      // Also refresh component pieces if dialog is open
      if (selectedComponent) {
        const componentName = selectedComponent.componentName || selectedComponent.name || selectedComponent.component;
        if (componentName) {
          const piecesForComponent = dbPieces.filter(
            (p) => p.component === componentName
          );
          setComponentPieces(piecesForComponent);
        }
      }
    } catch (error) {
      console.error('Error refreshing pieces:', error);
    }
  }, [selectedComponent]);

  // Handle piece updated - refresh pieces from database and update selected piece
  const handlePieceUpdated = React.useCallback(async () => {
    try {
      const dbPieces = await piecesStorage.getAll();
      setPieces(dbPieces);
      
      // Update selected piece if dialog is open
      if (selectedPiece) {
        const pieceId = selectedPiece.id || selectedPiece.sn || String(selectedPiece.pn);
        const updatedPiece = dbPieces.find(
          p => (p.id?.toString() === pieceId?.toString()) ||
               (p.sn === pieceId) ||
               (String(p.pn) === pieceId)
        );
        if (updatedPiece) {
          // Enrich with notes and repair events
          // Notes from database take priority, then fall back to findNotesForPiece
          const pieceId = updatedPiece.sn || updatedPiece.id || String(updatedPiece.pn);
          const notes = updatedPiece.notes && updatedPiece.notes.length > 0 
            ? updatedPiece.notes 
            : findNotesForPiece(updatedPiece);
          // Repair events from database take priority, then updated state, then mock
          const repairEvents = (updatedPiece.repairEvents && updatedPiece.repairEvents.length > 0)
            ? updatedPiece.repairEvents
            : (updatedRepairEvents[pieceId] || getMockRepairEvents(updatedPiece));
          setSelectedPiece({
            ...updatedPiece,
            notes: notes,
            repairEvents: repairEvents.length > 0 ? repairEvents : null,
          });
        }
      }
      
      // Also refresh component pieces if component dialog is open
      if (selectedComponent) {
        const componentName = selectedComponent.componentName || selectedComponent.name || selectedComponent.component;
        if (componentName) {
          const piecesForComponent = dbPieces.filter(
            (p) => p.component === componentName
          );
          setComponentPieces(piecesForComponent);
        }
      }
    } catch (error) {
      console.error('Error refreshing pieces:', error);
    }
  }, [selectedPiece, selectedComponent, findNotesForPiece]);

  // Handle component updated - refresh component data
  const handleComponentUpdated = React.useCallback(async () => {
    try {
      // Refresh components list from database
      const dbComps = await componentsStorage.getAll();
      setDbComponents(dbComps);
      
      // Update selected component if dialog is open
      if (selectedComponent?.id) {
        const updatedComponent = await componentsStorage.get(selectedComponent.id);
        if (updatedComponent) {
          setSelectedComponent({
            ...updatedComponent,
            componentName: updatedComponent.name,
            componentType: updatedComponent.type || updatedComponent.componentType,
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing component:', error);
    }
  }, [selectedComponent]);

  return (
    <div className="p-6 space-y-4">
      <div className="rounded-2xl bg-card p-4 border space-y-4">
        {/* Title bar */}
        <header className="relative flex items-center justify-center border-b border-border/60 pb-3">
          <h1 className="text-xl font-bold">Inventory</h1>

          {/* Right-side dropdown */}
          <div className="absolute right-0 inset-y-0 flex items-center pr-2">
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="h-9 w-[140px]" aria-label="View mode">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="pieces">Pieces</SelectItem>
                <SelectItem value="components">Components</SelectItem>
                <SelectItem value="list">List</SelectItem>
                <SelectItem value="tree">Tree</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* Content based on view mode */}
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading inventory from database...
          </div>
        ) : viewMode === "pieces" ? (
          /* Pieces Matrix View */
          <div className="space-y-4">
            <InventoryMatrix
              dataset="pieces"
              items={paginatedData}
              onSelectPiece={openPieceCard}
              sortColumn={pieceSortColumn}
              sortDirection={pieceSortDirection}
              onSort={handlePieceSort}
            />
            
            {/* Pagination Controls */}
            {shouldPaginate && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, currentData.length)} of {currentData.length} items
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === "components" ? (
          /* Components Matrix View */
          <div className="space-y-4">
            <InventoryMatrix
              dataset="components"
              componentStats={paginatedData}
              onSelectComponent={openComponentCard}
              sortColumn={sortColumn}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
            
            {/* Pagination Controls */}
            {shouldPaginate && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, currentData.length)} of {currentData.length} items
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {/* Show page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : viewMode === "list" ? (
          /* Turbine View (Tree View) */
          <div className="p-4">
            <TreeView
              items={pieces}
              onSelectPiece={openPieceCard}
              onSelectComponent={handleTreeViewComponentSelect}
            />
          </div>
        ) : (
          /* Visual Tree View */
          <div className="p-4">
            <VisualTreeView
              items={pieces}
              onSelectPiece={openPieceCard}
              onSelectComponent={handleTreeViewComponentSelect}
            />
          </div>
        )}
      </div>

      {/* Piece Details Modal */}
      <Dialog open={pieceOpen} onOpenChange={setPieceOpen}>
        <DialogContent
          className="
            p-0
            w-[95vw]
            max-w-[1100px]
            sm:max-w-[1100px]   /* override shadcn default */
            md:max-w-[1100px]
          "
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Piece Details</DialogTitle>
          </DialogHeader>

          {/* scrollable body so tall cards don't overflow the screen */}
          <div className="px-6 pb-6 max-h-[80vh] overflow-auto">
            {selectedPiece ? (
              <div className="w-full">
                <PieceInfoCard 
                  item={selectedPiece} 
                  onNotesUpdate={handleNotesUpdate}
                  onPieceUpdated={handlePieceUpdated}
                  onRepairEventsUpdate={handleRepairEventsUpdate}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No piece selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Component Details Modal */}
      <Dialog open={componentOpen} onOpenChange={setComponentOpen}>
        <DialogContent
          className="
            p-0
            w-[95vw]
            max-w-[1100px]
            sm:max-w-[1100px]   /* override shadcn default */
            md:max-w-[1100px]
          "
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Component Details</DialogTitle>
          </DialogHeader>

          {/* scrollable body so tall cards don't overflow the screen */}
          <div className="px-6 pb-6 max-h-[80vh] overflow-auto">
            {selectedComponent ? (
              <div className="w-full">
                <ComponentInfoCard 
                  item={selectedComponent} 
                  pieces={componentPieces}
                  allPieces={pieces}
                  onPieceAdded={handlePieceAdded}
                  onComponentUpdated={handleComponentUpdated}
                />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No component selected.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}