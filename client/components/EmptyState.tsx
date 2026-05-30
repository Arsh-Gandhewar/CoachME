/**
 * EmptyState — CoachME shared empty-state placeholder
 *
 * Displays a centered icon, title, optional subtitle, and optional
 * CTA button. Fades in on mount with FadeInDown from reanimated.
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing } from '../constants/spacing';
import Button from './Button';

// ─── Types ──────────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

// ─── Component ──────────────────────────────────────────
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
}) => {
  return (
    <Animated.View
      entering={FadeInDown.duration(400).delay(100)}
      style={styles.container}
    >
      {/* Icon */}
      <View style={styles.iconWrap}>{icon}</View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Subtitle */}
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}

      {/* CTA */}
      {actionLabel && onAction && (
        <View style={styles.actionWrap}>
          <Button
            title={actionLabel}
            onPress={onAction}
            variant="primary"
            size="sm"
          />
        </View>
      )}
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing['3xl'],
  },
  iconWrap: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: theme.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.bodySmall,
    color: theme.text.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actionWrap: {
    marginTop: spacing.sm,
  },
});

export default EmptyState;
