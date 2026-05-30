/**
 * Button — CoachME shared animated button
 *
 * Supports primary, secondary, ghost, and danger variants with
 * spring scale animation on press and haptic feedback.
 */
import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing, radius } from '../constants/spacing';
import { springs } from '../constants/animations';

// ─── Types ──────────────────────────────────────────────
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

// ─── Size map ───────────────────────────────────────────
const SIZE_CONFIG = {
  sm: { height: 36, text: typography.bodySmall, px: spacing.md },
  md: { height: 48, text: typography.button, px: spacing.xl },
  lg: { height: 54, text: typography.bodyLarge, px: spacing['2xl'] },
} as const;

// ─── Variant style map ──────────────────────────────────
const variantStyles = (v: ButtonProps['variant'] = 'primary'): ViewStyle => {
  switch (v) {
    case 'primary':
      return { backgroundColor: theme.accent.purple };
    case 'secondary':
      return {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.accent.purple,
      };
    case 'ghost':
      return { backgroundColor: 'transparent' };
    case 'danger':
      return { backgroundColor: theme.status.error };
  }
};

const textColor = (v: ButtonProps['variant'] = 'primary') => {
  if (v === 'secondary' || v === 'ghost') return theme.accent.purple;
  return theme.text.primary;
};

// ─── Component ──────────────────────────────────────────
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const cfg = SIZE_CONFIG[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!disabled) scale.value = withSpring(0.97, springs.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.press);
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        { height: cfg.height, paddingHorizontal: cfg.px, borderRadius: radius.xl },
        variantStyles(variant),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor(variant)} size="small" />
      ) : (
        <>
          {icon && <Animated.View style={styles.iconWrap}>{icon}</Animated.View>}
          <Text
            style={[cfg.text, { color: textColor(variant), fontWeight: '600' }]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  disabled: {
    opacity: 0.5,
  },
  iconWrap: {
    marginRight: spacing.sm,
  },
});

export default Button;
