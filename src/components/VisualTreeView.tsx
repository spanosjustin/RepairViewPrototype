"use client";

import * as React from "react";
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
  // Group by component first
  const componentMap = new Map<string, InventoryItem[]>();
  
  items.forEach(item => {
    const componentName = item.component;
    if (!componentMap.has(componentName)) {
      componentMap.set(componentName, []);
    }
    componentMap.get(componentName)!.push(item);
  });

  // Create component nodes
  const components: ComponentNode[] = Array.from(componentMap.entries()).map(([componentName, pieces]) => ({
    id: `component-${componentName}`,
    name: componentName,
    pieces: pieces.map(piece => ({
      id: `piece-${piece.sn}`,
      item: piece
    }))
  }));

  // For now, create a single turbine with all components
  // In a real app, you'd group by actual turbine IDs
  return [{
    id: "turbine-1",
    name: "Turbine",
    components
  }];
}

interface TurbineBoxProps {
  turbine: TurbineNode;
  onSelectPiece?: (item: InventoryItem) => void;
  onSelectComponent?: (componentName: string, pieces: InventoryItem[]) => void;
  colorSettings?: any[];
}

function TurbineBox({ turbine, onSelectPiece, onSelectComponent, colorSettings = [] }: TurbineBoxProps) {
  return (
    <div className="relative">
      {/* Turbine Box - Top Level */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-200 rounded-lg px-6 py-4 min-w-[120px] text-center">
          <div className="font-medium text-gray-800">{turbine.name}</div>
        </div>
      </div>

      {/* Components and Pieces Container */}
      <div className="flex justify-center">
        {turbine.components.map((component, index) => (
          <div key={component.id} className="flex flex-col items-center mx-8 group relative">
            {/* Background highlight for the entire column */}
            <div className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mx-4 -my-2 px-4 py-2"></div>
            
            {/* Component Box */}
            <div 
              className="bg-gray-200 transform -skew-x-12 rounded px-4 py-3 min-w-[100px] text-center cursor-pointer hover:bg-gray-300 transition-colors mb-6 relative z-10"
              onClick={() => onSelectComponent?.(component.name, component.pieces.map(p => p.item))}
            >
              <div className="font-medium text-gray-800 text-sm transform skew-x-12">{component.name}</div>
            </div>

            {/* Pieces under this component */}
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
                    className={`rounded-full px-4 py-2 min-w-[80px] text-center cursor-pointer transition-colors ${hoverClasses}`}
                    onClick={() => onSelectPiece?.(piece.item)}
                  >
                    <div className="text-xs font-medium">
                      {piece.item.sn}
                    </div>
                    <div className="text-xs opacity-75">
                      {piece.item.pn}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Connecting Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: -1 }}>
        {turbine.components.map((component, componentIndex) => {
          const turbineCenterX = 50; // 50% of container width
          const componentCenterX = 50 + (componentIndex - (turbine.components.length - 1) / 2) * 25; // Spread components more
          
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
              
              {/* Line from Component to Pieces */}
              {component.pieces.map((piece, pieceIndex) => (
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
    </div>
  );
}

export default function VisualTreeView({ items, onSelectPiece, onSelectComponent }: VisualTreeViewProps) {
  const treeData = React.useMemo(() => buildTreeData(items), [items]);
  const { data: colorSettings = [] } = useStatusColors();

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
          />
        ))}
      </div>
    </div>
  );
}
