# New Database Structure

This is the new normalized database structure matching the SQL schema design.

## Structure

```
src/lib/storage/db/
  ├── index.ts           # Main entry point - exports everything
  ├── types.ts           # TypeScript type definitions
  ├── indexedDB.ts       # IndexedDB schema (version 2)
  ├── storage.ts         # Low-level CRUD operations
  ├── queries.ts         # High-level query helpers
  ├── seed.ts            # Seed functions (dev only)
  └── init.ts            # Initialization utilities
```

## Quick Start

### 1. Initialize Database (on app startup - PRODUCTION)

```typescript
import { initializeDatabase } from '@/lib/storage/db/init';

// In your app initialization
await initializeDatabase();
```

**Note:** This does NOT auto-seed. The database starts empty for production use with real client data.

### 1b. Initialize with Seed (DEVELOPMENT ONLY)

```typescript
import { initializeDatabaseWithSeed } from '@/lib/storage/db/init';

// For development/testing with mock data
await initializeDatabaseWithSeed(); // Seeds if empty
await initializeDatabaseWithSeed(true); // Force re-seed (clears first)
```

**⚠️ WARNING:** Only use seeding functions in development. Production database should be empty and populated with real client data.

### 2. Use High-Level Queries

```typescript
import { getTurbineWithComponents, getTurbineWithMetrics } from '@/lib/storage/db';

// Get turbine with all components and pieces
const turbine = await getTurbineWithComponents('T-101');

// Get turbine with just metrics
const turbineMetrics = await getTurbineWithMetrics('T-101');
```

### 3. Assign Components/Pieces

```typescript
import { assignComponentToTurbine, assignPieceToComponent } from '@/lib/storage/db';

// Assign component to turbine (automatically ends previous assignment)
await assignComponentToTurbine('component-id', 'turbine-id', 1);

// Assign piece to component
await assignPieceToComponent('piece-id', 'component-id', 1);
```

## Database Schema

The database follows a normalized relational structure:

- **Pieces** → **Components** (via `component_pieces` junction table)
- **Components** → **Turbines** (via `component_assignments` junction table)
- **Turbines** have operational metrics (hours, trips, starts)

All relationships use temporal validity tracking (`valid_from`/`valid_to`).

## Development

### Re-seed Database (DEVELOPMENT ONLY)

```typescript
import { reseedDatabase } from '@/lib/storage/db/init';

// Clear and re-seed (for testing with mock data)
// ⚠️ WARNING: Only use in development!
await reseedDatabase();
```

**Important:** 
- Seeding is for **development/testing only**
- Production database should start **empty**
- Real client data will be imported/populated through your application's data import features
- Never auto-seed in production - clients need to start with empty database

### Manual Seeding

```typescript
import { seedDatabase, clearDatabase } from '@/lib/storage/db';

// Clear database
await clearDatabase();

// Seed from mock data
await seedDatabase();
```

## Migration from Old Structure

The old database (version 1) will be automatically upgraded to version 2. Old stores are deleted and new ones are created.

## Component Types

The database supports these 13 component types:
- Liner Caps
- Comb Liners
- Tran PRC
- S1N, S2N, S3N
- S1S, S2S, S3S
- S1B, S2B, S3B
- Rotor

