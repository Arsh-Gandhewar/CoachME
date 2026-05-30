/**
 * TabBar — Shared animated bottom tab bar for CoachME
 *
 * Replaces the duplicate ~160-line tab bars in user & trainer layouts.
 * Features a sliding indicator bar, haptics, and safe-area support.
 */

import React, { ReactNode, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../constants/colors';
import { typography } from '../constants/typography';
import { spacing, layout } from '../constants/spacing';
import { springs } from '../constants/animations';

interface Tab {
  name: string;
  icon: ReactNode | ((color: string, size: number) => ReactNode);
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabPress: (name: string) => void;
}

const ICON_SIZE = 22;
const INDICATOR_WIDTH = 24;
const INDICATOR_HEIGHT = 3;

const TabBar: React.FC<TabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  const { bottom } = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const tabWidth = screenWidth / tabs.length;
  const activeIndex = tabs.findIndex((t) => t.name === activeTab);
  const indicatorX = useSharedValue(0);

  // Animate indicator whenever the active tab changes
  useEffect(() => {
    const x = activeIndex * tabWidth + (tabWidth - INDICATOR_WIDTH) / 2;
    indicatorX.value = withSpring(x, springs.bouncy);
  }, [activeIndex, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  const handlePress = useCallback(
    (name: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onTabPress(name);
    },
    [onTabPress],
  );

  return (
    <View
      style={[
        styles.container,
        { height: layout.tabBarHeight + bottom, paddingBottom: bottom },
      ]}
    >
      {/* ── Sliding indicator ──────────────────────────── */}
      <Animated.View style={[styles.indicator, indicatorStyle]} />

      {/* ── Tab buttons ────────────────────────────────── */}
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;
        const color = isActive ? theme.accent.purple : theme.text.muted;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => handlePress(tab.name)}
          >
            {/* Render icon — supports both ReactNode and render-function */}
            {typeof tab.icon === 'function'
              ? tab.icon(color, ICON_SIZE)
              : tab.icon}

            <Text
              style={[
                typography.micro,
                styles.label,
                { color },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: theme.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.border.subtle,
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: spacing.xs,
  },
  indicator: {
    position: 'absolute',
    top: 0,
    width: INDICATOR_WIDTH,
    height: INDICATOR_HEIGHT,
    borderRadius: INDICATOR_HEIGHT / 2,
    backgroundColor: theme.accent.purple,
  },
});

export default TabBar;
