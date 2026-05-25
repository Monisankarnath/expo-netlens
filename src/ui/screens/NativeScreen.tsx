import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { EmptyState } from '../components/EmptyState';

export function NativeScreen() {
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <EmptyState
          title="Native debugging is not available on web"
          subtitle="All network traffic and logs are captured in the Traffic and Logs tabs."
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <EmptyState
        title="Native Traffic & Logs"
        subtitle="Native-layer HTTP calls and system logs. Coming in Phase 2."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
