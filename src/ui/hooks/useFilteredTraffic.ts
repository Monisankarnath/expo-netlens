import { useMemo } from 'react';
import { TrafficRecord } from '../../core/models/TrafficRecord';
import { TrafficFilter } from '../../core/models/TrafficFilter';
import { getStatusCategory } from '../../core/models/StatusCategory';

export function useFilteredTraffic(
  records: readonly TrafficRecord[],
  filter: TrafficFilter
): readonly TrafficRecord[] {
  return useMemo(() => {
    let result = records;

    if (filter.searchText) {
      const search = filter.searchText.toLowerCase();
      result = result.filter(r =>
        r.request.url.toLowerCase().includes(search) ||
        r.request.method.toLowerCase().includes(search) ||
        r.response?.statusCode?.toString().includes(search)
      );
    }

    if (filter.methods?.length) {
      result = result.filter(r => filter.methods!.includes(r.request.method));
    }

    if (filter.statusCategories?.length) {
      result = result.filter(r => {
        if (!r.response) return false;
        return filter.statusCategories!.includes(getStatusCategory(r.response.statusCode));
      });
    }

    if (filter.hosts?.length) {
      result = result.filter(r => {
        try {
          const host = new URL(r.request.url).hostname;
          return filter.hosts!.includes(host);
        } catch {
          return false;
        }
      });
    }

    if (filter.contentTypes?.length) {
      result = result.filter(r =>
        r.request.contentType && filter.contentTypes!.includes(r.request.contentType)
      );
    }

    if (filter.onlyErrors) {
      result = result.filter(r => r.status === 'failed' || (r.response && r.response.statusCode >= 400));
    }

    if (filter.onlyMocked) {
      result = result.filter(r => r.isMocked);
    }

    return result;
  }, [records, filter]);
}
