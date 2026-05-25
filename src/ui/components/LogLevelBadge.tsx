import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius } from '../theme/spacing';
import { LogLevel } from '../../core/models/LogEntry';

const LEVEL_COLORS: Record<LogLevel, string> = {
  log: colors.logDefault,
  info: colors.logInfo,
  warn: colors.logWarn,
  error: colors.logError,
  debug: colors.logDebug,
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  log: 'LOG',
  info: 'INF',
  warn: 'WRN',
  error: 'ERR',
  debug: 'DBG',
};

interface LogLevelBadgeProps {
  level: LogLevel;
}

export function LogLevelBadge({ level }: LogLevelBadgeProps) {
  const color = LEVEL_COLORS[level];

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.text, { color }]}>{LEVEL_LABELS[level]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 36,
    alignItems: 'center',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    ...typography.mono,
  },
});
