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
import AddTurbineSiteDialog from "@/components/AddTurbineSiteDialog";
import type { InventoryItem } from "@/lib/inventory/types";
import { plantStorage, plantContactStorage, turbineStorage } from "@/lib/storage/db/storage";
import { getAllInventoryItems } from "@/lib/storage/db/adapters";

// DB-backed view models
interface SiteViewModel {
  id: string;
  name: string;
  location: string;
  address: string;
  contact: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  turbines: Array<{
    id: string;
    name: string;
    status: string;
    lastMaintenance: string;
    nextMaintenance: string;
  }>;
  totalCapacity: string;
  operationalStatus: string;
}

const EMPTY_SITES: SiteViewModel[] = [];

type ViewMode = "sites" | "turbines";
type StatusFilter = "all" | "operational" | "maintenance" | "outage";

interface SiteCardProps {
  site: SiteViewModel;
  onTurbineClick?: (turbineId: string) => void;
  expandedTurbines: Set<string>;
  inventoryByTurbine: Record<string, InventoryItem[]>;
}

function SiteCard({ site, onTurbineClick, expandedTurbines, inventoryByTurbine }: SiteCardProps) {
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
                          items={inventoryByTurbine[turbine.id] || []}
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

function TurbineOverview({
  turbines,
  expandedTurbines,
  onTurbineClick,
  inventoryByTurbine,
}: TurbineOverviewProps & { inventoryByTurbine: Record<string, InventoryItem[]> }) {
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
                        items={inventoryByTurbine[turbine.id] || []}
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
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const [sites, setSites] = React.useState<SiteViewModel[]>(EMPTY_SITES);
  const [inventoryByTurbine, setInventoryByTurbine] = React.useState<Record<string, InventoryItem[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [plants, turbines, inventoryItems, contacts] = await Promise.all([
          plantStorage.getAll(),
          turbineStorage.getAll(),
          getAllInventoryItems(),
          plantContactStorage.getAll(),
        ]);

        // Build inventory map by turbine
        const inventoryMap: Record<string, InventoryItem[]> = {};
        for (const item of inventoryItems) {
          const tid = item.turbine || "unassigned";
          if (!inventoryMap[tid]) inventoryMap[tid] = [];
          inventoryMap[tid].push(item);
        }

        setInventoryByTurbine(inventoryMap);

        // Build site view models from plants and turbines
        const siteModels: SiteViewModel[] = plants.map((plant) => {
          const plantTurbines = turbines.filter((t) => t.plant_id === plant.id);

          return {
            id: plant.id,
            name: plant.name,
            location: plant.location || "Unknown location",
            address: plant.address || "",
            contact: {
              name: contacts.find((c) => c.plant_id === plant.id)?.name || "Unknown",
              title: contacts.find((c) => c.plant_id === plant.id)?.title || "",
              phone: contacts.find((c) => c.plant_id === plant.id)?.phone || "",
              email: contacts.find((c) => c.plant_id === plant.id)?.email || "",
            },
            turbines: plantTurbines.map((turbine) => ({
              id: turbine.id,
              name: turbine.name,
              status: "operational", // placeholder until outage/maintenance tracking is wired
              lastMaintenance: new Date(turbine.created_at).toISOString().split("T")[0],
              nextMaintenance: new Date(turbine.updated_at).toISOString().split("T")[0],
            })),
            totalCapacity: "N/A",
            operationalStatus: "operational",
          };
        });

        setSites(siteModels);
      } catch (e) {
        console.error("Error loading sites & turbines:", e);
        setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Flatten turbines for turbine view
  const allTurbines = React.useMemo(() => {
    return sites.flatMap((site) =>
      site.turbines.map((turbine) => ({
        ...turbine,
        site: site.name,
      }))
    );
  }, [sites]);

  // Filter sites based on search and status
  const filteredSites = React.useMemo(() => {
    return sites.filter((site) => {
      const matchesSearch =
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.location.toLowerCase().includes(searchQuery.toLowerCase());

      if (statusFilter === "all") return matchesSearch;

      const hasMatchingTurbine = site.turbines.some((turbine) => turbine.status === statusFilter);
      return matchesSearch && hasMatchingTurbine;
    });
  }, [sites, searchQuery, statusFilter]);

  // Filter turbines based on search and status
  const filteredTurbines = React.useMemo(() => {
    return allTurbines.filter((turbine) => {
      const matchesSearch =
        turbine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <div className="flex items-center gap-3">
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

          <Button 
            className="flex items-center gap-2 min-w-[140px]"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {viewMode === "sites" ? "Add Site" : "Add Turbine"}
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "sites" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSites.map((site) => (
            <SiteCard 
              key={site.id} 
              site={site} 
              onTurbineClick={handleTurbineClick}
              expandedTurbines={expandedTurbines}
              inventoryByTurbine={inventoryByTurbine}
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
            inventoryByTurbine={inventoryByTurbine}
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

      {/* Add Turbine/Site Dialog */}
      <AddTurbineSiteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        initialType={viewMode === "sites" ? "site" : "turbine"}
      />
    </div>
  );
}
