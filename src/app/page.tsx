import TurbineCarousel from "@/components/TurbineCarousel";
import PieceStatusDonutChart from "@/components/PieceStatusDonutChart";
import ComponentCarousel from "@/components/ComponentCarousel";
import { MOCK_TURBINES } from "@/lib/matrix/mock";
import { MOCK_INVENTORY } from "@/lib/inventory/mock";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      {/* Sections A and B - Side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Section A - Turbine Carousel */}
        <div>
          <TurbineCarousel turbines={MOCK_TURBINES} />
        </div>
        
        {/* Section B - Piece Status Donut Chart */}
        <div>
          <PieceStatusDonutChart turbines={MOCK_TURBINES} />
        </div>
      </div>

      {/* Section C - Component Carousel */}
      <div className="mb-8">
        <ComponentCarousel inventoryItems={MOCK_INVENTORY} className="h-96" />
      </div>

      <footer className="flex gap-[24px] flex-wrap items-center justify-center">
        Repair View
      </footer>
    </div>
  );
}
