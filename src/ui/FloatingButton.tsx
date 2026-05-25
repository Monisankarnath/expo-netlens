import React, { useRef, useMemo } from 'react';
import { Animated, PanResponder, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { colors } from './theme/colors';
import { typography } from './theme/typography';

interface FloatingButtonProps {
  count: number;
  onPress: () => void;
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
}

const BUTTON_SIZE = 52;
const MARGIN = 16;

export function FloatingButton({ count, onPress, position = 'bottomRight' }: FloatingButtonProps) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const initialX = position.includes('Right') ? screenWidth - BUTTON_SIZE - MARGIN : MARGIN;
  const initialY = position.includes('bottom') ? screenHeight - BUTTON_SIZE - MARGIN - (Platform.OS === 'ios' ? 90 : 60) : MARGIN + 60;

  const pan = useRef(new Animated.ValueXY({ x: initialX, y: initialY })).current;

  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture) => {
      return Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5;
    },
    onPanResponderGrant: () => {
      pan.setOffset({
        x: (pan.x as any)._value,
        y: (pan.y as any)._value,
      });
      pan.setValue({ x: 0, y: 0 });
    },
    onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gesture) => {
      pan.flattenOffset();
      // If it was a tap (minimal movement)
      if (Math.abs(gesture.dx) < 5 && Math.abs(gesture.dy) < 5) {
        onPress();
      }
    },
  }), [onPress]);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateX: pan.x }, { translateY: pan.y }] },
      ]}
      {...panResponder.panHandlers}
    >
      <Text style={styles.icon}>{'\uD83D\uDD0D'}</Text>
      {count > 0 && (
        <Animated.View style={styles.badge}>
          <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#202124',
    borderWidth: 1.5,
    borderColor: '#8ab4f8',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#8ab4f8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    zIndex: 99999,
  },
  icon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.badge,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
});
