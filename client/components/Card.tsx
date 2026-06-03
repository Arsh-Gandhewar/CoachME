/**
 * Card — CoachME shared card container
 *
 * Three visual variants: default, elevated (shadow), and glass (blur).
 * Optional onPress wraps content in a pressable with scale + haptic.
 */
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { hapticLight } from '../utils/haptics';

import { theme } from '../constants/colors';
import { spacing, radius } from '../constants/spacing';
import { springs } from '../constants/animations';

// ─── Types ──────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'glass';
  onPress?: () => void;
}

// ─── Component ──────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  onPress,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (onPress) scale.value = withSpring(0.98, springs.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.press);
  };

  const handlePress = () => {
    if (!onPress) return;
    hapticLight();
    onPress();
  };

  // ── Glass variant uses BlurView ──
  if (variant === 'glass') {
    const inner = (
      <BlurView intensity={40} tint="dark" style={[styles.base, styles.glass, style]}>
        {children}
      </BlurView>
    );

    return onPress ? (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.glassOuter, animatedStyle]}
      >
        {inner}
      </AnimatedPressable>
    ) : (
      <View style={styles.glassOuter}>{inner}</View>
    );
  }

  // ── Default / Elevated variants ──
  const variantStyle = variant === 'elevated' ? styles.elevated : styles.default;

  const content = (
    <Animated.View style={[styles.base, variantStyle, style, onPress && animatedStyle]}>
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={animatedStyle}
      >
        <View style={[styles.base, variantStyle, style]}>{children}</View>
      </AnimatedPressable>
    );
  }

  return content;
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  default: {
    backgroundColor: theme.bg.card,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  elevated: {
    backgroundColor: theme.bg.elevated,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  glass: {
    backgroundColor: theme.bg.glass,
  },
  glassOuter: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
});

export default Card;
