import React from 'react';
import { Text, StyleSheet, ScrollView, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { CopyableText } from './CopyableText';
import { prettyPrint } from '../../core/formatters/JSONFormatter';

interface BodyViewerProps {
  body: string | null | undefined;
  contentType?: string;
  onCopied?: () => void;
}

export function BodyViewer({ body, contentType, onCopied }: BodyViewerProps) {
  if (!body) {
    return <Text style={styles.empty}>No body</Text>;
  }

  const displayBody = contentType === 'json' ? prettyPrint(body) : body;

  return (
    <CopyableText text={body} onCopied={onCopied}>
      <View style={styles.container}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.body} selectable>
            {displayBody}
          </Text>
        </ScrollView>
      </View>
    </CopyableText>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    maxHeight: 400,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent + '80',
  },
  body: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    ...typography.mono,
    lineHeight: 20,
  },
  empty: {
    color: colors.textTertiary,
    fontSize: typography.sizes.sm,
    padding: spacing.md,
  },
});
