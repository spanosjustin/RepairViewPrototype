// Direct seed script - updates existing turbines and components with hours/trips/starts
import { open } from 'idb';
import { STORES } from '../src/lib/storage/db/indexedDB.js';

const DB_NAME = 'repairview_db';
const DB_VERSION = 2;

async function seedNow() {
  console.log('Opening database...');
  
  const db = await open(DB_NAME, DB_VERSION);
  
  try {
    // Seed turbines
    console.log('Seeding turbines...');
    const turbineStore = db.transaction(STORES.TURBINES, 'readwrite').objectStore(STORES.TURBINES);
    const turbines = await turbineStore.getAll();
    
    let turbineCount = 0;
    for (const turbine of turbines) {
      const updated = {
        ...turbine,
        hours: turbine.hours ?? (15000 + Math.floor(Math.random() * 10000)),
        trips: turbine.trips ?? (100 + Math.floor(Math.random() * 100)),
        starts: turbine.starts ?? (600 + Math.floor(Math.random() * 600)),
      };
      await turbineStore.put(updated);
      turbineCount++;
    }
    console.log(`✅ Seeded ${turbineCount} turbines`);
    
    // Seed components
    console.log('Seeding components...');
    const componentStore = db.transaction(STORES.COMPONENTS, 'readwrite').objectStore(STORES.COMPONENTS);
    const components = await componentStore.getAll();
    
    let componentCount = 0;
    for (const component of components) {
      const updated = {
        ...component,
        hours: component.hours ?? (5000 + Math.floor(Math.random() * 10000)),
        trips: component.trips ?? (50 + Math.floor(Math.random() * 100)),
        starts: component.starts ?? (300 + Math.floor(Math.random() * 400)),
      };
      await componentStore.put(updated);
      componentCount++;
    }
    console.log(`✅ Seeded ${componentCount} components`);
    
    console.log(`\n🎉 SEEDING COMPLETE!`);
    console.log(`   - ${turbineCount} turbines updated`);
    console.log(`   - ${componentCount} components updated`);
    
    db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    db.close();
    process.exit(1);
  }
}

seedNow();

