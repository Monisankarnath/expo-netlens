import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { MethodBadge } from '../components/MethodBadge';
import { StatusBadge } from '../components/StatusBadge';
import { HeadersTable } from '../components/HeadersTable';
import { BodyViewer } from '../components/BodyViewer';
import { CurlViewer } from '../components/CurlViewer';
import { CopyableText } from '../components/CopyableText';
import { TrafficRecord } from '../../core/models/TrafficRecord';
import { formatToCurl } from '../../core/formatters/CURLFormatter';
import { formatBytes } from '../../core/utils/bodyParser';
import { redactHeaders } from '../../core/utils/headerUtils';

type DetailTab = 'overview' | 'request' | 'response' | 'curl';

interface RequestDetailScreenProps {
  record: TrafficRecord;
  onBack: () => void;
  redactHeaderKeys: string[];
  showToast: () => void;
}

export function RequestDetailScreen({ record, onBack, redactHeaderKeys, showToast }: RequestDetailScreenProps) {
  const [tab, setTab] = useState<DetailTab>('overview');
  const curl = useMemo(() => formatToCurl(record), [record]);

  const displayRequestHeaders = useMemo(
    () => redactHeaders(record.request.headers, redactHeaderKeys),
    [record.request.headers, redactHeaderKeys]
  );
  const displayResponseHeaders = useMemo(
    () => record.response ? redactHeaders(record.response.headers, redactHeaderKeys) : {},
    [record.response?.headers, redactHeaderKeys]
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>{'\u2190'} Back</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <MethodBadge method={record.request.method} />
          {record.response && <StatusBadge statusCode={record.response.statusCode} />}
        </View>
      </View>

      {/* URL */}
      <CopyableText text={record.request.url} onCopied={showToast}>
        <Text style={styles.url} numberOfLines={3}>{record.request.url}</Text>
      </CopyableText>

      {/* Tab switcher */}
      <View style={styles.tabs}>
        {(['overview', 'request', 'response', 'curl'] as DetailTab[]).map(t => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.activeTab]}>
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={styles.content}>
        {tab === 'overview' && (
          <View style={styles.section}>
            <DetailRow label="URL" value={record.request.url} showToast={showToast} />
            <DetailRow label="Method" value={record.request.method} showToast={showToast} />
            <DetailRow label="Status" value={record.response ? `${record.response.statusCode} ${record.response.statusText}` : record.status} showToast={showToast} />
            <DetailRow label="Duration" value={record.timings.duration ? `${record.timings.duration}ms` : 'pending'} showToast={showToast} />
            {record.response && <DetailRow label="Size" value={formatBytes(record.response.bodySize)} showToast={showToast} />}
            {record.error && <DetailRow label="Error" value={record.error.message} showToast={showToast} />}
          </View>
        )}

        {tab === 'request' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Headers</Text>
            <HeadersTable headers={displayRequestHeaders} onCopied={showToast} />
            <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Body</Text>
            <BodyViewer body={record.request.body} contentType={record.request.contentType} onCopied={showToast} />
          </View>
        )}

        {tab === 'response' && (
          <View style={styles.section}>
            {record.response ? (
              <>
                <Text style={styles.sectionTitle}>Headers</Text>
                <HeadersTable headers={displayResponseHeaders} onCopied={showToast} />
                <Text style={[styles.sectionTitle, { marginTop: spacing.lg }]}>Body</Text>
                <BodyViewer body={record.response.body} contentType={record.response.contentType} onCopied={showToast} />
              </>
            ) : (
              <Text style={styles.noResponse}>{record.status === 'pending' ? 'Waiting for response...' : 'No response'}</Text>
            )}
          </View>
        )}

        {tab === 'curl' && (
          <View style={styles.section}>
            <CurlViewer curl={curl} onCopied={showToast} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function DetailRow({ label, value, showToast }: { label: string; value: string; showToast: () => void }) {
  return (
    <CopyableText text={value} onCopied={showToast}>
      <View style={detailStyles.row}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value} numberOfLines={2}>{value}</Text>
      </View>
    </CopyableText>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    width: 80,
  },
  value: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    ...typography.mono,
    flex: 1,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 4,
  },
  backText: { color: colors.accent, fontSize: typography.sizes.sm },
  headerInfo: { flexDirection: 'row', gap: spacing.sm },
  url: {
    color: colors.textSecondary,
    fontSize: typography.sizes.xs,
    ...typography.mono,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.transparent,
  },
  activeTab: {
    borderBottomColor: colors.accent,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
  },
  activeTabText: {
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  content: { flex: 1 },
  section: { padding: spacing.md },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  noResponse: {
    color: colors.textTertiary,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    padding: spacing.xxxl,
  },
});
