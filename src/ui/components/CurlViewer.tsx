import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { CopyableText } from './CopyableText';

interface CurlViewerProps {
  curl: string;
  onCopied?: () => void;
}

export function CurlViewer({ curl, onCopied }: CurlViewerProps) {
  return (
    <CopyableText text={curl} onCopied={onCopied}>
      <View style={styles.container}>
        <Text style={styles.text} selectable>{curl}</Text>
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
    borderLeftWidth: 3,
    borderLeftColor: colors.methodGet + '80',
  },
  text: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    ...typography.mono,
    lineHeight: 20,
  },
});
