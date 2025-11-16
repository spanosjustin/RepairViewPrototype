# IndexedDB Storage System

This is a **temporary testing solution** that stores the entire database in the browser's IndexedDB. It will be replaced with Supabase later.

## Features

- ✅ **Huge capacity** - Can store hundreds of MB to GB of data (vs 5-10MB for localStorage)
- ✅ **Persists across cache clears** - IndexedDB is separate from browser cache
- ✅ **Single user, single PC** - Perfect for testing entire database locally
- ✅ **Structured data** - Proper database with indexes, queries, and relationships
- ✅ **Easy migration path** - Simple API that can be swapped for Supabase
- ✅ **Type-safe** - Full TypeScript support

## Database Schema

**Database Name**: `repairview_db`

**Object Stores**:
- `status_colors` - Status/state color settings
- `pieces` - Inventory pieces/items
- `components` - Component data
- `turbines` - Turbine data
- `sites` - Site/plant data
- `repair_events` - Repair event history

## How It Works

1. Data is stored in IndexedDB (survives browser restarts and cache clears)
2. TanStack Query manages the cache and reactivity
3. Default values are seeded on first load
4. Automatic migration from localStorage if data exists there

## Usage Example

```typescript
import { useStatusColors, useUpdateStatusColor } from '@/hooks/useStatusColors';
import { piecesStorage } from '@/lib/storage/indexedDB';

function MyComponent() {
  // Get all color settings
  const { data: colors, isLoading } = useStatusColors();
  
  // Update a color
  const updateColor = useUpdateStatusColor();
  
  // Get all pieces
  const [pieces, setPieces] = useState([]);
  useEffect(() => {
    piecesStorage.getAll().then(setPieces);
  }, []);
  
  const handleSave = () => {
    updateColor.mutate({
      value: 'OK',
      type: 'status',
      tone: 'ok',
    });
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return <div>{/* Your UI */}</div>;
}
```

## Storage Capacity

| Browser | IndexedDB Limit | Your Usage |
|---------|----------------|------------|
| Chrome/Edge | 60% of disk space | Virtually unlimited for testing |
| Firefox | 50% of disk space | Virtually unlimited for testing |
| Safari | 1GB (can request more) | 1GB+ |
| Mobile | Varies | Usually 50MB+ |

**For testing**: You can store **hundreds of thousands** of inventory items, components, turbines, etc.

## Migration to Supabase

When ready to migrate:

1. **Keep the same API** - The hooks and storage functions stay the same
2. **Replace the storage layer** - Swap `indexedDB.ts` with Supabase API calls
3. **Update the hooks** - Change hooks to fetch from API instead of IndexedDB
4. **No component changes needed** - Components using the hooks won't need updates

The storage abstraction makes this migration straightforward!

## Storage Location

- **Browser DevTools**: Application → IndexedDB → `repairview_db`
- **Can be cleared**: User can clear via DevTools or browser settings
- **Survives**: Browser restarts, cache clears, hard refreshes
- **Size**: Check in DevTools → Application → Storage → IndexedDB → `repairview_db`

