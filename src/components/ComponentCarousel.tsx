"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { InventoryItem } from "@/lib/inventory/types";

interface ComponentCarouselProps {
  inventoryItems: InventoryItem[];
  className?: string;
}

interface ComponentGroup {
  componentName: string;
  parts: InventoryItem[];
}

export default function ComponentCarousel({ inventoryItems, className }: ComponentCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Group inventory items by component
  const componentGroups = React.useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    
    inventoryItems.forEach(item => {
      if (!groups[item.component]) {
        groups[item.component] = [];
      }
      groups[item.component].push(item);
    });

    return Object.entries(groups).map(([componentName, parts]) => ({
      componentName,
      parts,
    }));
  }, [inventoryItems]);

  const nextComponent = () => {
    setCurrentIndex((prev) => (prev + 1) % componentGroups.length);
  };

  const prevComponent = () => {
    setCurrentIndex((prev) => (prev - 1 + componentGroups.length) % componentGroups.length);
  };

  if (!componentGroups.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No component data available</p>
      </div>
    );
  }

  const currentComponent = componentGroups[currentIndex];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OK": return "text-green-600 bg-green-100";
      case "Monitor": return "text-yellow-600 bg-yellow-100";
      case "Replace Soon": return "text-orange-600 bg-orange-100";
      case "Replace Now": return "text-red-600 bg-red-100";
      case "Spare": return "text-blue-600 bg-blue-100";
      case "Degraded": return "text-purple-600 bg-purple-100";
      case "Unknown": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStateColor = (state: string) => {
    switch (state) {
      case "In Service": return "text-green-600 bg-green-100";
      case "Out of Service": return "text-red-600 bg-red-100";
      case "Standby": return "text-blue-600 bg-blue-100";
      case "Repair": return "text-orange-600 bg-orange-100";
      case "On Order": return "text-purple-600 bg-purple-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className={`bg-gray-200 rounded-lg p-6 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentComponent.componentName}
        </h3>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevComponent}
            disabled={componentGroups.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {currentIndex + 1} / {componentGroups.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextComponent}
            disabled={componentGroups.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Parts List */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {currentComponent.parts.map((part, index) => (
            <div key={`${part.sn}-${index}`} className="bg-white rounded-lg p-4">
              {/* Part Header */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-medium text-gray-800">{part.sn}</div>
                  <div className="text-sm text-gray-600">{part.pn}</div>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(part.status)}`}>
                    {part.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(part.state)}`}>
                    {part.state}
                  </span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{part.hours.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{part.trips.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{part.starts.toLocaleString()}</div>
                  <div className="text-xs text-gray-600">Starts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-300">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{currentComponent.parts.length}</span> parts in this component
        </div>
      </div>
    </div>
  );
}
