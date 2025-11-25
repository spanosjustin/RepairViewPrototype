"use client";

import * as React from "react";
import { ChevronDown, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/inventory/types";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getTone, getColorName, getBadgeClasses } from "@/lib/settings/colorMapper";

// Types for the tree structure
type TurbineNode = {
  id: string;
  name: string;
  components: ComponentNode[];
};

type ComponentNode = {
  id: string;
  name: string;
  pieces: PieceNode[];
};

type PieceNode = {
  id: string;
  item: InventoryItem;
};

interface VisualTreeViewProps {
  items: InventoryItem[];
  onSelectPiece?: (item: InventoryItem) => void;
  onSelectComponent?: (componentName: string, pieces: InventoryItem[]) => void;
}

// Transform flat inventory data into hierarchical tree structure
function buildTreeData(items: InventoryItem[]): TurbineNode[] {
  // Group by turbine first, then by component
  const turbineMap = new Map<string, Map<string, InventoryItem[]>>();
  
  items.forEach(item => {
    const turbineName = item.turbine || "Unknown Turbine";
    const componentName = item.component;
    
    if (!turbineMap.has(turbineName)) {
      turbineMap.set(turbineName, new Map());
    }
    
    const componentMap = turbineMap.get(turbineName)!;
    if (!componentMap.has(componentName)) {
      componentMap.set(componentName, []);
    }
    
    componentMap.get(componentName)!.push(item);
  });

  // Create turbine nodes with their components
  const turbines: TurbineNode[] = Array.from(turbineMap.entries()).map(([turbineName, componentMap]) => {
    const components: ComponentNode[] = Array.from(componentMap.entries()).map(([componentName, pieces]) => ({
      id: `component-${turbineName}-${componentName}`,
      name: componentName,
      pieces: pieces.map(piece => ({
        id: `piece-${piece.sn}`,
        item: piece
      }))
    }));

    return {
      id: `turbine-${turbineName}`,
      name: turbineName,
      components
    };
  });

  return turbines;
}

interface TurbineBoxProps {
  turbine: TurbineNode;
  onSelectPiece?: (item: InventoryItem) => void;
  onSelectComponent?: (componentName: string, pieces: InventoryItem[]) => void;
  colorSettings?: any[];
  isExpanded: boolean;
  onToggle: () => void;
}

function TurbineBox({ turbine, onSelectPiece, onSelectComponent, colorSettings = [], isExpanded, onToggle }: TurbineBoxProps) {
  const [expandedComponents, setExpandedComponents] = React.useState<Set<string>>(
    new Set(turbine.components.map(c => c.id))
  );
  
  // Pagination state for components
  const componentsPerPage = 5;
  const [currentComponentPage, setCurrentComponentPage] = React.useState(0);
  const totalComponentPages = Math.ceil(turbine.components.length / componentsPerPage);
  const startComponentIndex = currentComponentPage * componentsPerPage;
  const endComponentIndex = startComponentIndex + componentsPerPage;
  const visibleComponents = turbine.components.slice(startComponentIndex, endComponentIndex);
  

  const toggleComponent = (componentId: string) => {
    setExpandedComponents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(componentId)) {
        newSet.delete(componentId);
      } else {
        newSet.add(componentId);
      }
      return newSet;
    });
  };

  const goToPreviousComponents = () => {
    setCurrentComponentPage(prev => Math.max(0, prev - 1));
  };

  const goToNextComponents = () => {
    setCurrentComponentPage(prev => Math.min(totalComponentPages - 1, prev + 1));
  };

  return (
    <div className="relative mb-8">
      {/* Turbine Box - Top Level */}
      <div className="flex justify-center items-center gap-2 mb-4">
        <div className="bg-gray-200 rounded-lg px-6 py-4 min-w-[120px] text-center">
          <div className="font-medium text-gray-800">{turbine.name}</div>
        </div>
        <button
          onClick={onToggle}
          className="bg-gray-200 hover:bg-gray-300 rounded-lg p-2 transition-colors flex items-center justify-center"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Components and Pieces Container - Only show if expanded */}
      {isExpanded && (
        <div className="space-y-4">
          {/* Component Navigation */}
          {turbine.components.length > componentsPerPage && (
            <div className="flex items-center justify-center gap-4 mb-4">
              <button
                onClick={goToPreviousComponents}
                disabled={currentComponentPage === 0}
                className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-2 transition-colors flex items-center justify-center"
                aria-label="Previous components"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="text-sm text-gray-600">
                Showing {startComponentIndex + 1}-{Math.min(endComponentIndex, turbine.components.length)} of {turbine.components.length} components
              </div>
              <button
                onClick={goToNextComponents}
                disabled={currentComponentPage >= totalComponentPages - 1}
                className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg p-2 transition-colors flex items-center justify-center"
                aria-label="Next components"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          )}
          
          <div className="flex justify-center">
            {visibleComponents.map((component, index) => {
              const actualIndex = startComponentIndex + index;
            const isComponentExpanded = expandedComponents.has(component.id);
            
            return (
              <div key={component.id} className="flex flex-col items-center mx-8 group relative">
                {/* Background highlight for the entire column */}
                <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mx-4 -my-2 px-4 py-2"></div>
                
                {/* Component Box */}
                <div className="flex flex-col items-center mb-6 relative z-10">
                  <div 
                    className="bg-gray-200 transform -skew-x-12 rounded px-4 py-3 min-w-[100px] text-center cursor-pointer hover:bg-gray-300 transition-colors flex items-center gap-2 justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComponent(component.id);
                    }}
                  >
                    {isComponentExpanded ? (
                      <ChevronDown className="w-3 h-3 text-gray-600 transform skew-x-12" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-gray-600 transform skew-x-12" />
                    )}
                    <div 
                      className="font-medium text-gray-800 text-sm transform skew-x-12"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComponent?.(component.name, component.pieces.map(p => p.item));
                      }}
                    >
                      {component.name}
                    </div>
                  </div>
                </div>

                {/* Pieces under this component - Only show if component is expanded */}
                {isComponentExpanded && (
                  <div className="flex flex-col items-center space-y-2 relative z-10">
                    {component.pieces.map((piece) => {
                      const statusTone = getTone(piece.item.status || "", 'status', colorSettings);
                      const statusColor = getColorName(piece.item.status || "", 'status', colorSettings);
                      const badgeClasses = getBadgeClasses(statusTone, statusColor);
                      // Add hover effect
                      const hoverClasses = badgeClasses.replace(/hover:[^\s]+/g, '').trim() + ' hover:opacity-80';

                      return (
                        <div
                          key={piece.id}
                          className={`rounded-full px-4 py-2 min-w-[80px] text-center cursor-pointer transition-colors flex flex-col gap-0.5 ${hoverClasses}`}
                          onClick={() => onSelectPiece?.(piece.item)}
                        >
                          <div className="text-xs font-medium leading-tight">
                            {piece.item.sn}
                          </div>
                          <div className="text-xs opacity-75 leading-tight">
                            {piece.item.pn}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Connecting Lines - Only show if expanded */}
      {isExpanded && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
          {visibleComponents.map((component, visibleIndex) => {
            const componentIndex = startComponentIndex + visibleIndex;
            const turbineCenterX = 50; // 50% of container width
            const componentCenterX = 50 + (visibleIndex - (visibleComponents.length - 1) / 2) * 25; // Spread components more
            const isComponentExpanded = expandedComponents.has(component.id);
            
            return (
              <g key={`lines-${component.id}`}>
                {/* Line from Turbine to Component */}
                <line
                  x1={`${turbineCenterX}%`}
                  y1="25%"
                  x2={`${componentCenterX}%`}
                  y2="45%"
                  stroke="black"
                  strokeWidth="2"
                />
                
                {/* Line from Component to Pieces - Only show if component is expanded, show all pieces */}
                {isComponentExpanded && component.pieces.map((piece, pieceIndex) => (
                  <line
                    key={`line-${piece.id}`}
                    x1={`${componentCenterX}%`}
                    y1="55%"
                    x2={`${componentCenterX}%`}
                    y2={`${65 + pieceIndex * 12}%`}
                    stroke="black"
                    strokeWidth="2"
                  />
                ))}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

export default function VisualTreeView({ items, onSelectPiece, onSelectComponent }: VisualTreeViewProps) {
  const treeData = React.useMemo(() => buildTreeData(items), [items]);
  const { data: colorSettings = [] } = useStatusColors();
  
  // Initialize expanded nodes with all turbine IDs
  const [expandedTurbines, setExpandedTurbines] = React.useState<Set<string>>(() => {
    return new Set(treeData.map(turbine => turbine.id));
  });
  
  // Update expanded nodes when tree data changes
  React.useEffect(() => {
    setExpandedTurbines(prev => {
      const newSet = new Set(prev);
      treeData.forEach(turbine => {
        if (!newSet.has(turbine.id)) {
          newSet.add(turbine.id);
        }
      });
      return newSet;
    });
  }, [treeData]);

  const toggleTurbine = (turbineId: string) => {
    setExpandedTurbines(prev => {
      const newSet = new Set(prev);
      if (newSet.has(turbineId)) {
        newSet.delete(turbineId);
      } else {
        newSet.add(turbineId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-8 min-h-[500px] overflow-auto">
      <div className="w-full max-w-6xl mx-auto">
        {treeData.map(turbine => (
          <TurbineBox
            key={turbine.id}
            turbine={turbine}
            onSelectPiece={onSelectPiece}
            onSelectComponent={onSelectComponent}
            colorSettings={colorSettings}
            isExpanded={expandedTurbines.has(turbine.id)}
            onToggle={() => toggleTurbine(turbine.id)}
          />
        ))}
      </div>
    </div>
  );
}
