/**
 * Mock sites/plants data
 * Extracted from sitesAndTurbines page for use in seed functions
 */

export const MOCK_SITES = [
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
    location: "Chicago, IL",
    address: "9012 Lakeshore Boulevard, Chicago, IL 60601",
    contact: {
      name: "Michael Chen",
      title: "Facility Manager",
      phone: "(555) 456-7890",
      email: "michael.chen@lakeside.com"
    },
    turbines: [
      { id: "T-301", name: "Unit 3A", status: "operational", lastMaintenance: "2024-11-05", nextMaintenance: "2025-02-05" },
      { id: "T-302", name: "Unit 3B", status: "operational", lastMaintenance: "2024-12-15", nextMaintenance: "2025-03-15" },
      { id: "T-303", name: "Unit 3C", status: "operational", lastMaintenance: "2024-10-30", nextMaintenance: "2025-01-30" }
    ],
    totalCapacity: "675 MW",
    operationalStatus: "operational"
  }
];

