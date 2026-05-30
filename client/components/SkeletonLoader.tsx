/**
 * SkeletonLoader — Shimmer placeholder with multiple variants
 *
 * Uses reanimated opacity pulse (0.3 ↔ 0.7) for a subtle shimmer.
 * Variants: card, list-item, text, avatar, slot.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../constants/colors';
import { radius, spacing } from '../constants/spacing';
import { durations } from '../constants/animations';

type Variant = 'card' | 'list-item' | 'text' | 'avatar' | 'slot';

interface SkeletonLoaderProps {
  variant: Variant;
  count?: number;
}

// ── Shared shimmer hook ──────────────────────────────────
const useShimmer = () => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.7, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,   // infinite
      true,  // reverse
    );
  }, []);

  return useAnimatedStyle(() => ({ opacity: opacity.value }));
};

// ── Individual shape components ──────────────────────────

const ShimmerBox: React.FC<{ width?: number | string; height: number; borderRadius?: number }> = ({
  width = '100%',
  height,
  borderRadius = radius.md,
}) => {
  const shimmer = useShimmer();
  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: theme.bg.card },
        shimmer,
      ]}
    />
  );
};

const CardSkeleton = () => <ShimmerBox height={160} />;

const ListItemSkeleton = () => {
  const shimmer = useShimmer();
  return (
    <View style={styles.listRow}>
      <Animated.View style={[styles.circle, shimmer]} />
      <View style={styles.listLines}>
        <Animated.View style={[styles.line, { width: '60%' }, shimmer]} />
        <Animated.View style={[styles.line, { width: '40%', marginTop: spacing.sm }, shimmer]} />
      </View>
    </View>
  );
};

/** Random-ish widths for text lines to look natural */
const TEXT_WIDTHS = ['100%', '80%', '60%'] as const;

const TextSkeleton = () => {
  const shimmer = useShimmer();
  return (
    <View>
      {TEXT_WIDTHS.map((w, i) => (
        <Animated.View
          key={i}
          style={[styles.textLine, { width: w, marginTop: i > 0 ? spacing.sm : 0 }, shimmer]}
        />
      ))}
    </View>
  );
};

const AvatarSkeleton = () => <ShimmerBox width={48} height={48} borderRadius={radius.full} />;

const SlotSkeleton = () => <ShimmerBox width={80} height={48} borderRadius={radius.sm} />;

// ── Variant map ──────────────────────────────────────────
const VARIANT_MAP: Record<Variant, React.FC> = {
  'card':      CardSkeleton,
  'list-item': ListItemSkeleton,
  'text':      TextSkeleton,
  'avatar':    AvatarSkeleton,
  'slot':      SlotSkeleton,
};

// ── Main component ───────────────────────────────────────
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 1 }) => {
  const Component = VARIANT_MAP[variant];

  return (
    <View style={styles.wrapper}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={i > 0 ? { marginTop: spacing.md } : undefined}>
          <Component />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
  },
  circle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: theme.bg.card,
  },
  listLines: {
    flex: 1,
    marginLeft: spacing.md,
  },
  line: {
    height: 14,
    borderRadius: radius.xs,
    backgroundColor: theme.bg.card,
  },
  textLine: {
    height: 16,
    borderRadius: radius.xs,
    backgroundColor: theme.bg.card,
  },
});

export default SkeletonLoader;
