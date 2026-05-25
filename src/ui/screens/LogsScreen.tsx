import React, { useState, useCallback, useMemo } from 'react';
import { View, FlatList, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { SearchBar } from '../components/SearchBar';
import { FilterChips } from '../components/FilterChips';
import { LogRow } from '../components/LogRow';
import { EmptyState } from '../components/EmptyState';
import { LogEntry, LogLevel } from '../../core/models/LogEntry';
import { useFilteredLogs, LogFilter } from '../hooks/useFilteredLogs';

const LEVEL_CHIPS = [
  { label: 'Log', value: 'log', color: colors.logDefault },
  { label: 'Info', value: 'info', color: colors.logInfo },
  { label: 'Warn', value: 'warn', color: colors.logWarn },
  { label: 'Error', value: 'error', color: colors.logError },
  { label: 'Debug', value: 'debug', color: colors.logDebug },
];

interface LogsScreenProps {
  entries: readonly LogEntry[];
  onSelectEntry: (entry: LogEntry) => void;
  onClear: () => void;
}

export function LogsScreen({ entries, onSelectEntry, onClear }: LogsScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);

  const filter: LogFilter = useMemo(() => ({
    searchText: searchText || undefined,
    levels: selectedLevels.length > 0 ? selectedLevels as LogLevel[] : undefined,
  }), [searchText, selectedLevels]);

  const filtered = useFilteredLogs(entries, filter);

  const handleToggleLevel = useCallback((level: string) => {
    setSelectedLevels(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  }, []);

  const renderItem = useCallback(({ item }: { item: LogEntry }) => (
    <LogRow entry={item} onPress={onSelectEntry} />
  ), [onSelectEntry]);

  const keyExtractor = useCallback((item: LogEntry) => item.id, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs</Text>
        <Pressable onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearText}>{'\uD83D\uDDD1'}</Text>
        </Pressable>
      </View>

      <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search logs..." />
      <FilterChips chips={LEVEL_CHIPS} selected={selectedLevels} onToggle={handleToggleLevel} />

      <FlatList
        data={filtered as LogEntry[]}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="No console logs"
            subtitle="Use console.log(), console.warn(), etc. to see them here"
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
  clearButton: { padding: spacing.xs, borderRadius: 4 },
  clearText: { fontSize: typography.sizes.md, color: colors.textSecondary },
  list: { flex: 1 },
});
