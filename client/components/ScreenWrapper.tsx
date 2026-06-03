/**
 * ScreenWrapper — CoachME shared screen container
 *
 * Handles safe-area insets, optional ScrollView with pull-to-refresh,
 * consistent padding, and dark StatusBar configuration.
 */
import React from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { theme } from '../constants/colors';
import { layout } from '../constants/spacing';

// ─── Types ──────────────────────────────────────────────
interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: StyleProp<ViewStyle>;
}

// ─── Component ──────────────────────────────────────────
const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scroll = true,
  refreshing = false,
  onRefresh,
  style,
}) => {
  const insets = useSafeAreaInsets();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.bg.primary,
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
  };

  const contentStyle: ViewStyle = {
    paddingHorizontal: layout.screenPadding,
  };

  if (scroll) {
    return (
      <View style={containerStyle}>
        <StatusBar style="light" />
        <ScrollView showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}
          style={styles.flex}
          contentContainerStyle={[contentStyle, styles.scrollContent, style]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={theme.accent.purple}
                colors={[theme.accent.purple]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[containerStyle, contentStyle, style]}>
      <StatusBar style="light" />
      {children}
    </View>
  );
};

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});

export default ScreenWrapper;
