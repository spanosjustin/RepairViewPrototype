import React from "react";

interface ComponentInfoCardProps {
  item: {
    componentName?: string;
    componentType?: string;
    hours?: number | string;
    starts?: number | string;
    trips?: number | string;
    // Add more fields as needed for the component data
  };
}

export default function ComponentInfoCard({ item }: ComponentInfoCardProps) {
  return (
    <div className="w-full bg-gray-100 rounded-lg p-6 space-y-6">
      {/* Top Section: General Component Information */}
      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium text-gray-700">Component Name</div>
          <div className="text-sm font-medium text-gray-700">Component Type</div>
        </div>
        
        {/* Component Details Row */}
        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold text-gray-900">
            {item.componentName || "—"}
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {item.componentType || "—"}
          </div>
        </div>

        {/* Intervals Section */}
        <div className="bg-white rounded-md p-4 space-y-3 border border-gray-200">
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Interval FH</span>
            <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
              {item.hours || "###"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Interval FS</span>
            <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
              {item.starts || "###"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-sm font-medium text-gray-700">Interval Trips</span>
            <span className="text-sm font-bold text-gray-900 bg-gray-50 px-3 py-1 rounded">
              {item.trips || "###"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Component Parts Table */}
      <div className="space-y-3">
        {/* Table Header */}
        <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-700 border-b border-gray-300 pb-2">
          <div>Position</div>
          <div>PN</div>
          <div>SN</div>
        </div>

        {/* Table Rows */}
        <div className="space-y-2">
          {/* Row 1 */}
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-900">
            <div>1</div>
            <div>###</div>
            <div>###</div>
          </div>
          
          {/* Row 2 */}
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-900">
            <div>2</div>
            <div>###</div>
            <div>###</div>
          </div>
          
          {/* Row 3 */}
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-900">
            <div>3</div>
            <div>###</div>
            <div>###</div>
          </div>
          
          {/* Add Row */}
          <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 pt-2">
            <div></div>
            <div className="flex justify-center">
              <span className="text-lg">+</span>
            </div>
            <div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
