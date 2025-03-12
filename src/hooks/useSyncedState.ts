import { useState, useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { syncDataWithSupabase, fetchUserData } from '@/utils/syncHelpers';

type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

interface SyncedStateOptions<T extends Array<U>, U> {
  initialValue: T;
  storageKey: string;
  tableName: string;
  userId: string | null;
  transformForDatabase?: (item: U) => any;
}

export function useSyncedState<T extends Array<U>, U extends { id?: string; user_id?: string }>(
  options: SyncedStateOptions<T, U>
): [T, React.Dispatch<React.SetStateAction<T>>, SyncStatus] {
  const { initialValue, storageKey, tableName, userId, transformForDatabase } = options;
  const [data, setData] = useLocalStorage<T>(storageKey, initialValue);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to send updates to the database
  const syncToDatabase = async (items: T) => {
    if (!userId) {
      setSyncStatus('offline');
      return;
    }

    try {
      setSyncStatus('syncing');
      
      // If we need to transform data before sending to database
      const itemsToSync = transformForDatabase 
        ? items.map(item => transformForDatabase(item)) 
        : items;
      
      const result = await syncDataWithSupabase(tableName, itemsToSync, userId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      setSyncStatus('synced');
    } catch (error) {
      console.error(`Error syncing ${tableName} to database:`, error);
      setSyncStatus('error');
    }
  };

  // When data changes, debounce and sync to database
  useEffect(() => {
    // Clear previous timeout if it exists
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    
    // Only sync if we have a userId
    if (userId) {
      // Set new timeout to sync data after 2 seconds of inactivity
      const timeout = setTimeout(() => {
        syncToDatabase(data);
      }, 2000);
      
      setSyncTimeout(timeout);
    }
    
    // Clean up timeout on unmount
    return () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [data, userId]);

  // Initial fetch from database
  useEffect(() => {
    const fetchFromDatabase = async () => {
      if (!userId) return;
      
      try {
        const result = await fetchUserData<U>(tableName, userId);
        
        if (result.error) {
          throw new Error(result.error);
        }
        
        if (result.data && result.data.length > 0) {
          setData(result.data as unknown as T);
        }
        
        setSyncStatus('synced');
      } catch (error) {
        console.error(`Error fetching ${tableName} from database:`, error);
        setSyncStatus('error');
      }
    };
    
    fetchFromDatabase();
  }, [userId, tableName]);

  return [data, setData, syncStatus];
} 