import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';

interface FilterChip {
  label: string;
  value: string;
  color?: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  selected: string[];
  onToggle: (value: string) => void;
}

export function FilterChips({ chips, selected, onToggle }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {chips.map(chip => {
        const isSelected = selected.includes(chip.value);
        const chipColor = chip.color || colors.accent;
        return (
          <Pressable
            key={chip.value}
            onPress={() => onToggle(chip.value)}
            style={[
              styles.chip,
              isSelected
                ? { backgroundColor: chipColor + '30', borderColor: chipColor }
                : { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: isSelected ? chipColor : colors.textSecondary },
              ]}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
});
