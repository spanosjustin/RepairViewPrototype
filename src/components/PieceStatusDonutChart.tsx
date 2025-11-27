"use client";

import * as React from "react";
import type { Turbine } from "@/lib/matrix/types";
import type { InventoryItem } from "@/lib/inventory/types";
import { useStatusColors } from "@/hooks/useStatusColors";
import { getColorName, getTone } from "@/lib/settings/colorMapper";
import { piecesStorage } from "@/lib/storage/indexedDB";
import { Button } from "@/components/ui/button";

interface PieceStatusDonutChartProps {
  turbines?: Turbine[];
  inventoryItems?: InventoryItem[];
  className?: string;
}

interface StatusCount {
  status: string;
  count: number;
  color: string;
}

/**
 * Map color name to hex value for SVG
 * Uses Tailwind 500 shade as the standard medium shade
 */
function getColorHex(colorName: string | undefined, tone: string): string {
  // If we have a color name, map it to hex
  if (colorName) {
    const colorMap: Record<string, string> = {
      // Reds
      red: "#ef4444",
      rose: "#f43f5e",
      pink: "#ec4899",
      // Oranges
      orange: "#f97316",
      amber: "#f59e0b",
      coral: "#f97316",
      // Yellows
      yellow: "#eab308",
      gold: "#eab308",
      cream: "#eab308",
      // Greens
      green: "#22c55e",
      emerald: "#10b981",
      lime: "#84cc16",
      // Blues
      blue: "#3b82f6",
      sky: "#0ea5e9",
      indigo: "#6366f1",
      // Purples
      purple: "#a855f7",
      violet: "#8b5cf6",
      fuchsia: "#d946ef",
      // Grays
      gray: "#6b7280",
      slate: "#64748b",
      stone: "#78716c",
    };
    
    return colorMap[colorName.toLowerCase()] || colorMap.gray;
  }
  
  // Fallback to tone-based defaults
  switch (tone) {
    case 'ok':
      return "#10b981"; // emerald-500
    case 'warn':
      return "#f59e0b"; // amber-500
    case 'bad':
      return "#f43f5e"; // rose-500
    case 'info':
      return "#0ea5e9"; // sky-500
    default:
      return "#6b7280"; // gray-500
  }
}

