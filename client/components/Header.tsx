/**
 * Header — CoachME shared screen header
 *
 * Centered title with optional back button (ChevronLeft from lucide)
 * and optional right-side action slot. Haptic on back press.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { hapticLight } from '../utils/haptics';

import { theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing, layout } from '../constants/spacing';
import { hitSlop } from '../constants/spacing';

// ─── Types ──────────────────────────────────────────────
interface HeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
}

// ─── Component ──────────────────────────────────────────
const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightAction,
  transparent = false,
}) => {
  const handleBack = () => {
    hapticLight();
    onBack?.();
  };

  return (
    <View
      style={[
        styles.container,
        !transparent && styles.solidBg,
      ]}
    >
      {/* Left slot — back button or spacer */}
      <View style={styles.side}>
        {onBack && (
          <Pressable
            onPress={handleBack}
            hitSlop={hitSlop.medium}
            style={styles.backBtn}
          >
            <ChevronLeft size={24} color={theme.text.primary} />
          </Pressable>
        )}
      </View>

      {/* Center — title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right slot — optional action or spacer */}
      <View style={[styles.side, styles.rightSide]}>
        {rightAction}
      </View>
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
  },
  solidBg: {
    backgroundColor: theme.bg.primary,
  },
  side: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  backBtn: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: theme.text.primary,
    ...typography.h3,
  },
});

export default Header;
