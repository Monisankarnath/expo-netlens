import { useSyncExternalStore } from 'react';
import { TrafficRecord } from '../../core/models/TrafficRecord';
import { TrafficStore } from '../../core/storage/TrafficStore';

export function useTrafficStore(store: TrafficStore): readonly TrafficRecord[] {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getRecords(),
    () => store.getRecords(),
  );
}
