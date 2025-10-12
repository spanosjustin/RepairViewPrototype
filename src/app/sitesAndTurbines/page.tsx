"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Briefcase
} from "lucide-react";
import VisualTreeView from "@/components/VisualTreeView";
import type { InventoryItem } from "@/lib/inventory/types";

// Mock inventory data for turbines
const MOCK_TURBINE_INVENTORY: Record<string, InventoryItem[]> = {
  "T-101": [
    { sn: "SN-00123", pn: "PN-AX45", hours: 18520, trips: 182, starts: 980, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-00456", pn: "PN-QZ19", hours: 23270, trips: 201, starts: 1165, status: "Replace Now", state: "Repair", component: "Comb Liner" },
    { sn: "SN-00789", pn: "PN-TX88", hours: 7400, trips: 12, starts: 180, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01011", pn: "PN-S1N1", hours: 9240, trips: 33, starts: 402, status: "Monitor", state: "In Service", component: "S1N" },
    { sn: "SN-01314", pn: "PN-S2N2", hours: 15410, trips: 77, starts: 605, status: "Replace Soon", state: "In Service", component: "S2N" },
    { sn: "SN-01617", pn: "PN-RTR1", hours: 28100, trips: 15, starts: 220, status: "OK", state: "Standby", component: "Rotor" }
  ],
  "T-102": [
    { sn: "SN-00234", pn: "PN-BX56", hours: 15200, trips: 145, starts: 750, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-00567", pn: "PN-RZ20", hours: 19800, trips: 165, starts: 890, status: "Monitor", state: "In Service", component: "Comb Liner" },
    { sn: "SN-00890", pn: "PN-UX99", hours: 8200, trips: 18, starts: 210, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01112", pn: "PN-T2N2", hours: 11200, trips: 45, starts: 520, status: "OK", state: "In Service", component: "S1N" },
    { sn: "SN-01425", pn: "PN-T3N3", hours: 16800, trips: 89, starts: 720, status: "Replace Soon", state: "In Service", component: "S2N" },
    { sn: "SN-01728", pn: "PN-STR2", hours: 24500, trips: 22, starts: 180, status: "OK", state: "Standby", component: "Rotor" }
  ],
  "T-103": [
    { sn: "SN-00345", pn: "PN-CX67", hours: 22100, trips: 198, starts: 1100, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-00678", pn: "PN-SZ21", hours: 18700, trips: 156, starts: 820, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-00901", pn: "PN-VX00", hours: 6800, trips: 8, starts: 150, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01213", pn: "PN-U3N3", hours: 13400, trips: 67, starts: 680, status: "OK", state: "In Service", component: "S1N" },
    { sn: "SN-01536", pn: "PN-U4N4", hours: 19200, trips: 95, starts: 850, status: "OK", state: "In Service", component: "S2N" },
    { sn: "SN-01839", pn: "PN-TTR3", hours: 31200, trips: 28, starts: 250, status: "OK", state: "Standby", component: "Rotor" }
  ],
  "T-201": [
    { sn: "SN-00456", pn: "PN-DX78", hours: 16800, trips: 142, starts: 780, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-00789", pn: "PN-TZ22", hours: 20300, trips: 178, starts: 950, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-01012", pn: "PN-WX11", hours: 9200, trips: 15, starts: 190, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01324", pn: "PN-V4N4", hours: 15600, trips: 78, starts: 750, status: "OK", state: "In Service", component: "S1N" },
    { sn: "SN-01647", pn: "PN-V5N5", hours: 21400, trips: 108, starts: 920, status: "OK", state: "In Service", component: "S2N" },
    { sn: "SN-01950", pn: "PN-UUR4", hours: 26800, trips: 35, starts: 280, status: "OK", state: "Standby", component: "Rotor" }
  ],
  "T-202": [
    { sn: "SN-00567", pn: "PN-EX89", hours: 14200, trips: 128, starts: 720, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-00890", pn: "PN-UZ23", hours: 18900, trips: 167, starts: 880, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-01123", pn: "PN-XX22", hours: 7800, trips: 12, starts: 170, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01435", pn: "PN-W5N5", hours: 13800, trips: 69, starts: 680, status: "OK", state: "In Service", component: "S1N" },
    { sn: "SN-01758", pn: "PN-W6N6", hours: 19600, trips: 98, starts: 850, status: "OK", state: "In Service", component: "S2N" },
    { sn: "SN-02061", pn: "PN-VVR5", hours: 25200, trips: 32, starts: 260, status: "OK", state: "Standby", component: "Rotor" }
  ],
  "T-301": [
    { sn: "SN-00678", pn: "PN-FX90", hours: 19800, trips: 175, starts: 920, status: "Replace Now", state: "Repair", component: "Comb Liner" },
    { sn: "SN-00901", pn: "PN-VZ24", hours: 22500, trips: 198, starts: 1050, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-01234", pn: "PN-YX33", hours: 8600, trips: 18, starts: 210, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01546", pn: "PN-X6N6", hours: 17200, trips: 85, starts: 820, status: "OK", state: "In Service", component: "S1N" },
    { sn: "SN-01869", pn: "PN-X7N7", hours: 22800, trips: 115, starts: 980, status: "OK", state: "In Service", component: "S2N" },
    { sn: "SN-02172", pn: "PN-WWR6", hours: 28400, trips: 38, starts: 300, status: "OK", state: "Standby", component: "Rotor" }
  ],
  "T-302": [
    { sn: "SN-00789", pn: "PN-GX01", hours: 17600, trips: 158, starts: 850, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-01012", pn: "PN-WZ25", hours: 21100, trips: 186, starts: 980, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-01345", pn: "PN-ZX44", hours: 9400, trips: 16, starts: 190, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01657", pn: "PN-Y7N7", hours: 15800, trips: 78, starts: 750, status: "OK", state: "In Service", component: "S1N" },
    { sn: "SN-01980", pn: "PN-Y8N8", hours: 21600, trips: 108, starts: 920, status: "OK", state: "In Service", component: "S2N" },
    { sn: "SN-02283", pn: "PN-XXR7", hours: 27200, trips: 35, starts: 280, status: "OK", state: "Standby", component: "Rotor" }
  ],
  "T-303": [
    { sn: "SN-00890", pn: "PN-HX12", hours: 16400, trips: 148, starts: 800, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-01123", pn: "PN-XZ26", hours: 19700, trips: 174, starts: 920, status: "OK", state: "In Service", component: "Comb Liner" },
    { sn: "SN-01456", pn: "PN-AX55", hours: 8200, trips: 14, starts: 180, status: "OK", state: "In Service", component: "Tran PRC" },
    { sn: "SN-01768", pn: "PN-Z8N8", hours: 14400, trips: 71, starts: 690, status: "OK", state: "In Service", component: "S1N" },
    { sn: "SN-02091", pn: "PN-Z9N9", hours: 20400, trips: 102, starts: 870, status: "OK", state: "In Service", component: "S2N" },
    { sn: "SN-02394", pn: "PN-YYR8", hours: 26000, trips: 33, starts: 270, status: "OK", state: "Standby", component: "Rotor" }
  ]
};

// Mock data for sites and turbines
const MOCK_SITES = [
  {
    id: "site-1",
    name: "Riverbend Power Plant",
    location: "Riverside, CA",
    address: "1234 River Road, Riverside, CA 92501",
    contact: {
      name: "John Smith",
      title: "Plant Manager",
      phone: "(555) 123-4567",
      email: "john.smith@riverbend.com"
    },
    turbines: [
      { id: "T-101", name: "Unit 1A", status: "operational", lastMaintenance: "2024-11-15", nextMaintenance: "2025-02-15" },
      { id: "T-102", name: "Unit 1B", status: "maintenance", lastMaintenance: "2024-12-01", nextMaintenance: "2025-03-01" },
      { id: "T-103", name: "Unit 1C", status: "operational", lastMaintenance: "2024-10-20", nextMaintenance: "2025-01-20" }
    ],
    totalCapacity: "450 MW",
    operationalStatus: "operational"
  },
  {
    id: "site-2", 
    name: "Mountainview Energy Center",
    location: "Denver, CO",
    address: "5678 Mountain View Drive, Denver, CO 80202",
    contact: {
      name: "Sarah Johnson",
      title: "Operations Director",
      phone: "(555) 987-6543",
      email: "sarah.johnson@mountainview.com"
    },
    turbines: [
      { id: "T-201", name: "Unit 2A", status: "operational", lastMaintenance: "2024-12-10", nextMaintenance: "2025-03-10" },
      { id: "T-202", name: "Unit 2B", status: "operational", lastMaintenance: "2024-11-25", nextMaintenance: "2025-02-25" }
    ],
    totalCapacity: "300 MW",
    operationalStatus: "operational"
  },
  {
    id: "site-3",
    name: "Lakeside Generation Facility", 
    location: "Seattle, WA",
    address: "9012 Lake Street, Seattle, WA 98101",
    contact: {
      name: "Mike Chen",
      title: "Site Supervisor",
      phone: "(555) 456-7890",
      email: "mike.chen@lakeside.com"
    },
    turbines: [
      { id: "T-301", name: "Unit 3A", status: "outage", lastMaintenance: "2024-09-15", nextMaintenance: "2025-01-15" },
      { id: "T-302", name: "Unit 3B", status: "operational", lastMaintenance: "2024-12-05", nextMaintenance: "2025-03-05" },
      { id: "T-303", name: "Unit 3C", status: "operational", lastMaintenance: "2024-11-30", nextMaintenance: "2025-02-28" }
    ],
    totalCapacity: "375 MW",
    operationalStatus: "partial_outage"
  }
];

type ViewMode = "sites" | "turbines";
type StatusFilter = "all" | "operational" | "maintenance" | "outage";

interface SiteCardProps {
  site: typeof MOCK_SITES[0];
  onTurbineClick?: (turbineId: string) => void;
  expandedTurbines: Set<string>;
}

function SiteCard({ site, onTurbineClick, expandedTurbines }: SiteCardProps) {
  const [selectedContact, setSelectedContact] = React.useState(site.contact.name);
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-800 border-green-200";
      case "maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "outage": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="h-4 w-4" />;
      case "maintenance": return <Clock className="h-4 w-4" />;
      case "outage": return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{site.name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                {site.location}
              </div>
            </div>
          </div>
          <Badge className={`${getStatusColor(site.operationalStatus)} border`}>
            {site.operationalStatus.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Contact Information</h4>
          <Select value={selectedContact} onValueChange={setSelectedContact}>
            <SelectTrigger className="w-full">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{selectedContact}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={site.contact.name}>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{site.contact.name}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          {/* Contact Details Display */}
          {selectedContact && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{site.contact.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{site.contact.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-gray-700">{site.contact.email}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Site Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{site.turbines.length}</div>
            <div className="text-sm text-gray-600">Turbines</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{site.totalCapacity}</div>
            <div className="text-sm text-gray-600">Total Capacity</div>
          </div>
        </div>

        {/* Turbines List */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Turbines</h4>
          <div className="space-y-2">
            {site.turbines.map((turbine) => {
              const isExpanded = expandedTurbines.has(turbine.id);
              return (
                <div key={turbine.id} className="space-y-2">
                  <div 
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => onTurbineClick?.(turbine.id)}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(turbine.status)}
                      <span className="font-medium text-sm">{turbine.name}</span>
                    </div>
                    <Badge className={`${getStatusColor(turbine.status)} border text-xs`}>
                      {turbine.status}
                    </Badge>
                  </div>
                  
                  {/* Expanded Content for Site View */}
                  {isExpanded && (
                    <div className="ml-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <h5 className="font-medium text-sm text-gray-800 mb-3">Components & Inventory</h5>
                      <div className="max-h-64 overflow-auto">
                        <VisualTreeView 
                          items={MOCK_TURBINE_INVENTORY[turbine.id] || []}
                          onSelectPiece={(item) => {
                            console.log('Selected piece:', item);
                            // Handle piece selection - could open a modal or navigate to details
                          }}
                          onSelectComponent={(componentName, pieces) => {
                            console.log('Selected component:', componentName, pieces);
                            // Handle component selection - could show component details
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface TurbineOverviewProps {
  turbines: Array<{
    id: string;
    name: string;
    site: string;
    status: string;
    lastMaintenance: string;
    nextMaintenance: string;
  }>;
  expandedTurbines: Set<string>;
  onTurbineClick: (turbineId: string) => void;
}

function TurbineOverview({ turbines, expandedTurbines, onTurbineClick }: TurbineOverviewProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-100 text-green-800 border-green-200";
      case "maintenance": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "outage": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="h-4 w-4" />;
      case "maintenance": return <Clock className="h-4 w-4" />;
      case "outage": return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {turbines.map((turbine) => {
        const isExpanded = expandedTurbines.has(turbine.id);
        
        return (
          <Card key={turbine.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => onTurbineClick(turbine.id)}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(turbine.status)}
                  <div>
                    <h3 className="font-semibold">{turbine.name}</h3>
                    <p className="text-sm text-gray-600">{turbine.site}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Last Maintenance</div>
                    <div className="font-medium">{turbine.lastMaintenance}</div>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-gray-600">Next Maintenance</div>
                    <div className="font-medium">{turbine.nextMaintenance}</div>
                  </div>
                  <Badge className={`${getStatusColor(turbine.status)} border`}>
                    {turbine.status}
                  </Badge>
                </div>
              </div>
              
              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-4">Turbine Components & Inventory</h4>
                    <div className="max-h-96 overflow-auto">
                      <VisualTreeView 
                        items={MOCK_TURBINE_INVENTORY[turbine.id] || []}
                        onSelectPiece={(item) => {
                          console.log('Selected piece:', item);
                          // Handle piece selection - could open a modal or navigate to details
                        }}
                        onSelectComponent={(componentName, pieces) => {
                          console.log('Selected component:', componentName, pieces);
                          // Handle component selection - could show component details
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default function SitesAndTurbinesPage() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("sites");
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedTurbines, setExpandedTurbines] = React.useState<Set<string>>(new Set());

  // Flatten turbines for turbine view
  const allTurbines = React.useMemo(() => {
    return MOCK_SITES.flatMap(site => 
      site.turbines.map(turbine => ({
        ...turbine,
        site: site.name
      }))
    );
  }, []);

  // Filter sites based on search and status
  const filteredSites = React.useMemo(() => {
    return MOCK_SITES.filter(site => {
      const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           site.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      
      const hasMatchingTurbine = site.turbines.some(turbine => turbine.status === statusFilter);
      return matchesSearch && hasMatchingTurbine;
    });
  }, [searchQuery, statusFilter]);

  // Filter turbines based on search and status
  const filteredTurbines = React.useMemo(() => {
    return allTurbines.filter(turbine => {
      const matchesSearch = turbine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           turbine.site.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (statusFilter === "all") return matchesSearch;
      return matchesSearch && turbine.status === statusFilter;
    });
  }, [allTurbines, searchQuery, statusFilter]);

  const handleTurbineClick = (turbineId: string) => {
    // Toggle turbine expansion
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sites & Turbines</h1>
          <p className="text-gray-600 mt-1">Manage power plant sites and their associated turbines</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Site
        </Button>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search sites or turbines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "sites" ? "default" : "outline"}
                onClick={() => setViewMode("sites")}
                className="flex items-center gap-2"
              >
                <Building2 className="h-4 w-4" />
                Sites
              </Button>
              <Button
                variant={viewMode === "turbines" ? "default" : "outline"}
                onClick={() => setViewMode("turbines")}
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Turbines
              </Button>
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="outage">Outage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === "sites" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onTurbineClick={handleTurbineClick}
              expandedTurbines={expandedTurbines}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">All Turbines ({filteredTurbines.length})</h2>
          </div>
          <TurbineOverview 
            turbines={filteredTurbines} 
            expandedTurbines={expandedTurbines}
            onTurbineClick={handleTurbineClick}
          />
        </div>
      )}

      {/* Empty State */}
      {((viewMode === "sites" && filteredSites.length === 0) || 
        (viewMode === "turbines" && filteredTurbines.length === 0)) && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No ${viewMode} match your search criteria.`
                : `No ${viewMode} available.`
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
