import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { getStatusCategory, STATUS_COLORS } from '../../core/models/StatusCategory';

interface StatusBadgeProps {
  statusCode: number;
}

export function StatusBadge({ statusCode }: StatusBadgeProps) {
  const category = getStatusCategory(statusCode);
  const color = STATUS_COLORS[category];

  return (
    <View style={[styles.badge, { backgroundColor: color + '28', borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{statusCode}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    ...typography.mono,
  },
});
