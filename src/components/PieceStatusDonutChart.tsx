"use client";

import * as React from "react";
import type { Turbine } from "@/lib/matrix/types";

interface PieceStatusDonutChartProps {
  turbines: Turbine[];
  className?: string;
}

interface StatusCount {
  status: string;
  count: number;
  color: string;
}

export default function PieceStatusDonutChart({ turbines, className }: PieceStatusDonutChartProps) {
  // Aggregate piece statuses from all turbines
  const statusCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    turbines.forEach(turbine => {
      turbine.pieces.forEach(piece => {
        const condition = piece.cells[2]?.value as string; // condition is in the 3rd cell
        if (condition) {
          counts[condition] = (counts[condition] || 0) + 1;
        }
      });
    });

    // Define colors for each status
    const statusColors: Record<string, string> = {
      "OK": "#10b981", // green
      "Monitor": "#f59e0b", // amber
      "Replace Soon": "#ef4444", // red
      "Replace Now": "#dc2626", // dark red
    };

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || "#6b7280", // default gray
    }));
  }, [turbines]);

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
      
      <div className="flex items-center justify-center flex-1">
        <div className="relative">
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
            {segments.map((segment, index) => (
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
                className="transition-all duration-300"
              />
            ))}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{totalPieces}</div>
              <div className="text-sm text-gray-600">Total Pieces</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 space-y-2">
        {statusCounts.map((item) => (
          <div key={item.status} className="flex items-center justify-between text-sm">
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
        ))}
      </div>
    </div>
  );
}
