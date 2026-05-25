import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { LogLevelBadge } from '../components/LogLevelBadge';
import { CopyableText } from '../components/CopyableText';
import { LogEntry, ColoredArgData } from '../../core/models/LogEntry';

interface LogDetailScreenProps {
  entry: LogEntry;
  onBack: () => void;
  showToast: () => void;
}

export function LogDetailScreen({ entry, onBack, showToast }: LogDetailScreenProps) {
  const time = new Date(entry.timestamp);
  const timeStr = time.toLocaleString();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </Pressable>
        <LogLevelBadge level={entry.level} />
        {entry.prefixColor && (
          <View style={[styles.prefixDot, { backgroundColor: entry.prefixColor }]} />
        )}
        <Text style={styles.time}>{timeStr}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Arguments ({entry.coloredArgs.length})</Text>
        {entry.coloredArgs.map((arg, index) => (
          <CopyableText key={index} text={arg.value} onCopied={showToast}>
            <View style={styles.argBlock}>
              <View style={styles.argHeader}>
                <View style={[styles.typeBadge, { backgroundColor: arg.color + '20' }]}>
                  <Text style={[styles.typeText, { color: arg.color }]}>{arg.type}</Text>
                </View>
                <Text style={styles.argIndex}>#{index}</Text>
              </View>
              <Text style={[styles.argText, { color: arg.color }]} selectable>
                {formatArgForDetail(arg)}
              </Text>
            </View>
          </CopyableText>
        ))}

        {entry.stackTrace && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Stack Trace</Text>
            <CopyableText text={entry.stackTrace} onCopied={showToast}>
              <View style={styles.stackBlock}>
                <Text style={styles.stackText} selectable>{entry.stackTrace}</Text>
              </View>
            </CopyableText>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/** Format an arg for the detail view — pretty-print objects, wrap strings in quotes */
function formatArgForDetail(arg: ColoredArgData): string {
  switch (arg.type) {
    case 'string':
      return `"${arg.value}"`;
    case 'object':
    case 'array':
      return arg.value;
    case 'null':
      return 'null';
    case 'undefined':
      return 'undefined';
    case 'number':
    case 'boolean':
    case 'error':
    case 'function':
    case 'symbol':
    case 'date':
    case 'regex':
      return arg.value;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
  },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  prefixDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  time: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    ...typography.mono,
    marginLeft: 'auto',
  },
  content: { flex: 1, padding: spacing.md },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  argBlock: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  argHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    ...typography.mono,
  },
  argIndex: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    ...typography.mono,
  },
  argText: {
    fontSize: typography.sizes.sm,
    ...typography.mono,
    lineHeight: 20,
  },
  stackBlock: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.clientError + '40',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  stackText: {
    color: colors.clientError,
    fontSize: typography.sizes.xs,
    ...typography.mono,
    lineHeight: 18,
  },
});
