const QUEUE_KEY = 'gac_offline_queue';
const CACHE_KEY_PREFIX = 'gac_cache_';

function readQueue() {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('[offlineQueue] Failed to write to localStorage (possibly full):', err);
  }
}

// type: 'recky_expense' | 'budget_item' | 'logistics_item'
export function addToQueue(type, eventId, payload) {
  const queue = readQueue();
  const entry = {
    id: crypto.randomUUID(),
    type,
    eventId,
    payload,
    createdAt: new Date().toISOString(),
    status: 'pending',
    errorMessage: null,
  };
  queue.push(entry);
  writeQueue(queue);
  return entry;
}

export function getQueueForEvent(eventId, type) {
  return readQueue().filter((q) => q.eventId === eventId && (!type || q.type === type));
}

export function getQueueCount() {
  return readQueue().length;
}

export function removeFromQueue(id) {
  writeQueue(readQueue().filter((q) => q.id !== id));
}

function updateQueueItem(id, updates) {
  const queue = readQueue();
  const idx = queue.findIndex((q) => q.id === id);
  if (idx === -1) return;
  queue[idx] = { ...queue[idx], ...updates };
  writeQueue(queue);
}

// Routes each queued entry to its real endpoint. A genuine server rejection
// (validation error, etc.) marks the entry 'failed' with the reason so the
// person can see why, rather than it silently retrying forever. A network
// failure (no response at all — still offline) just leaves it 'pending'.
export async function flushQueue(api) {
  const queue = readQueue();
  const pending = queue.filter((q) => q.status === 'pending' || q.status === 'failed');

  let synced = 0;
  let failed = 0;

  for (const entry of pending) {
    try {
      if (entry.type === 'recky_expense') {
        await api.post(`/recky/events/${entry.eventId}/expenses`, entry.payload);
      } else if (entry.type === 'budget_item') {
        await api.post(`/budget/events/${entry.eventId}`, entry.payload);
      } else if (entry.type === 'logistics_item') {
        await api.post(`/logistics/events/${entry.eventId}`, entry.payload);
      }
      removeFromQueue(entry.id);
      synced++;
    } catch (err) {
      if (err.response) {
        updateQueueItem(entry.id, {
          status: 'failed',
          errorMessage: err.response?.data?.message || 'Server rejected this entry.',
        });
        failed++;
      }
      // else: no response = still offline, leave as pending for the next retry
    }
  }

  return { synced, failed };
}

// Simple read-through cache so forms that NEED server data (like the event
// picker dropdown) still work offline, as long as they loaded successfully
// at least once before signal was lost.
export function cacheData(key, data) {
  try {
    localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('[offlineQueue] Failed to cache data:', err);
  }
}

export function getCachedData(key) {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}