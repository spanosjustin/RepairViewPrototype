/**
 * Maps status/state values to color tones and Tailwind classes
 * Uses IndexedDB settings with fallback to defaults
 */
import type { StatusColorSetting } from '@/lib/storage/indexedDB';
import { DEFAULT_STATUS_COLORS } from '@/lib/storage/defaults';

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral';

/**
 * Normalize a string for comparison
 */
function norm(s: unknown): string {
  return String(s ?? '').trim().toLowerCase();
}

/**
 * Get tone from settings or fallback to hardcoded logic
 */
export function getTone(
  value: string,
  type: 'status' | 'state',
  settings: StatusColorSetting[] = []
): Tone {
  // Try to find in settings first
  const setting = settings.find(s => 
    norm(s.value) === norm(value) && s.type === type
  );
  
  if (setting) {
    return setting.tone;
  }

  // Fallback to hardcoded logic (original behavior)
  const normalized = norm(value);
  
  if (type === 'status') {
    if (['ok', 'good', 'healthy', 'active'].includes(normalized)) return 'ok';
    if (['warning', 'degraded', 'service soon', 'monitor', 'replace soon'].includes(normalized)) return 'warn';
    if (['failed', 'fault', 'bad', 'down', 'out of service', 'replace now'].includes(normalized)) return 'bad';
    if (['spare'].includes(normalized)) return 'info';
    return 'neutral';
  } else {
    // state
    if (['spare', 'standby', 'stock'].includes(normalized)) return 'info';
    if (['installed', 'running', 'active', 'in service'].includes(normalized)) return 'ok';
    if (['repair', 'rma', 'maintenance', 'in shop'].includes(normalized)) return 'warn';
    if (['out of service'].includes(normalized)) return 'bad';
    return 'neutral';
  }
}

/**
 * Get color name from settings for a value
 */
export function getColorName(
  value: string,
  type: 'status' | 'state',
  settings: StatusColorSetting[] = []
): string | undefined {
  const setting = settings.find(s => 
    norm(s.value) === norm(value) && s.type === type
  );
  
  return setting?.bg_color;
}

/**
 * Get background color classes for a cell/box based on color name
 */
