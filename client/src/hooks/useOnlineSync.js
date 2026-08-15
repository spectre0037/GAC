import { useEffect, useState, useCallback } from 'react';
import { flushQueue, getQueueCount } from '@/lib/offlineQueue';
import api from '@/lib/axios';

// onSyncComplete is called after every flush attempt (success or partial)
// so the calling dashboard can refetch its real data once entries land.
export function useOnlineSync(onSyncComplete) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getQueueCount());
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(() => setPendingCount(getQueueCount()), []);

  const sync = useCallback(async () => {
    if (!navigator.onLine) return;
    setSyncing(true);
    const result = await flushQueue(api);
    refreshCount();
    setSyncing(false);
    if (result.synced > 0 && onSyncComplete) onSyncComplete(result);
  }, [refreshCount, onSyncComplete]);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
      sync();
    }
    function handleOffline() {
      setIsOnline(false);
      refreshCount();
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Catch anything left over from a partial sync, every 30s while online
    const interval = setInterval(() => {
      if (navigator.onLine) sync();
    }, 30000);

    if (navigator.onLine) sync();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isOnline, pendingCount, syncing, manualSync: sync, refreshCount };
}