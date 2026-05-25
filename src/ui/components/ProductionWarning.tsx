import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export function ProductionWarning() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        expo-netlens is running in production. This is not recommended.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.destructive + '30',
    borderBottomWidth: 1,
    borderBottomColor: colors.destructive,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: colors.destructive,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
});
