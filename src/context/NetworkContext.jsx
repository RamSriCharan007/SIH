import React, { createContext, useContext, useState, useEffect } from 'react';
import { openDB, getAllFromStore, saveToStore, clearStore } from '../utils/db';

const NetworkContext = createContext();

export function NetworkProvider({ children }) {
  // Simulated mode: 'online', 'weak_2g', or 'offline'
  const [networkMode, setNetworkMode] = useState('online');
  const [isActuallyOnline, setIsActuallyOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(null);

  // Sync effective network status
  const isOnline = networkMode === 'online' && isActuallyOnline;
  const is2G = networkMode === 'weak_2g';
  const isOffline = networkMode === 'offline' || !isActuallyOnline;

  useEffect(() => {
    const handleOnline = () => setIsActuallyOnline(true);
    const handleOffline = () => setIsActuallyOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check of offline queue
    refreshQueueCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // When network comes back online, prompt or trigger auto-sync
  useEffect(() => {
    if (isOnline && offlineQueueCount > 0) {
      triggerSync();
    }
  }, [isOnline]);

  const refreshQueueCount = async () => {
    try {
      const queue = await getAllFromStore('asha_queue');
      setOfflineQueueCount(queue.length);
    } catch (e) {
      console.warn("DB queue read error:", e);
    }
  };

  const queueOfflineAshaRecord = async (record) => {
    try {
      await saveToStore('asha_queue', record);
      await refreshQueueCount();
      return true;
    } catch (e) {
      console.error("Failed to queue offline record", e);
      return false;
    }
  };

  const triggerSync = async () => {
    if (isOffline) {
      alert("Cannot sync while in Offline Mode. Switch to Online Mode first.");
      return;
    }

    setIsSyncing(true);
    try {
      const queue = await getAllFromStore('asha_queue');
      if (queue.length === 0) {
        setIsSyncing(false);
        setSyncSuccessMsg("All records are already synced with District Server.");
        setTimeout(() => setSyncSuccessMsg(null), 4000);
        return;
      }

      // Send to server
      const response = await fetch('/api/sync/asha-batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'asha'
        },
        body: JSON.stringify({ newRecords: queue })
      });

      if (response.ok) {
        await clearStore('asha_queue');
        await refreshQueueCount();
        setSyncSuccessMsg(`Successfully synchronized ${queue.length} rural health records to Govt Server!`);
        setTimeout(() => setSyncSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.warn("Sync error, will retry:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <NetworkContext.Provider
      value={{
        networkMode,
        setNetworkMode,
        isOnline,
        is2G,
        isOffline,
        offlineQueueCount,
        refreshQueueCount,
        queueOfflineAshaRecord,
        triggerSync,
        isSyncing,
        syncSuccessMsg
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => useContext(NetworkContext);
