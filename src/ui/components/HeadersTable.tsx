import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { CopyableText } from './CopyableText';

interface HeadersTableProps {
  headers: Record<string, string>;
  onCopied?: () => void;
}

export function HeadersTable({ headers, onCopied }: HeadersTableProps) {
  const entries = Object.entries(headers);

  if (entries.length === 0) {
    return <Text style={styles.empty}>No headers</Text>;
  }

  return (
    <View style={styles.container}>
      {entries.map(([key, value], i) => (
        <CopyableText key={key} text={`${key}: ${value}`} onCopied={onCopied}>
          <View style={[styles.row, i % 2 === 0 && styles.rowEven]}>
            <Text style={styles.key} numberOfLines={1}>{key}</Text>
            <Text style={styles.value} numberOfLines={2}>{value}</Text>
          </View>
        </CopyableText>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  rowEven: {
    backgroundColor: colors.surface,
  },
  key: {
    color: colors.jsonKey,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    ...typography.mono,
    width: '40%',
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    ...typography.mono,
    flex: 1,
  },
  empty: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    padding: spacing.md,
  },
});
