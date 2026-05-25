import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet, ActionSheetIOS, Alert, Platform } from 'react-native';
// Optional expo-clipboard with graceful fallback
let _setStringAsync: ((text: string) => Promise<boolean>) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('expo-clipboard');
  if (mod?.setStringAsync) _setStringAsync = mod.setStringAsync;
} catch {}
async function setStringAsync(text: string): Promise<void> {
  if (_setStringAsync) { try { await _setStringAsync(text); return; } catch {} }
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }
}
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { TrafficRow } from '../components/TrafficRow';
import { EmptyState } from '../components/EmptyState';
import { TrafficRecord } from '../../core/models/TrafficRecord';
import { TrafficFilter } from '../../core/models/TrafficFilter';
import { HTTPMethod, METHOD_COLORS } from '../../core/models/HTTPMethod';
import { useFilteredTraffic } from '../hooks/useFilteredTraffic';
import { TrafficStats, computeStats } from '../../core/storage/TrafficStatistics';
import { formatToCurl } from '../../core/formatters/CURLFormatter';
import { formatBytes } from '../../core/utils/bodyParser';

const METHOD_CHIPS = (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HTTPMethod[]).map(m => ({
  label: m,
  value: m,
  color: METHOD_COLORS[m],
}));

// ---------------------------------------------------------------------------
// Private: StatsBar component
// ---------------------------------------------------------------------------

interface StatsBarProps {
  stats: TrafficStats;
}

function StatsBar({ stats }: StatsBarProps) {
  return (
    <View style={styles.statsBar}>
      <Text style={styles.stat}>{stats.total} requests</Text>
      {stats.failed > 0 && <Text style={[styles.stat, styles.statError]}>{stats.failed} errors</Text>}
      {stats.avgDuration > 0 && <Text style={styles.stat}>avg {stats.avgDuration}ms</Text>}
      {stats.totalSize > 0 && <Text style={styles.stat}>{formatBytes(stats.totalSize)}</Text>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Private: useTrafficRowMenu hook
// ---------------------------------------------------------------------------

function useTrafficRowMenu(showToast: () => void) {
  return useCallback((record: TrafficRecord) => {
    const actions = [
      {
        label: 'Copy as cURL',
        onPress: async () => {
          await setStringAsync(formatToCurl(record));
          showToast();
        },
      },
      {
        label: 'Copy URL',
        onPress: async () => {
          await setStringAsync(record.request.url);
          showToast();
        },
      },
    ];
    if (record.response?.body) {
      actions.push({
        label: 'Copy Response Body',
        onPress: async () => {
          await setStringAsync(record.response!.body!);
          showToast();
        },
      });
    }
    // Show menu
    if (Platform.OS === 'ios') {
      const labels = actions.map(a => a.label);
      labels.push('Cancel');
      ActionSheetIOS.showActionSheetWithOptions(
        { options: labels, cancelButtonIndex: labels.length - 1 },
        (index: number) => { if (index < actions.length) actions[index].onPress(); }
      );
    } else {
      Alert.alert('Actions', undefined, [
        ...actions.map(a => ({ text: a.label, onPress: a.onPress })),
        { text: 'Cancel', style: 'cancel' as const },
      ]);
    }
  }, [showToast]);
}

// ---------------------------------------------------------------------------
// TrafficListScreen
// ---------------------------------------------------------------------------

interface TrafficListScreenProps {
  records: readonly TrafficRecord[];
  onSelectRecord: (record: TrafficRecord) => void;
  onClear: () => void;
  showToast: () => void;
}

export function TrafficListScreen({ records, onSelectRecord, onClear, showToast }: TrafficListScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedMethods, setSelectedMethods] = useState<string[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  const filter: TrafficFilter = useMemo(() => ({
    searchText: searchText || undefined,
    methods: selectedMethods.length > 0 ? selectedMethods as HTTPMethod[] : undefined,
    onlyErrors: showErrors || undefined,
  }), [searchText, selectedMethods, showErrors]);

  const filtered = useFilteredTraffic(records, filter);
  const stats = useMemo(() => computeStats(records), [records]);
  const maxDuration = useMemo(
    () => Math.max(...records.map(r => r.timings.duration ?? 0), 1),
    [records],
  );

  const handleToggleMethod = useCallback((method: string) => {
    setSelectedMethods(prev =>
      prev.includes(method) ? prev.filter(m => m !== method) : [...prev, method]
    );
  }, []);

  const handleLongPress = useTrafficRowMenu(showToast);

  const renderItem = useCallback(({ item, index }: { item: TrafficRecord; index: number }) => (
    <TrafficRow
      record={item}
      onPress={onSelectRecord}
      onLongPress={handleLongPress}
      isEven={index % 2 === 0}
      maxDuration={maxDuration}
    />
  ), [onSelectRecord, handleLongPress, maxDuration]);

  const keyExtractor = useCallback((item: TrafficRecord) => item.id, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Traffic</Text>
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearText}>{'\uD83D\uDDD1'}</Text>
        </Pressable>
      </View>

      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search URL, method, status..." />

      <View style={styles.filterRow}>
        <FilterChips chips={METHOD_CHIPS} selected={selectedMethods} onToggle={handleToggleMethod} />
        <Pressable onPress={() => setShowErrors(!showErrors)} style={[styles.errorChip, showErrors && styles.errorChipActive]}>
          <Text style={[styles.errorChipText, showErrors && styles.errorChipTextActive]}>Errors</Text>
        </Pressable>
      </View>

      {/* Stats bar */}
      <StatsBar stats={stats} />

      {/* List */}
      <FlatList
        data={filtered as TrafficRecord[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No network traffic"
            subtitle="Make some fetch or XHR calls to see them here"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    ...typography.mono,
  },
  clearButton: {
    padding: spacing.xs,
    borderRadius: 4,
  },
  clearText: { fontSize: typography.sizes.md, color: colors.textSecondary },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  errorChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.md,
  },
  errorChipActive: {
    backgroundColor: colors.clientError + '28',
    borderColor: colors.clientError,
  },
  errorChipText: { color: colors.textSecondary, fontSize: typography.sizes.xs, ...typography.mono },
  errorChipTextActive: { color: colors.clientError },
  statsBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stat: { color: colors.textTertiary, fontSize: typography.sizes.xs, ...typography.mono },
  statError: { color: colors.clientError },
  list: { flex: 1 },
});
