import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Platform } from 'react-native';
import { NetLensProvider, useNetLens } from 'expo-netlens';

function DemoApp() {
  const { show, clear, records, logs, stats } = useNetLens();
  const [status, setStatus] = useState('Ready');

  // Flow 1: Multiple fetch() calls — GET, POST, PUT, DELETE
  const testFetch = useCallback(async () => {
    setStatus('Running fetch tests...');

    // GET — success
    await fetch('https://jsonplaceholder.typicode.com/posts/1');

    // GET — list
    await fetch('https://jsonplaceholder.typicode.com/users');

    // POST — with JSON body
    await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token-123',
      },
      body: JSON.stringify({
        title: 'Test Post',
        body: 'Hello from expo-netlens',
        userId: 1,
      }),
    });

    // PUT — update
    await fetch('https://jsonplaceholder.typicode.com/posts/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 1,
        title: 'Updated Title',
        body: 'Updated body',
        userId: 1,
      }),
    });

    // DELETE
    await fetch('https://jsonplaceholder.typicode.com/posts/1', {
      method: 'DELETE',
    });

    setStatus('Fetch tests done — 5 requests');
  }, []);

  // Flow 2: Error cases
  const testErrors = useCallback(async () => {
    setStatus('Running error tests...');

    // 404
    try {
      await fetch('https://jsonplaceholder.typicode.com/posts/99999');
    } catch {}

    // Network error (DNS failure)
    try {
      await fetch('https://this-domain-does-not-exist-xyz.example.com/api');
    } catch {}

    setStatus('Error tests done — check Traffic tab for error states');
  }, []);

  // Flow 3: XHR calls
  const testXHR = useCallback(() => {
    setStatus('Running XHR test...');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://jsonplaceholder.typicode.com/comments?postId=1');
    xhr.setRequestHeader('X-Custom-Header', 'test-value');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        setStatus(`XHR done — status ${xhr.status}`);
      }
    };
    xhr.send();
  }, []);

  // Flow 4: Console log levels + prefix pattern coloring
  const testConsoleLogs = useCallback(() => {
    setStatus('Logging to console...');

    // Different prefix patterns — each gets a unique deterministic color
    console.log('===>>>', 'Navigation event', { screen: 'Home' });
    console.log('===>>>', 'Navigation event', { screen: 'Profile' });
    console.log('[API]', 'GET /users', { status: 200, duration: 45 });
    console.log('[API]', 'POST /auth', { status: 401 });
    console.log('[WS]', 'Connected to wss://example.com');
    console.log('[REDUX]', 'Action dispatched:', { type: 'SET_USER', payload: { id: 1 } });
    console.log('count =', 42);
    console.log('count =', 43);

    // No prefix — default colors, type-highlighted args
    console.log('Simple string log');
    console.log('Multiple types:', 42, true, null, { key: 'value' }, [1, 2, 3]);

    // Different levels
    console.info('Info message with object:', { userId: 1, name: 'John' });
    console.warn('Warning: API latency is high', { latency: 2500, threshold: 1000 });
    console.error(new Error('Something went wrong in payment flow'));
    console.debug('Debug data:', {
      records: records.length,
      logs: logs.length,
      nested: { deep: { value: [1, 2, 3] } },
    });

    // Circular reference test
    const circular: any = { name: 'circular' };
    circular.self = circular;
    console.log('Circular ref test:', circular);

    setStatus('Console tests done — check Logs tab');
  }, [records.length, logs.length]);

  // Flow 5: Rapid fire — stress test
  const testRapidFire = useCallback(async () => {
    setStatus('Rapid fire: 10 concurrent requests...');

    const promises = Array.from({ length: 10 }, (_, i) =>
      fetch(`https://jsonplaceholder.typicode.com/posts/${i + 1}`)
    );

    await Promise.allSettled(promises);
    setStatus('Rapid fire done — 10 requests');
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>expo-netlens</Text>
      <Text style={styles.subtitle}>Phase 1 Test App</Text>

      {/* Live stats */}
      <View style={styles.statsRow}>
        <StatBox label="Requests" value={stats.total} />
        <StatBox label="Errors" value={stats.failed} color="#F44747" />
        <StatBox label="Logs" value={logs.length} />
        <StatBox label="Avg ms" value={stats.avgDuration} />
      </View>

      <Text style={styles.status}>{status}</Text>

      {/* Test buttons */}
      <Text style={styles.sectionTitle}>Network Tests</Text>
      <TestButton title="Fetch — GET, POST, PUT, DELETE" onPress={testFetch} />
      <TestButton title="Fetch — Error cases (404, DNS)" onPress={testErrors} />
      <TestButton title="XHR — GET with custom header" onPress={testXHR} />
      <TestButton title="Rapid Fire — 10 concurrent" onPress={testRapidFire} />

      <Text style={styles.sectionTitle}>Console Log Tests</Text>
      <TestButton title="All log levels + circular ref" onPress={testConsoleLogs} />

      <Text style={styles.sectionTitle}>Inspector Controls</Text>
      <TestButton title="Open Inspector" onPress={show} color="#0078D4" />
      <TestButton title="Clear All Data" onPress={() => { clear(); setStatus('Cleared'); }} color="#858585" />

      <Text style={styles.hint}>
        Tap the floating button to open the inspector.
        {'\n'}Long-press a traffic row for context menu (Copy cURL, etc).
        {'\n'}Press any text block in detail view to copy.
        {Platform.OS === 'web' ? '\nCtrl+Shift+N to toggle (Phase 3).' : '\nShake device to toggle (Phase 3).'}
      </Text>
    </ScrollView>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function TestButton({ title, onPress, color }: { title: string; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      <Text style={[styles.buttonText, color ? { color } : null]}>{title}</Text>
    </Pressable>
  );
}

export default function App() {
  return (
    <NetLensProvider
      enabled={true}
      maxRecords={500}
      maxBodySize={512 * 1024}
      redactHeaders={['authorization', 'cookie']}
      captureLogs={true}
      maxLogEntries={1000}
      fabPosition="bottomRight"
    >
      <DemoApp />
    </NetLensProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#CCCCCC',
  },
  subtitle: {
    fontSize: 14,
    color: '#858585',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#252526',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4EC9B0',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
  },
  statLabel: {
    fontSize: 10,
    color: '#858585',
    marginTop: 4,
  },
  status: {
    fontSize: 12,
    color: '#569CD6',
    fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }),
    marginBottom: 16,
    backgroundColor: '#252526',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#858585',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: 1,
  },
  button: {
    backgroundColor: '#252526',
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3C3C3C',
  },
  buttonPressed: {
    backgroundColor: '#264F78',
    borderColor: '#0078D4',
  },
  buttonText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  hint: {
    fontSize: 12,
    color: '#6A6A6A',
    lineHeight: 20,
    marginTop: 24,
  },
});
