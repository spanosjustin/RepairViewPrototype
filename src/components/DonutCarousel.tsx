"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import PieceStatusDonutChart from "@/components/PieceStatusDonutChart";
import ComponentStatusDonutChart from "@/components/ComponentStatusDonutChart";
import type { Turbine } from "@/lib/matrix/types";
import type { InventoryItem } from "@/lib/inventory/types";

interface DonutCarouselProps {
  turbines?: Turbine[];
  inventoryItems?: InventoryItem[];
  className?: string;
}

type DonutType = "piece" | "component";

export default function DonutCarousel({ turbines, inventoryItems, className }: DonutCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState<number>(0);
  
  const donutTypes: DonutType[] = ["piece", "component"];

  const nextDonut = () => {
    setCurrentIndex((prev) => (prev + 1) % donutTypes.length);
  };

  const prevDonut = () => {
    setCurrentIndex((prev) => (prev - 1 + donutTypes.length) % donutTypes.length);
  };

  const currentType = donutTypes[currentIndex];

  return (
    <div className={`relative ${className}`}>
      {/* Navigation buttons */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={prevDonut}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-gray-600 min-w-[4rem] text-center">
          {currentIndex + 1} / {donutTypes.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={nextDonut}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Donut Chart Content */}
      <div className="transition-opacity duration-300">
        {currentType === "piece" ? (
          <PieceStatusDonutChart 
            turbines={turbines} 
            inventoryItems={inventoryItems} 
          />
        ) : (
          <ComponentStatusDonutChart 
            inventoryItems={inventoryItems} 
          />
        )}
      </div>
    </div>
  );
}

