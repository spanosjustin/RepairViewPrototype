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
  Plus
} from "lucide-react";

// Mock data for sites and turbines
const MOCK_SITES = [
  {
    id: "site-1",
    name: "Riverbend Power Plant",
    location: "Riverside, CA",
    address: "1234 River Road, Riverside, CA 92501",
    contact: {
      name: "John Smith",
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
}

function SiteCard({ site, onTurbineClick }: SiteCardProps) {
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
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              {site.contact.name}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              {site.contact.phone}
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              {site.contact.email}
            </div>
          </div>
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
            {site.turbines.map((turbine) => (
              <div 
                key={turbine.id}
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
            ))}
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
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Expanded</h4>
                    <p className="text-blue-700 text-sm">
                      This turbine section has been expanded. Additional details and controls would be displayed here.
                    </p>
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
