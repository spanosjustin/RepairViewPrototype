"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Turbine } from "@/lib/matrix/types";

interface TurbineCarouselProps {
  turbines: Turbine[];
  className?: string;
}

export default function TurbineCarousel({ turbines, className }: TurbineCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const nextTurbine = () => {
    setCurrentIndex((prev) => (prev + 1) % turbines.length);
  };

  const prevTurbine = () => {
    setCurrentIndex((prev) => (prev - 1 + turbines.length) % turbines.length);
  };

  if (!turbines.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No turbines available</p>
      </div>
    );
  }

  const currentTurbine = turbines[currentIndex];
  
  // Extract stats data
  const hoursStat = currentTurbine.stats.find(stat => stat.label === "Hours");
  const tripsStat = currentTurbine.stats.find(stat => stat.label === "Trips");
  const startsStat = currentTurbine.stats.find(stat => stat.label === "Starts");

  return (
    <div className={`bg-gray-200 rounded-lg p-6 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {currentTurbine.name}
          {currentTurbine.unit && (
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({currentTurbine.unit})
            </span>
          )}
        </h3>
        
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={prevTurbine}
            disabled={turbines.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[3rem] text-center">
            {currentIndex + 1} / {turbines.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextTurbine}
            disabled={turbines.length <= 1}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 flex-1">
        {/* Hours */}
        <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center">
          <div className="text-2xl font-bold text-blue-600">
            {hoursStat?.cells[3]?.value || 0}
          </div>
          <div className="text-sm text-gray-600">Hours</div>
          <div className="text-xs text-gray-500 mt-1">
            Target: {hoursStat?.cells[1]?.value || 0}
          </div>
        </div>

        {/* Trips */}
        <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center">
          <div className="text-2xl font-bold text-orange-600">
            {tripsStat?.cells[3]?.value || 0}
          </div>
          <div className="text-sm text-gray-600">Trips</div>
          <div className="text-xs text-gray-500 mt-1">
            Target: {tripsStat?.cells[1]?.value || 0}
          </div>
        </div>

        {/* Starts */}
        <div className="bg-white rounded-lg p-4 text-center flex flex-col justify-center">
          <div className="text-2xl font-bold text-green-600">
            {startsStat?.cells[3]?.value || 0}
          </div>
          <div className="text-sm text-gray-600">Starts</div>
          <div className="text-xs text-gray-500 mt-1">
            Target: {startsStat?.cells[1]?.value || 0}
          </div>
        </div>
      </div>

      {/* Status Notes */}
      <div className="mt-4 space-y-1">
        {hoursStat?.cells[5]?.value && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Hours:</span> {hoursStat.cells[5].value}
          </div>
        )}
        {tripsStat?.cells[5]?.value && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Trips:</span> {tripsStat.cells[5].value}
          </div>
        )}
        {startsStat?.cells[5]?.value && (
          <div className="text-xs text-gray-600">
            <span className="font-medium">Starts:</span> {startsStat.cells[5].value}
          </div>
        )}
      </div>
    </div>
  );
}
