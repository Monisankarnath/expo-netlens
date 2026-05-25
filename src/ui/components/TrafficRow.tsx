import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { MethodBadge } from './MethodBadge';
import { StatusBadge } from './StatusBadge';
import { TrafficRecord } from '../../core/models/TrafficRecord';
import { METHOD_COLORS } from '../../core/models/HTTPMethod';
import { getStatusCategory, STATUS_COLORS } from '../../core/models/StatusCategory';
import { formatBytes } from '../../core/utils/bodyParser';

interface TrafficRowProps {
  record: TrafficRecord;
  onPress: (record: TrafficRecord) => void;
  onLongPress?: (record: TrafficRecord) => void;
  isEven?: boolean;
  maxDuration?: number;
}

export const TrafficRow = React.memo(function TrafficRow({
  record, onPress, onLongPress, isEven, maxDuration = 3000,
}: TrafficRowProps) {
  const handlePress = useCallback(() => onPress(record), [record, onPress]);
  const handleLongPress = useCallback(() => onLongPress?.(record), [record, onLongPress]);

  let displayPath: string;
  try {
    const url = new URL(record.request.url);
    displayPath = url.pathname + url.search;
    if (displayPath.length > 60) displayPath = displayPath.slice(0, 57) + '...';
  } catch {
    displayPath = record.request.url;
  }

  const duration = record.timings.duration;
  const size = record.response?.bodySize;
  const isPending = record.status === 'pending';
  const isFailed = record.status === 'failed';

  const methodColor = METHOD_COLORS[record.request.method] || colors.methodOther;
  const statusColor = record.response
    ? STATUS_COLORS[getStatusCategory(record.response.statusCode)]
    : isFailed ? colors.clientError : colors.pending;

  const timingFlex = duration != null
    ? Math.min(duration / Math.max(maxDuration, 1), 1)
    : 0;

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.container,
        isEven && styles.containerEven,
        pressed && styles.pressed,
        { borderLeftColor: methodColor },
      ]}
    >
      <View style={styles.topRow}>
        <MethodBadge method={record.request.method} />
        <Text
          style={[
            styles.path,
            isFailed && styles.failedPath,
            record.isMocked && styles.mockedPath,
          ]}
          numberOfLines={1}
        >
          {displayPath}
        </Text>
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.host} numberOfLines={1}>
          {(() => { try { return new URL(record.request.url).hostname; } catch { return ''; } })()}
        </Text>
        <View style={styles.meta}>
          {record.response && <StatusBadge statusCode={record.response.statusCode} />}
          {isPending && <Text style={styles.pendingText}>pending…</Text>}
          {isFailed && <Text style={styles.errorText}>error</Text>}
          {record.isMocked && <Text style={styles.mockedText}>mocked</Text>}
          {duration != null && <Text style={styles.duration}>{duration}ms</Text>}
          {size != null && size > 0 && <Text style={styles.size}>{formatBytes(size)}</Text>}
        </View>
      </View>

      {/* Timing bar — DevTools waterfall style */}
      <View style={styles.timingTrack}>
        <View style={[styles.timingFill, { flex: timingFlex, backgroundColor: statusColor + 'aa' }]} />
        <View style={{ flex: 1 - timingFlex }} />
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingLeft: spacing.sm,
    paddingRight: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    borderLeftWidth: 3,
    borderLeftColor: colors.border,
  },
  containerEven: {
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.selection,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  path: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    ...typography.mono,
  },
  failedPath: {
    color: colors.clientError,
  },
  mockedPath: {
    color: colors.mocked,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  host: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    flex: 1,
    ...typography.mono,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pendingText: {
    color: colors.pending,
    fontSize: typography.sizes.xs,
    ...typography.mono,
  },
  errorText: {
    color: colors.clientError,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  mockedText: {
    color: colors.mocked,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  duration: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    ...typography.mono,
  },
  size: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    ...typography.mono,
  },
  timingTrack: {
    flexDirection: 'row',
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: -spacing.md,
  },
  timingFill: {
    height: 2,
  },
});
