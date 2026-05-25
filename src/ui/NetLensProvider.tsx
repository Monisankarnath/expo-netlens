import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { NetLensContext, NetLensContextValue } from './NetLensContext';
import { FloatingButton } from './FloatingButton';
import { InspectorModal } from './InspectorModal';
import { TrafficStore } from '../core/storage/TrafficStore';
import { LogStore } from '../core/storage/LogStore';
import { InterceptorManager, InterceptorConfig } from '../core/interceptor/InterceptorManager';
import { useTrafficStore } from './hooks/useTrafficStore';
import { useLogs } from './hooks/useLogs';
import { computeStats } from '../core/storage/TrafficStatistics';
import { isProduction } from '../core/utils/buildProfile';

export interface NetLensProviderProps {
  children: React.ReactNode;
  enabled?: boolean;
  // Network config
  captureHosts?: string[];
  ignoreHosts?: string[];
  maxRecords?: number;
  maxBodySize?: number;
  redactHeaders?: string[];
  // Log config
  captureLogs?: boolean;
  maxLogEntries?: number;
  // Native layer
  enableNativeTraffic?: boolean;
  enableNativeLogs?: boolean;
  // Caching
  caching?: boolean;
  // UI
  fabPosition?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
  enableShake?: boolean;
  // Production
  allowInProduction?: boolean;
}

export function NetLensProvider({
  children,
  enabled = typeof __DEV__ !== 'undefined' ? __DEV__ : true,
  captureHosts,
  ignoreHosts,
  maxRecords = 500,
  maxBodySize = 512 * 1024,
  redactHeaders: redactHeaderKeys = ['authorization', 'cookie', 'set-cookie'],
  captureLogs = true,
  maxLogEntries = 1000,
  enableNativeTraffic = true,
  enableNativeLogs = true,
  caching = false,
  fabPosition = 'bottomRight',
  enableShake = true,
  allowInProduction = false,
}: NetLensProviderProps) {
  // Complete no-op when disabled
  if (!enabled) return <>{children}</>;

  // Block in production unless explicitly allowed
  const isProd = isProduction();
  if (isProd && !allowInProduction) return <>{children}</>;

  return (
    <NetLensProviderInner
      captureHosts={captureHosts}
      ignoreHosts={ignoreHosts}
      maxRecords={maxRecords}
      maxBodySize={maxBodySize}
      redactHeaderKeys={redactHeaderKeys}
      captureLogs={captureLogs}
      maxLogEntries={maxLogEntries}
      fabPosition={fabPosition}
      isProduction={isProd}
    >
      {children}
    </NetLensProviderInner>
  );
}

interface NetLensProviderInnerProps {
  children: React.ReactNode;
  captureHosts?: string[];
  ignoreHosts?: string[];
  maxRecords: number;
  maxBodySize: number;
  redactHeaderKeys: string[];
  captureLogs: boolean;
  maxLogEntries: number;
  fabPosition: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
  isProduction: boolean;
}

function NetLensProviderInner({
  children, captureHosts, ignoreHosts, maxRecords, maxBodySize,
  redactHeaderKeys, captureLogs, maxLogEntries, fabPosition, isProduction: isProd,
}: NetLensProviderInnerProps) {
  const trafficStore = useRef(new TrafficStore(maxRecords)).current;
  const logStore = useRef(new LogStore(maxLogEntries)).current;
  const managerRef = useRef<InterceptorManager | null>(null);

  const [modalVisible, setModalVisible] = useState(false);

  // Subscribe to stores for reactive data
  const records = useTrafficStore(trafficStore);
  const logs = useLogs(logStore);
  const stats = useMemo(() => computeStats(records), [records]);

  // Start interceptors
  useEffect(() => {
    const config: InterceptorConfig = {
      maxBodySize,
      captureHosts,
      ignoreHosts,
      captureLogs,
    };

    const manager = new InterceptorManager(
      config,
      (record) => trafficStore.addRecord(record),
      (id, updates) => trafficStore.updateRecord(id, updates),
      (entry) => logStore.addEntry(entry),
    );

    manager.start();
    managerRef.current = manager;

    return () => {
      manager.stop();
      managerRef.current = null;
    };
  }, []);

  const show = useCallback(() => setModalVisible(true), []);
  const hide = useCallback(() => setModalVisible(false), []);
  const clear = useCallback(() => {
    trafficStore.clear();
    logStore.clear();
  }, []);
  const stop = useCallback(() => managerRef.current?.stop(), []);
  const showToast = useCallback(() => {}, []); // Toast is managed by modal

  const contextValue: NetLensContextValue = useMemo(() => ({
    trafficStore,
    logStore,
    records,
    logs,
    stats,
    show,
    hide,
    clear,
    stop,
    redactHeaders: redactHeaderKeys,
    showToast,
  }), [records, logs, stats, show, hide, clear, stop, showToast, trafficStore, logStore, redactHeaderKeys]);

  return (
    <NetLensContext.Provider value={contextValue}>
      <View style={styles.container}>
        {children}
        <FloatingButton
          count={records.length}
          onPress={show}
          position={fabPosition}
        />
        <InspectorModal
          visible={modalVisible}
          onClose={hide}
          records={records}
          logs={logs}
          onClearTraffic={() => trafficStore.clear()}
          onClearLogs={() => logStore.clear()}
          redactHeaders={redactHeaderKeys}
          isProduction={isProd}
        />
      </View>
    </NetLensContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
