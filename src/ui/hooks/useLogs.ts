import { useSyncExternalStore } from 'react';
import { LogEntry } from '../../core/models/LogEntry';
import { LogStore } from '../../core/storage/LogStore';

export function useLogs(store: LogStore): readonly LogEntry[] {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getEntries(),
    () => store.getEntries(),
  );
}
