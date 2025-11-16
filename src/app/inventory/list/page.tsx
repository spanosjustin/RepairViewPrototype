// src/app/inventory/page.tsx
"use client";

import * as React from "react";
import InventoryMatrix from "@/components/inventory/InventoryMatrix";
import { MOCK_INVENTORY } from "@/lib/inventory/mock";
import type { InventoryItem } from "@/lib/inventory/types";

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

// ← import your card
import PieceInfoCard from "@/components/inventory/PieceInfoCard";
import ComponentInfoCard from "@/components/inventory/ComponentInfoCard";
import TreeView from "@/components/TreeView";
import VisualTreeView from "@/components/VisualTreeView";

type ViewMode = "pieces" | "components" | "turbines" | "tree";

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
  const [viewMode, setViewMode] = React.useState<ViewMode>("pieces");
  const [pieces, setPieces] = React.useState<any[]>([]);
  const [components, setComponents] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 50;

  // Generate pieces based on components (12 pieces per component)
  React.useEffect(() => {
    if (components.length > 0) {
      const generatedPieces = generatePiecesForComponents(components);
      setPieces(generatedPieces);
    } else {
      // Fallback to API or mock data if no components available
      const fetchPieces = async () => {
        try {
          const response = await fetch('/api/pieces');
          if (response.ok) {
            const data = await response.json();
            setPieces(data);
          } else {
            // Fallback to mock data if API fails
            setPieces(MOCK_INVENTORY);
          }
        } catch (error) {
          // Fallback to mock data if API fails
          setPieces(MOCK_INVENTORY);
        }
      };

      fetchPieces();
    }
  }, [components]);

  // Fetch components from database
  React.useEffect(() => {
    const fetchComponents = async () => {
      try {
        const response = await fetch('/api/components');
        if (response.ok) {
          const data = await response.json();
          setComponents(data);
        } else {
          // Fallback to mock data if API fails
          setComponents(MOCK_INVENTORY);
        }
      } catch (error) {
        // Fallback to mock data if API fails
        setComponents(MOCK_INVENTORY);
      } finally {
        setLoading(false);
      }
    };

    fetchComponents();
  }, []);

  const componentStats = React.useMemo(
    () => buildComponentStatsFromMock(components),
    [components]
  );

  // Reset page when switching view modes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  // Pagination logic - only apply pagination to pieces and components views
  const currentData = viewMode === "pieces" ? pieces : 
                     viewMode === "components" ? componentStats : 
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

  // ---------- Piece Details modal state ----------
  const [pieceOpen, setPieceOpen] = React.useState(false);
  const [selectedPiece, setSelectedPiece] = React.useState<any | null>(null);

  const openPieceCard = React.useCallback((item: any) => {
    setSelectedPiece(item);
    setPieceOpen(true);
  }, []);

  // ---------- Component Details modal state ----------
  const [componentOpen, setComponentOpen] = React.useState(false);
  const [selectedComponent, setSelectedComponent] = React.useState<any | null>(null);

  const openComponentCard = React.useCallback((item: any) => {
    setSelectedComponent(item);
    setComponentOpen(true);
  }, []);

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
                <SelectItem value="turbines">Turbines</SelectItem>
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
        ) : viewMode === "turbines" ? (
          /* Turbine View (Tree View) */
          <div className="p-4">
            <TreeView
              items={pieces}
              onSelectPiece={openPieceCard}
              onSelectComponent={openComponentCard}
            />
          </div>
        ) : (
          /* Visual Tree View */
          <div className="p-4">
            <VisualTreeView
              items={pieces}
              onSelectPiece={openPieceCard}
              onSelectComponent={openComponentCard}
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
                <PieceInfoCard item={selectedPiece} />
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
                <ComponentInfoCard item={selectedComponent} />
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
