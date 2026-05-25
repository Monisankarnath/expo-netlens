import { TrafficRecord } from '../models/TrafficRecord';

export interface TrafficStats {
  total: number;
  pending: number;
  completed: number;
  failed: number;
  mocked: number;
  avgDuration: number;
  totalSize: number;
}

export function computeStats(records: readonly TrafficRecord[]): TrafficStats {
  let pending = 0, completed = 0, failed = 0, mocked = 0;
  let totalDuration = 0, durationCount = 0, totalSize = 0;

  for (const record of records) {
    switch (record.status) {
      case 'pending': pending++; break;
      case 'completed': completed++; break;
      case 'failed': failed++; break;
      case 'mocked': mocked++; break;
    }
    if (record.timings.duration) {
      totalDuration += record.timings.duration;
      durationCount++;
    }
    if (record.response) {
      totalSize += record.response.bodySize;
    }
  }

  return {
    total: records.length,
    pending,
    completed,
    failed,
    mocked,
    avgDuration: durationCount > 0 ? Math.round(totalDuration / durationCount) : 0,
    totalSize,
  };
}
