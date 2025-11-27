// src/lib/inventory/mockRepairEvents.ts

import type { RepairEvent } from "./types";

/**
 * Mock repair events for pieces
 * Maps piece identifiers (SN, PN, or component) to repair events
 */
export const MOCK_REPAIR_EVENTS: Record<string, RepairEvent[]> = {
  // Example repair events for specific pieces by SN
  "SN-001-01": [
    {
      title: "Hot Section Inspection - 2024-11-10",
      repairDetails: "Routine hot section inspection completed. All components inspected and verified within specification. Thermal barrier coating intact. No repairs required at this time.",
      conditionDetails: "Component operating within normal parameters. No anomalies detected during inspection. All clearances verified within specification limits.",
    },
    {
      title: "Combustor Overhaul - 2024-06-20",
      repairDetails: "Combustor overhaul performed. All fuel nozzles cleaned and inspected. Combustion liners inspected for cracks and erosion. Minor coating touch-up applied to liner caps. All components reassembled and tested.",
      conditionDetails: "Minor erosion detected on inner surface of combustion liner. Coating showed signs of wear in high-temperature zones. No structural damage observed.",
    },
  ],
  "SN-101001": [
    {
      title: "Routine Maintenance - 2024-10-15",
      repairDetails: "Cleaned and inspected, no replacement needed. Applied protective coating to prevent future erosion.",
      conditionDetails: "Minor erosion detected on inner surface. Coating showed signs of wear in high-temperature zones.",
    },
  ],
  "SN-202001": [
    {
      title: "Emergency Repair - 2024-09-05",
      repairDetails: "Weld repaired and reinforced. Crack observed near weld seam was ground out and re-welded. Post-repair inspection passed all tests.",
      conditionDetails: "Crack observed near weld seam during routine inspection. Approximately 2mm in length, located at the 3 o'clock position.",
    },
  ],
  "SN-303001": [
    {
      title: "Scheduled Overhaul - 2024-08-12",
      repairDetails: "Re-applied protective coating. Component disassembled, cleaned, and inspected. New thermal barrier coating applied to all surfaces. Reassembled and tested.",
      conditionDetails: "Coating erosion detected across multiple surfaces. Approximately 30% of original coating thickness lost in high-temperature zones.",
    },
  ],
};

/**
 * Get mock repair events for a piece
 * @param piece - The piece to get repair events for
 * @returns Array of repair events, or empty array if none found
 */
export function getMockRepairEvents(piece: { sn?: string | null; pn?: string | null; component?: string | null }): RepairEvent[] {
  if (!piece) return [];
  
  // Try to find by SN first
  if (piece.sn && MOCK_REPAIR_EVENTS[piece.sn]) {
    return MOCK_REPAIR_EVENTS[piece.sn];
  }
  
  // Try to find by PN
  if (piece.pn && MOCK_REPAIR_EVENTS[piece.pn]) {
    return MOCK_REPAIR_EVENTS[piece.pn];
  }
  
  // For pieces without specific mock data, generate some based on component type or status
  // This ensures most pieces have at least one repair event for demonstration
  const hasRepairHistory = Math.random() > 0.3; // 70% chance of having repair history
  
  if (hasRepairHistory) {
    const repairTitles = [
      "Routine Inspection",
      "Scheduled Maintenance",
      "Component Overhaul",
      "Hot Section Inspection",
      "Preventive Maintenance",
    ];
    
    const repairDetails = [
      "Component inspected and verified within specification. All clearances checked and found to be within tolerance.",
      "Routine maintenance performed. Component cleaned, inspected, and tested. No repairs required.",
      "Scheduled overhaul completed. Component disassembled, cleaned, and reassembled. All parts verified.",
      "Hot section inspection completed. Thermal barrier coating intact. No anomalies detected.",
      "Preventive maintenance performed. Component operating within normal parameters.",
    ];
    
    const conditionDetails = [
      "Component operating within normal parameters. No anomalies detected.",
      "Minor wear observed in high-temperature zones. Within acceptable limits.",
      "Component condition good. All measurements within specification.",
      "No issues detected. Component performing as expected.",
      "Normal wear patterns observed. No action required at this time.",
    ];
    
    const randomIndex = Math.floor(Math.random() * repairTitles.length);
    
    return [
      {
        title: `${repairTitles[randomIndex]} - ${new Date().toISOString().split('T')[0]}`,
        repairDetails: repairDetails[randomIndex],
        conditionDetails: conditionDetails[randomIndex],
      },
    ];
  }
  
  return [];
}

