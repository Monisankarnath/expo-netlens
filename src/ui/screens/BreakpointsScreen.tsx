import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { EmptyState } from '../components/EmptyState';

export function BreakpointsScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        title="Breakpoints"
        subtitle="Set breakpoints to pause and inspect requests before they complete. Coming in Phase 2."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
