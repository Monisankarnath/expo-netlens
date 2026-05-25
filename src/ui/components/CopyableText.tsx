import React, { useCallback, useRef } from 'react';
import { Pressable, Animated, StyleSheet, ViewStyle, Platform } from 'react-native';
import { colors } from '../theme/colors';

// Optional expo-clipboard with graceful fallback
let clipboardSetStringAsync: ((text: string) => Promise<boolean>) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('expo-clipboard');
  if (mod?.setStringAsync) clipboardSetStringAsync = mod.setStringAsync;
} catch {
  // expo-clipboard not installed — will fall back to web API or no-op
}

async function copyToClipboard(text: string): Promise<void> {
  if (clipboardSetStringAsync) {
    try { await clipboardSetStringAsync(text); return; } catch {}
  }
  // Web fallback
  if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
    try { await navigator.clipboard.writeText(text); return; } catch {}
  }
  // No-op — copy unavailable
}

interface CopyableTextProps {
  text: string;
  children: React.ReactNode;
  onCopied?: () => void;
  style?: ViewStyle;
}

export function CopyableText({ text, children, onCopied, style }: CopyableTextProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(async () => {
    await copyToClipboard(text);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    onCopied?.();
  }, [text, onCopied]);

  return (
    <Pressable onPress={handlePress} style={style}>
      {children}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.highlight, { opacity }]}
        pointerEvents="none"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  highlight: {
    backgroundColor: colors.selection,
    borderRadius: 4,
  },
});
