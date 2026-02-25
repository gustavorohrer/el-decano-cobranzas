
import React from 'react';
import { AppState } from '../types';
import { DataRepository } from '../services/dataRepository';
import { StorageService } from '../services/storage';

/**
 * useAppState Hook
 *
 * Custom hook to manage the global application state.
 * It encapsulates data fetching from the Repository and network status monitoring.
 * As requested, Supabase is treated as the primary source of truth.
 */
export const useAppState = () => {
  const [appState, setAppState] = React.useState<AppState>({
    user: StorageService.getCurrentUser(),
    members: [],
    payments: [],
    movements: [],
    membershipRates: [],
    panels: [],
    advertisingContracts: [],
    advertisingRates: [],
    clubConfig: {
      president: { full_name: '', dni: '', civil_status: '', address: '' },
      collectors: []
    },
    isOffline: !navigator.onLine,
    syncQueue: [],
  });

  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(async (year: number = 2026) => {
    setIsLoading(true);
    try {
      const remoteData = await DataRepository.getInitialState(year);

      setAppState(prev => ({
        ...prev,
        ...remoteData,
        // syncQueue is handled locally for now as part of the offline strategy
        syncQueue: StorageService.getData().syncQueue
      }));
    } catch (error) {
      console.error('Failed to load application data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Initial data load
    loadData();

    // Network status listeners
    const handleOnline = () => {
      setAppState(prev => ({ ...prev, isOffline: false }));
    };
    const handleOffline = () => {
      setAppState(prev => ({ ...prev, isOffline: true }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [loadData]);

  /**
   * Triggers a manual data refresh from the source of truth.
   */
  const refreshData = React.useCallback(() => {
    return loadData();
  }, [loadData]);

  return {
    appState,
    setAppState,
    isLoading,
    refreshData
  };
};
