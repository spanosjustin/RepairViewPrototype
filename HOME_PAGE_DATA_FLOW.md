# Home Page Data Flow - High Level Breakdown

## Overview
The home page loads data from the **new normalized database** and displays it in three main sections.

---

## Data Loading Flow (Lines 19-68)

### Step 1: Load Base Turbines (Line 26)
```typescript
const allTurbines = await turbineStorage.getAll();
```
**Data Source:** 
- **New Database** → `turbines` table (IndexedDB)
- **Storage Layer:** `turbineStorage` from `@/lib/storage/db/storage`
- **Returns:** Array of basic `Turbine` objects (id, name, plant_id, etc.)

---

### Step 2: Enrich Each Turbine (Lines 37-47)
```typescript
const turbineWithComponents = await getTurbineWithComponents(turbine.id);
```
**Data Source:**
- **New Database** → Multiple tables via query helper:
  - `turbines` table (base turbine data)
  - `plants` table (plant info)
  - `turbine_operational_metrics` table (hours, trips, starts)
  - `component_assignments` table (which components are on turbine)
  - `components` table (component details)
  - `component_types` table (component type info)
  - `component_pieces` table (which pieces are in components)
  - `pieces` table (piece details)
  - `products` table (product info)
  - `use_status` table (status lookup)
  - `condition_codes` table (condition lookup)
- **Query Helper:** `getTurbineWithComponents()` from `@/lib/storage/db/queries`
- **Returns:** Fully enriched `TurbineWithComponents` object with all relationships

---

### Step 3: Convert to Old Format (Line 41)
```typescript
convertedTurbines.push(dbTurbineToMatrixTurbine(turbineWithComponents));
```
**Data Source:**
- **Adapter Function:** `dbTurbineToMatrixTurbine()` from `@/lib/storage/db/adapters`
- **Purpose:** Converts new normalized DB structure → old component format
- **Returns:** `Turbine` object in old format (with `stats` and `pieces` arrays)

---

### Step 4: Load Inventory Items (Line 53)
```typescript
const items = await getAllInventoryItems();
```
**Data Source:**
- **New Database** → Multiple tables via adapter:
  - `turbines` table
  - `components` table
  - `component_assignments` table
  - `component_pieces` table
  - `pieces` table
  - `products` table
  - `use_status` table
  - `condition_codes` table
- **Adapter Function:** `getAllInventoryItems()` from `@/lib/storage/db/adapters`
- **Returns:** Array of `InventoryItem` objects in old format

---

## UI Sections & Their Data Sources

### Section A: Turbine Carousel (Lines 111-113)
```typescript
<TurbineCarousel turbines={turbines} />
```
**Data Source:**
- **State Variable:** `turbines` (from Step 3 above)
- **Data Type:** `Turbine[]` (old format with `stats` and `pieces` arrays)
- **What It Shows:**
  - Turbine name and unit
  - Operating hours, trips, starts (from `stats` array)
  - Target values and status notes
- **Original Source:** New DB → `turbine_operational_metrics` table

---

### Section B: Donut Carousel (Lines 116-121)
```typescript
<DonutCarousel 
  turbines={turbines}
  inventoryItems={inventoryItems} 
/>
```
**Data Source:**
- **Turbines:** `turbines` state (from Step 3)
- **Inventory Items:** `inventoryItems` state (from Step 4)
- **What It Shows:**
  - **Piece Status Donut:** Status breakdown of pieces (from `inventoryItems`)
  - **Component Status Donut:** Status breakdown of components (from `inventoryItems`)
- **Original Source:** 
  - Pieces: New DB → `pieces` + `use_status` tables
  - Components: New DB → `components` + aggregated piece data

---

### Section C: Component Carousel (Lines 125-127)
```typescript
<ComponentCarousel inventoryItems={inventoryItems} className="h-96" />
```
**Data Source:**
- **State Variable:** `inventoryItems` (from Step 4)
- **Data Type:** `InventoryItem[]`
- **What It Shows:**
  - Groups inventory items by component name
  - Shows component details and their pieces
- **Original Source:** New DB → `components` + `component_pieces` + `pieces` tables

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    NEW DATABASE (IndexedDB)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ turbines │  │  plants  │  │components│  │  pieces  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  metrics │  │assignments│ │pieces_jxn│  │ products │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Storage Layer (storage.ts)   │
        │   turbineStorage.getAll()      │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Query Helper (queries.ts)     │
        │  getTurbineWithComponents()     │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │   Adapter Layer (adapters.ts)  │
        │   dbTurbineToMatrixTurbine()   │
        │   getAllInventoryItems()       │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │      React State (page.tsx)    │
        │      turbines[]                │
        │      inventoryItems[]          │
        └───────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │      UI Components            │
        │  TurbineCarousel              │
        │  DonutCarousel                │
        │  ComponentCarousel            │
        └───────────────────────────────┘
```

---

## Key Points

1. **All data originates from the new normalized database** (IndexedDB)
2. **No mock data is used** - everything comes from DB queries
3. **Data is transformed** through adapters to match old component formats
4. **Three-layer architecture:**
   - **Storage Layer:** Low-level CRUD operations
   - **Query Layer:** High-level relationship queries
   - **Adapter Layer:** Format conversion for UI compatibility

