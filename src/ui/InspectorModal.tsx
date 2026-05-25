import React, { Component, useState, useCallback } from 'react';
import { View, Modal, StyleSheet, StatusBar, Platform, Pressable, Text } from 'react-native';
import { colors } from './theme/colors';
import { typography } from './theme/typography';
import { spacing } from './theme/spacing';
import { BottomTabBar, TabId } from './components/BottomTabBar';
import { CopyToast } from './components/CopyToast';
import { TrafficListScreen } from './screens/TrafficListScreen';
import { LogsScreen } from './screens/LogsScreen';
import { RequestDetailScreen } from './screens/RequestDetailScreen';
import { LogDetailScreen } from './screens/LogDetailScreen';
import { MockRulesScreen } from './screens/MockRulesScreen';
import { BreakpointsScreen } from './screens/BreakpointsScreen';
import { NativeScreen } from './screens/NativeScreen';
import { ProductionWarning } from './components/ProductionWarning';
import { TrafficRecord } from '../core/models/TrafficRecord';
import { LogEntry } from '../core/models/LogEntry';

interface InspectorModalProps {
  visible: boolean;
  onClose: () => void;
  records: readonly TrafficRecord[];
  logs: readonly LogEntry[];
  onClearTraffic: () => void;
  onClearLogs: () => void;
  redactHeaders: string[];
  isProduction: boolean;
}

type Screen =
  | { type: 'tabs' }
  | { type: 'requestDetail'; record: TrafficRecord }
  | { type: 'logDetail'; entry: LogEntry };

export function InspectorModal({
  visible, onClose, records, logs,
  onClearTraffic, onClearLogs, redactHeaders, isProduction,
}: InspectorModalProps) {
  const [activeTab, setActiveTab] = useState<TabId>('traffic');
  const [screen, setScreen] = useState<Screen>({ type: 'tabs' });
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback(() => setToastVisible(true), []);
  const hideToast = useCallback(() => setToastVisible(false), []);

  const handleSelectRecord = useCallback((record: TrafficRecord) => {
    setScreen({ type: 'requestDetail', record });
  }, []);

  const handleSelectLog = useCallback((entry: LogEntry) => {
    setScreen({ type: 'logDetail', entry });
  }, []);

  const handleBack = useCallback(() => {
    setScreen({ type: 'tabs' });
  }, []);

  const renderContent = () => {
    if (screen.type === 'requestDetail') {
      return (
        <RequestDetailScreen
          record={screen.record}
          onBack={handleBack}
          redactHeaderKeys={redactHeaders}
          showToast={showToast}
        />
      );
    }

    if (screen.type === 'logDetail') {
      return (
        <LogDetailScreen
          entry={screen.entry}
          onBack={handleBack}
          showToast={showToast}
        />
      );
    }

    switch (activeTab) {
      case 'traffic':
        return (
          <TrafficListScreen
            records={records}
            onSelectRecord={handleSelectRecord}
            onClear={onClearTraffic}
            showToast={showToast}
          />
        );
      case 'logs':
        return (
          <LogsScreen
            entries={logs}
            onSelectEntry={handleSelectLog}
            onClear={onClearLogs}
          />
        );
      case 'mocks':
        return <MockRulesScreen />;
      case 'breakpoints':
        return <BreakpointsScreen />;
      case 'native':
        return <NativeScreen />;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {Platform.OS === 'android' && <StatusBar backgroundColor={colors.background} barStyle="light-content" />}

        {isProduction && <ProductionWarning />}

        {/* Close button */}
        <View style={styles.topBar}>
          <Text style={styles.topTitle}>expo-netlens</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Done</Text>
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <ScreenErrorBoundary onBack={() => setScreen({ type: 'tabs' })}>
            {renderContent()}
          </ScreenErrorBoundary>
        </View>

        {/* Bottom tabs (only show on tab screens, not detail) */}
        {screen.type === 'tabs' && (
          <BottomTabBar
            activeTab={activeTab}
            onTabPress={setActiveTab}
            trafficCount={records.length}
            logCount={logs.length}
          />
        )}

        {/* Copy toast */}
        <CopyToast visible={toastVisible} onHide={hideToast} />
      </View>
    </Modal>
  );
}

class ScreenErrorBoundary extends Component<
  { children: React.ReactNode; onBack: () => void },
  { hasError: boolean; error: string }
> {
  state = { hasError: false, error: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ color: colors.clientError, fontSize: 16, marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
            {this.state.error}
          </Text>
          <Pressable
            onPress={() => { this.setState({ hasError: false, error: '' }); this.props.onBack(); }}
            style={{ padding: 12, backgroundColor: colors.surface, borderRadius: 8 }}
          >
            <Text style={{ color: colors.accent }}>Go Back</Text>
          </Pressable>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'ios' ? 44 : (StatusBar.currentHeight ?? 0),
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  topTitle: {
    color: colors.accent,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    ...typography.mono,
  },
  closeButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
  },
  closeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  content: {
    flex: 1,
  },
});
