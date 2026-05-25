import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { LogLevelBadge } from './LogLevelBadge';
import { LogEntry, ColoredArgData } from '../../core/models/LogEntry';

interface LogRowProps {
  entry: LogEntry;
  onPress: (entry: LogEntry) => void;
  onLongPress?: (entry: LogEntry) => void;
}

export const LogRow = React.memo(function LogRow({ entry, onPress, onLongPress }: LogRowProps) {
  const handlePress = useCallback(() => onPress(entry), [entry, onPress]);
  const handleLongPress = useCallback(() => onLongPress?.(entry), [entry, onLongPress]);

  const time = new Date(entry.timestamp);
  const timeStr = time.toLocaleTimeString('en-US', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        // Consistent left border — colored by prefix or transparent for alignment
        { borderLeftWidth: 3, borderLeftColor: entry.prefixColor || 'transparent' },
      ]}
    >
      <View style={styles.topRow}>
        <LogLevelBadge level={entry.level} />
        <Text style={styles.time}>{timeStr}</Text>
      </View>
      <View style={styles.argsRow}>
        <ColoredPreview coloredArgs={entry.coloredArgs} prefixColor={entry.prefixColor} />
      </View>
    </Pressable>
  );
});

/** Renders args inline with type-based colors, truncated to 2 lines */
function ColoredPreview({
  coloredArgs,
  prefixColor,
}: {
  coloredArgs: ColoredArgData[];
  prefixColor: string | null;
}) {
  if (!coloredArgs || coloredArgs.length === 0) {
    return <Text style={styles.emptyArg}>(empty)</Text>;
  }

  return (
    <Text numberOfLines={2} style={styles.previewContainer}>
      {coloredArgs.map((arg, i) => {
        // First string arg with a prefix gets the prefix color
        const isPrefix = i === 0 && arg.type === 'string' && prefixColor;
        const displayColor = isPrefix ? prefixColor : arg.color;

        // Truncate individual arg display in row
        let display = arg.value;
        if (arg.type === 'object' || arg.type === 'array') {
          // Collapse to single line for preview
          display = display.replace(/\s+/g, ' ');
          if (display.length > 80) display = display.slice(0, 77) + '...';
        } else if (display.length > 100) {
          display = display.slice(0, 97) + '...';
        }

        return (
          <Text key={i} style={[styles.arg, { color: displayColor }]}>
            {i > 0 ? ' ' : ''}
            {arg.type === 'string' && !isPrefix ? `"${display}"` : display}
          </Text>
        );
      })}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.selection,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  time: {
    color: colors.textTertiary,
    fontSize: typography.sizes.xs,
    ...typography.mono,
  },
  argsRow: {
    paddingLeft: 2,
  },
  previewContainer: {
    ...typography.mono,
    fontSize: typography.sizes.sm,
  },
  arg: {
    fontSize: typography.sizes.sm,
    ...typography.mono,
  },
  emptyArg: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    ...typography.mono,
    fontStyle: 'italic',
  },
});