export function getCellBackgroundClasses(colorName: string): string {
  const colorMap: Record<string, { bg: string; text: string }> = {
    // Reds
    red: { bg: 'bg-red-100', text: 'text-red-800' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-800' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800' },
    // Oranges
    orange: { bg: 'bg-orange-100', text: 'text-orange-800' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-800' },
    coral: { bg: 'bg-orange-100', text: 'text-orange-800' },
    // Yellows
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    gold: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    cream: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    // Greens
    green: { bg: 'bg-green-100', text: 'text-green-800' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800' },
    lime: { bg: 'bg-lime-100', text: 'text-lime-800' },
    // Blues
    blue: { bg: 'bg-blue-100', text: 'text-blue-800' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-800' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    // Purples
    purple: { bg: 'bg-purple-100', text: 'text-purple-800' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-800' },
    fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
    // Grays
    gray: { bg: 'bg-gray-100', text: 'text-gray-800' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-800' },
    stone: { bg: 'bg-stone-100', text: 'text-stone-800' },
  };
  
  const colors = colorMap[colorName.toLowerCase()] || colorMap.gray;
  return `${colors.bg} ${colors.text}`;
}

/**
 * Map color name to Tailwind badge classes
 */
function getColorBadgeClasses(colorName: string): string {
  const baseClasses = 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium';
  
  const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string }> = {
    // Reds
    red: { bg: 'bg-red-100', text: 'text-red-800', darkBg: 'dark:bg-red-950/40', darkText: 'dark:text-red-300' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-800', darkBg: 'dark:bg-rose-950/40', darkText: 'dark:text-rose-300' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800', darkBg: 'dark:bg-pink-950/40', darkText: 'dark:text-pink-300' },
    // Oranges
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'dark:bg-orange-950/40', darkText: 'dark:text-orange-300' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-800', darkBg: 'dark:bg-amber-950/40', darkText: 'dark:text-amber-300' },
    coral: { bg: 'bg-orange-100', text: 'text-orange-800', darkBg: 'dark:bg-orange-950/40', darkText: 'dark:text-orange-300' },
    // Yellows
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-950/40', darkText: 'dark:text-yellow-300' },
    gold: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-950/40', darkText: 'dark:text-yellow-300' },
    cream: { bg: 'bg-yellow-100', text: 'text-yellow-800', darkBg: 'dark:bg-yellow-950/40', darkText: 'dark:text-yellow-300' },
    // Greens
    green: { bg: 'bg-green-100', text: 'text-green-800', darkBg: 'dark:bg-green-950/40', darkText: 'dark:text-green-300' },
    emerald: { bg: 'bg-emerald-100', text: 'text-emerald-800', darkBg: 'dark:bg-emerald-950/40', darkText: 'dark:text-emerald-300' },
    lime: { bg: 'bg-lime-100', text: 'text-lime-800', darkBg: 'dark:bg-lime-950/40', darkText: 'dark:text-lime-300' },
    // Blues
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', darkBg: 'dark:bg-blue-950/40', darkText: 'dark:text-blue-300' },
    sky: { bg: 'bg-sky-100', text: 'text-sky-800', darkBg: 'dark:bg-sky-950/40', darkText: 'dark:text-sky-300' },
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-800', darkBg: 'dark:bg-indigo-950/40', darkText: 'dark:text-indigo-300' },
    // Purples
    purple: { bg: 'bg-purple-100', text: 'text-purple-800', darkBg: 'dark:bg-purple-950/40', darkText: 'dark:text-purple-300' },
    violet: { bg: 'bg-violet-100', text: 'text-violet-800', darkBg: 'dark:bg-violet-950/40', darkText: 'dark:text-violet-300' },
    fuchsia: { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', darkBg: 'dark:bg-fuchsia-950/40', darkText: 'dark:text-fuchsia-300' },
    // Grays
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', darkBg: 'dark:bg-gray-950/40', darkText: 'dark:text-gray-300' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-800', darkBg: 'dark:bg-slate-950/40', darkText: 'dark:text-slate-300' },
    stone: { bg: 'bg-stone-100', text: 'text-stone-800', darkBg: 'dark:bg-stone-950/40', darkText: 'dark:text-stone-300' },
  };
  
  const colors = colorMap[colorName.toLowerCase()] || colorMap.gray;
  return `${baseClasses} ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`;
}

/**
 * Get Tailwind classes for a tone (with optional custom color)
 */
export function getBadgeClasses(tone: Tone, colorName?: string): string {
  // If we have a custom color name, use it
  if (colorName) {
    return getColorBadgeClasses(colorName);
  }
  
  // Otherwise use tone-based defaults
  switch (tone) {
    case 'ok':
      return 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'warn':
      return 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
    case 'bad':
      return 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
    case 'info':
      return 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300';
    default:
      return 'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium bg-muted text-foreground/80 dark:bg-muted/60';
  }
}

/**
 * Map color name to Tailwind border classes
 */
function getColorBorderClass(colorName: string): string {
  const colorMap: Record<string, string> = {
    // Reds
    red: 'border-l-4 border-red-500',
    rose: 'border-l-4 border-rose-500',
    pink: 'border-l-4 border-pink-500',
    // Oranges
    orange: 'border-l-4 border-orange-500',
    amber: 'border-l-4 border-amber-500',
    coral: 'border-l-4 border-orange-400',
    // Yellows
    yellow: 'border-l-4 border-yellow-500',
    gold: 'border-l-4 border-yellow-400',
    cream: 'border-l-4 border-yellow-300',
    // Greens
    green: 'border-l-4 border-green-500',
    emerald: 'border-l-4 border-emerald-500',
    lime: 'border-l-4 border-lime-500',
    // Blues
    blue: 'border-l-4 border-blue-500',
    sky: 'border-l-4 border-sky-500',
    indigo: 'border-l-4 border-indigo-500',
    // Purples
    purple: 'border-l-4 border-purple-500',
    violet: 'border-l-4 border-violet-500',
    fuchsia: 'border-l-4 border-fuchsia-500',
    // Grays
    gray: 'border-l-4 border-gray-400',
    slate: 'border-l-4 border-slate-400',
    stone: 'border-l-4 border-stone-400',
  };
  
  return colorMap[colorName.toLowerCase()] || 'border-l-4 border-transparent';
}

/**
 * Get border stripe class for a tone (with optional custom color)
 */
export function getRowStripeClass(tone: Tone, colorName?: string): string {
  // If we have a custom color name, use it
  if (colorName) {
    return getColorBorderClass(colorName);
  }
  
  // Otherwise use tone-based defaults
  switch (tone) {
    case 'ok':
      return 'border-l-4 border-emerald-500';
    case 'warn':
      return 'border-l-4 border-amber-500';
    case 'bad':
      return 'border-l-4 border-rose-600';
    default:
      return 'border-l-4 border-transparent';
  }
}

