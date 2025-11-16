# Storage Upgrade: localStorage → IndexedDB

## What Changed

Upgraded from **localStorage** (5-10MB limit) to **IndexedDB** (hundreds of MB to GB) to support storing the entire database locally for testing.

## Files Changed

### New Files
- `src/lib/storage/indexedDB.ts` - IndexedDB implementation with full database schema
- `src/lib/storage/migrate.ts` - Migration utility to move data from localStorage

### Updated Files
- `src/lib/storage/defaults.ts` - Now uses IndexedDB instead of localStorage
- `src/hooks/useStatusColors.ts` - Updated to use async IndexedDB calls
- `src/app/providers.tsx` - Added migration on startup
- `src/lib/settings/colorMapper.ts` - Updated imports

### Deprecated (but kept for reference)
- `src/lib/storage/localStorage.ts` - Old implementation, can be removed later

## Breaking Changes

**All storage operations are now async!**

```typescript
// OLD (localStorage - synchronous)
const colors = statusColorStorage.getAll();

// NEW (IndexedDB - async)
const colors = await statusColorStorage.getAll();
```

## Migration

The app automatically migrates data from localStorage to IndexedDB on first load. No manual steps needed!

## Database Schema

The IndexedDB database includes these object stores:

1. **status_colors** - Color settings (key: [value, type])
2. **pieces** - Inventory items (key: id, indexes: sn, turbine, component)
3. **components** - Component data (key: id, indexes: name, type)
4. **turbines** - Turbine data (key: id, index: name)
5. **sites** - Site/plant data (key: id, index: name)
6. **repair_events** - Repair history (key: id, indexes: pieceId, componentId, date)

## Usage Examples

### Status Colors (already implemented)
```typescript
import { useStatusColors } from '@/hooks/useStatusColors';
```

### Pieces/Inventory (ready to use)
```typescript
import { piecesStorage } from '@/lib/storage/indexedDB';

// Get all pieces
const pieces = await piecesStorage.getAll();

// Get pieces by turbine
const turbinePieces = await piecesStorage.getByTurbine('T-101');

// Save a piece
await piecesStorage.save(piece);

// Save multiple pieces
await piecesStorage.saveAll([piece1, piece2, piece3]);
```

### Components (ready to use)
```typescript
import { componentsStorage } from '@/lib/storage/indexedDB';

// Get all components
const components = await componentsStorage.getAll();

// Get components by type
const fuelComponents = await componentsStorage.getByType('fuel');
```

## Capacity

You can now store:
- ✅ **Hundreds of thousands** of inventory items
- ✅ **Thousands** of components
- ✅ **Hundreds** of turbines and sites
- ✅ **Millions** of repair events

All locally, all persistent, all surviving cache clears!

