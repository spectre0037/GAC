export default function SyncStatusBadge({ isOnline, pendingCount, syncing, onSync }) {
  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
      <span className={`h-2 w-2 shrink-0 rounded-full ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
      <span>
        {isOnline ? 'Online' : 'Offline — entries will save on this device'}
        {pendingCount > 0 && ` · ${pendingCount} entr${pendingCount === 1 ? 'y' : 'ies'} waiting to sync`}
      </span>
      {isOnline && pendingCount > 0 && (
        <button type="button" onClick={onSync} disabled={syncing} className="ml-auto text-xs text-primary underline">
          {syncing ? 'Syncing...' : 'Sync now'}
        </button>
      )}
    </div>
  );
}