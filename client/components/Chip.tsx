/**
 * Chip — Selectable tag with spring animation & haptics
 *
 * Supports two sizes (sm / md) and an optional leading icon.
 */

import React, { ReactNode } from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { hapticLight } from '../utils/haptics';
import { theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing, radius } from '../constants/spacing';
import { springs } from '../constants/animations';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const Chip: React.FC<ChipProps> = ({
  label,
  selected,
  onPress,
  icon,
  size = 'md',
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, springs.press);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.press);
  };

  const handlePress = () => {
    hapticLight();
    onPress();
  };

  const isSm = size === 'sm';

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        isSm ? styles.sm : styles.md,
        selected ? styles.selected : styles.unselected,
        animatedStyle,
      ]}
    >
      {icon && <>{icon}</>}
      <Text
        style={[
          isSm ? typography.caption : typography.bodySmall,
          {
            color: selected ? theme.accent.purple : theme.text.secondary,
            marginLeft: icon ? spacing.xs : 0,
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
  },
  sm: {
    height: 32,
    paddingHorizontal: spacing.md,
  },
  md: {
    height: 38,
    paddingHorizontal: spacing.lg,
  },
  selected: {
    backgroundColor: theme.accent.purpleLight,
    borderColor: theme.accent.purple,
  },
  unselected: {
    backgroundColor: theme.bg.card,
    borderColor: theme.border.subtle,
  },
});

export default Chip;
