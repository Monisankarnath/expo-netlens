import { useMemo } from 'react';
import { LogEntry, LogLevel } from '../../core/models/LogEntry';

export interface LogFilter {
  searchText?: string;
  levels?: LogLevel[];
}

export function useFilteredLogs(
  entries: readonly LogEntry[],
  filter: LogFilter
): readonly LogEntry[] {
  return useMemo(() => {
    let result = entries;

    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      result = result.filter(e =>
        e.preview.toLowerCase().includes(search) ||
        e.args.some(a => a.toLowerCase().includes(search))
      );
    }

    if (filter.levels?.length) {
      result = result.filter(e => filter.levels!.includes(e.level));
    }

    return result;
  }, [entries, filter]);
}
