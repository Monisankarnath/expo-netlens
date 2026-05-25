import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { EmptyState } from '../components/EmptyState';

export function MockRulesScreen() {
  return (
    <View style={styles.container}>
      <EmptyState
        title="Mock Rules"
        subtitle="Create mock rules to intercept and modify network responses. Coming in Phase 2."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
