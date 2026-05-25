import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { HTTPMethod, METHOD_COLORS } from '../../core/models/HTTPMethod';

interface MethodBadgeProps {
  method: HTTPMethod;
}

export function MethodBadge({ method }: MethodBadgeProps) {
  const color = METHOD_COLORS[method] || METHOD_COLORS.HEAD;

  return (
    <View style={[styles.badge, { backgroundColor: color + '20' }]}>
      <Text style={[styles.text, { color }]}>{method}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    minWidth: 44,
    alignItems: 'center',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    ...typography.mono,
  },
});
