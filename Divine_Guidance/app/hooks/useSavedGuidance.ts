'use client';

import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { SavedGuidance } from '../types';

const STORAGE_KEY = 'divine-guidance-history';

/**
 * Domain-specific hook for managing saved guidance entries.
 * Provides CRUD operations and reactive state updates.
 */
export function useSavedGuidance() {
    const [savedGuidance, setSavedGuidance] = useLocalStorage<SavedGuidance[]>(
        STORAGE_KEY,
        []
    );

    /**
     * Save a new guidance entry to history
     */
    const saveGuidance = useCallback(
        (entry: Omit<SavedGuidance, 'id' | 'timestamp'>) => {
            const newEntry: SavedGuidance = {
                ...entry,
                id: Date.now().toString(),
                timestamp: Date.now(),
            };

            setSavedGuidance((prev) => [newEntry, ...prev]);
            return newEntry;
        },
        [setSavedGuidance]
    );

    /**
     * Delete a guidance entry by ID
     */
    const deleteGuidance = useCallback(
        (id: string) => {
            setSavedGuidance((prev) => prev.filter((item) => item.id !== id));
        },
        [setSavedGuidance]
    );

    /**
     * Get a specific guidance entry by ID
     */
    const getGuidance = useCallback(
        (id: string): SavedGuidance | undefined => {
            return savedGuidance.find((item) => item.id === id);
        },
        [savedGuidance]
    );

    /**
     * Clear all saved guidance entries
     */
    const clearAll = useCallback(() => {
        setSavedGuidance([]);
    }, [setSavedGuidance]);

    return {
        savedGuidance,
        saveGuidance,
        deleteGuidance,
        getGuidance,
        clearAll,
        count: savedGuidance.length,
    };
}