export default function PieceStatusDonutChart({ turbines, inventoryItems, className }: PieceStatusDonutChartProps) {
  const { data: colorSettings = [] } = useStatusColors();
  const [dbPieces, setDbPieces] = React.useState<InventoryItem[]>([]);
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);
  const [selectedStatuses, setSelectedStatuses] = React.useState<string[]>([]);

  // Load pieces from IndexedDB (same as inventory page)
  React.useEffect(() => {
    const loadPieces = async () => {
      try {
        const pieces = await piecesStorage.getAll();
        if (pieces.length > 0) {
          setDbPieces(pieces);
        }
      } catch (error) {
        console.error('Error loading pieces from database:', error);
      }
    };
    loadPieces();
  }, []);

  // Aggregate piece statuses from database pieces (preferred), then inventory items, then turbines
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Priority 1: Use pieces from IndexedDB (same as inventory page)
    if (dbPieces.length > 0) {
      dbPieces.forEach(item => {
        const status = item.status;
        if (status) {
          counts[status] = (counts[status] || 0) + 1;
        }
      });
    }
    // Priority 2: If inventory items are provided, use those
    else if (inventoryItems && inventoryItems.length > 0) {
      inventoryItems.forEach(item => {
        const status = item.status;
        if (status) {
          counts[status] = (counts[status] || 0) + 1;
        }
      });
    } 
    // Priority 3: Fall back to counting from turbines
    else if (turbines && turbines.length > 0) {
      turbines.forEach(turbine => {
        turbine.pieces.forEach(piece => {
          const condition = piece.cells[2]?.value as string; // condition is in the 3rd cell
          if (condition) {
            counts[condition] = (counts[condition] || 0) + 1;
          }
        });
      });
    }

    // Get colors from settings for each status
    return Object.entries(counts).map(([status, count]) => {
      const colorName = getColorName(status, 'status', colorSettings);
      const tone = getTone(status, 'status', colorSettings);
      const color = getColorHex(colorName, tone);
      
      return {
        status,
        count,
        color,
      };
    });
  }, [dbPieces, turbines, inventoryItems, colorSettings]);

  const totalPieces = statusCounts.reduce((sum, item) => sum + item.count, 0);

  // Calculate SVG path for donut chart
  const radius = 60;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;
  
  let currentOffset = 0;
  const segments = statusCounts.map((item) => {
    const percentage = item.count / totalPieces;
    const strokeDasharray = `${percentage * circumference} ${circumference}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += percentage * circumference;
    
    return {
      ...item,
      percentage: percentage * 100,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  if (totalPieces === 0) {
    return (
      <div className={`bg-gray-200 rounded-lg p-6 flex items-center justify-center ${className}`}>
        <p className="text-gray-500">No piece data available</p>
      </div>
    );
  }

  return (
    <div className={`bg-gray-200 rounded-lg p-6 h-full flex flex-col ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Piece Status Overview
      </h3>
      
      <div className="flex items-center justify-between flex-1 gap-12">
        {/* Chart */}
        <div className="w-1/2 flex flex-col items-center justify-center">
          <svg width="140" height="140" className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={strokeWidth}
            />
            
            {/* Status segments */}
            {segments.map((segment, index) => {
              const isSelected = selectedStatuses.includes(segment.status);
              const isHovered = hoveredStatus === segment.status;
              
              // If statuses are selected, only show selected ones
              let opacity: number;
              if (selectedStatuses.length > 0) {
                opacity = isSelected ? 1 : 0;
              } else {
                // Otherwise, use hover logic
                opacity = hoveredStatus === null ? 1 : isHovered ? 1 : 0.3;
              }
              
              return (
                <circle
                  key={segment.status}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  style={{ opacity }}
                  onMouseEnter={() => setHoveredStatus(segment.status)}
                  onMouseLeave={() => setHoveredStatus(null)}
                  onClick={() => {
                    // Toggle selection: if clicking a selected item, remove it; otherwise add it
                    setSelectedStatuses(prev => 
                      isSelected 
                        ? prev.filter(s => s !== segment.status)
                        : [...prev, segment.status]
                    );
                  }}
                />
              );
            })}
          </svg>
          
          {/* Total pieces text below chart */}
          <div className="mt-4 text-center">
            {(() => {
              // If statuses are selected, show combined count and percentage
              if (selectedStatuses.length > 0) {
                const selectedItems = statusCounts.filter(item => selectedStatuses.includes(item.status));
                const selectedCount = selectedItems.reduce((sum, item) => sum + item.count, 0);
                const percentage = ((selectedCount / totalPieces) * 100).toFixed(1);
                const statusNames = selectedStatuses.join(", ");
                return (
                  <>
                    <div className="text-2xl font-bold text-gray-800">{selectedCount}</div>
                    <div className="text-sm text-gray-600">({percentage}%) {statusNames}</div>
                  </>
                );
              }
              // If hovering, show hovered status
              if (hoveredStatus) {
                const hoveredItem = statusCounts.find(item => item.status === hoveredStatus);
                if (hoveredItem) {
                  const percentage = ((hoveredItem.count / totalPieces) * 100).toFixed(1);
                  return (
                    <>
                      <div className="text-2xl font-bold text-gray-800">{hoveredItem.count}</div>
                      <div className="text-sm text-gray-600">({percentage}%) {hoveredItem.status}</div>
                    </>
                  );
                }
              }
              // Otherwise, show total
              return (
                <>
                  <div className="text-2xl font-bold text-gray-800">{totalPieces}</div>
                  <div className="text-sm text-gray-600">Total Pieces</div>
                </>
              );
            })()}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 w-1/2 relative">
          {/* Clear All button */}
          {selectedStatuses.length > 0 && (
            <div className="absolute top-0 right-0 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedStatuses([])}
                className="text-xs h-7 px-2"
              >
                Clear All
              </Button>
            </div>
          )}
          <div className={selectedStatuses.length > 0 ? "pt-8" : ""}>
            {statusCounts.map((item) => {
            const isSelected = selectedStatuses.includes(item.status);
            const isHovered = hoveredStatus === item.status;
            // If statuses are selected, highlight selected ones
            // Otherwise, use hover logic
            const opacity = selectedStatuses.length > 0
              ? (isSelected ? 1 : 0.3)
              : (hoveredStatus === null ? 1 : isHovered ? 1 : 0.3);
            
            return (
              <div 
                key={item.status} 
                className={`flex items-center justify-between text-sm cursor-pointer transition-opacity duration-300 ${isSelected ? 'font-semibold' : ''}`}
                style={{ opacity }}
                onMouseEnter={() => setHoveredStatus(item.status)}
                onMouseLeave={() => setHoveredStatus(null)}
                onClick={() => {
                  // Toggle selection: if clicking a selected item, remove it; otherwise add it
                  setSelectedStatuses(prev => 
                    isSelected 
                      ? prev.filter(s => s !== item.status)
                      : [...prev, item.status]
                  );
                }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-700">{item.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{item.count}</span>
                  <span className="text-gray-500">
                    ({((item.count / totalPieces) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </div>
    </div>
  );
}
