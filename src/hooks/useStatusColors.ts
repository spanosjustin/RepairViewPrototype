/**
 * Hook to manage status/state color settings
 * Uses IndexedDB for now, will migrate to Supabase later
 */
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { statusColorStorage, type StatusColorSetting } from '@/lib/storage/indexedDB';
import { DEFAULT_STATUS_COLORS } from '@/lib/storage/defaults';

const QUERY_KEY = ['status-colors'] as const;

/**
 * Get all color settings
 */
export function useStatusColors() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const settings = await statusColorStorage.getAll();
      // If empty, return defaults (but don't save them yet)
      return settings.length > 0 ? settings : DEFAULT_STATUS_COLORS;
    },
    staleTime: Infinity, // IndexedDB doesn't change unless we update it
    gcTime: Infinity, // Keep in cache forever
  });
}

/**
 * Get color settings by type
 */
export function useStatusColorsByType(type: 'status' | 'state') {
  const { data: allSettings = [] } = useStatusColors();
  return allSettings.filter(s => s.type === type);
}

/**
 * Get a specific color setting
 */
export function useStatusColor(value: string, type: 'status' | 'state') {
  const { data: allSettings = [] } = useStatusColors();
  return allSettings.find(s => s.value === value && s.type === type) || null;
}

/**
 * Hook to save/update a color setting
 */
export function useUpdateStatusColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (setting: StatusColorSetting) => {
      const success = await statusColorStorage.save(setting);
      if (!success) {
        throw new Error('Failed to save color setting');
      }
      return setting;
    },
    onMutate: async (newSetting) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<StatusColorSetting[]>(QUERY_KEY);

      // Optimistically update to the new value
      queryClient.setQueryData<StatusColorSetting[]>(QUERY_KEY, (old = []) => {
        // Handle case where old might be DEFAULT_STATUS_COLORS (from queryFn)
        const current = Array.isArray(old) ? old : [];
        const filtered = current.filter(
          s => !(s.value.toLowerCase() === newSetting.value.toLowerCase() && s.type === newSetting.type)
        );
        return [...filtered, newSetting];
      });

      // Return a context object with the snapshotted value
      return { previousSettings };
    },
    onError: (err, newSetting, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSettings) {
        queryClient.setQueryData(QUERY_KEY, context.previousSettings);
      }
    },
    onSuccess: () => {
      // Optimistic update already handled the UI, just mark as successful
      // No need to refetch since we already updated the cache
    },
  });
}

/**
 * Hook to save multiple color settings at once
 */
export function useUpdateStatusColors() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: StatusColorSetting[]) => {
      const success = await statusColorStorage.saveAll(settings);
      if (!success) {
        throw new Error('Failed to save color settings');
      }
      return settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

/**
 * Hook to delete a color setting
 */
export function useDeleteStatusColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ value, type }: { value: string; type: 'status' | 'state' }) => {
      const success = await statusColorStorage.delete(value, type);
      if (!success) {
        throw new Error('Failed to delete color setting');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

