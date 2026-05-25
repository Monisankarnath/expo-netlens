import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

export type TabId = 'traffic' | 'logs' | 'mocks' | 'breakpoints' | 'native';

interface Tab {
  id: TabId;
  label: string;
  icon: string;
  badge?: number;
}

const TABS: Tab[] = [
  { id: 'traffic', label: 'Traffic', icon: '\u2195' },
  { id: 'logs', label: 'Logs', icon: '\u2261' },
  { id: 'mocks', label: 'Mocks', icon: '\u25CE' },
  { id: 'breakpoints', label: 'Break', icon: '\u23F8' },
  { id: 'native', label: 'Native', icon: '\u2699' },
];

interface BottomTabBarProps {
  activeTab: TabId;
  onTabPress: (tab: TabId) => void;
  trafficCount?: number;
  logCount?: number;
}

export function BottomTabBar({ activeTab, onTabPress, trafficCount, logCount }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {TABS.map(tab => {
        const isActive = tab.id === activeTab;
        let badge: number | undefined;
        if (tab.id === 'traffic' && trafficCount) badge = trafficCount;
        if (tab.id === 'logs' && logCount) badge = logCount;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onTabPress(tab.id)}
            style={[styles.tab, isActive && styles.activeTab]}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>{tab.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
            {badge != null && badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm + 2,
    position: 'relative',
    borderTopWidth: 2,
    borderTopColor: colors.transparent,
  },
  activeTab: {
    borderTopColor: colors.accent,
    backgroundColor: colors.surfaceElevated,
  },
  icon: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  activeIcon: {
    color: colors.accent,
  },
  label: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeLabel: {
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: '20%',
    backgroundColor: colors.badge,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
});
