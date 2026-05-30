/**
 * Avatar — Profile image with initials fallback & online indicator
 *
 * Sizes: sm (32), md (44), lg (64), xl (80).
 * Falls back to two-letter initials on the theme elevated background.
 */

import React, { useState } from 'react';
import { Image, View, Text, StyleSheet } from 'react-native';
import { theme } from '../constants/colors';
import { radius as r } from '../constants/spacing';

interface AvatarProps {
  uri?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showOnline?: boolean;
  borderColor?: string;
}

// ── Size look-up tables ──────────────────────────────────
const SIZES = { sm: 32, md: 44, lg: 64, xl: 80 } as const;
const FONT_SIZES = { sm: 11, md: 14, lg: 18, xl: 22 } as const;
const DOT_SIZES = { sm: 8, md: 10, lg: 14, xl: 16 } as const;
const DOT_BORDER = { sm: 1.5, md: 2, lg: 2.5, xl: 3 } as const;

const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  showOnline = false,
  borderColor,
}) => {
  const [imgError, setImgError] = useState(false);

  const dim = SIZES[size];
  const half = dim / 2;
  const initials = name.slice(0, 2).toUpperCase();

  const containerStyle = [
    styles.container,
    {
      width: dim,
      height: dim,
      borderRadius: r.full,
    },
    borderColor
      ? { borderWidth: 2, borderColor }
      : undefined,
  ];

  return (
    <View style={containerStyle}>
      {uri && !imgError ? (
        <Image
          source={{ uri }}
          style={{ width: dim, height: dim, borderRadius: half }}
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={[styles.fallback, { width: dim, height: dim, borderRadius: half }]}>
          <Text
            style={{
              fontSize: FONT_SIZES[size],
              fontWeight: '700',
              color: theme.accent.purple,
            }}
          >
            {initials}
          </Text>
        </View>
      )}

      {/* ── Online dot ────────────────────────────────── */}
      {showOnline && (
        <View
          style={[
            styles.dot,
            {
              width: DOT_SIZES[size],
              height: DOT_SIZES[size],
              borderRadius: DOT_SIZES[size] / 2,
              borderWidth: DOT_BORDER[size],
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'visible',
  },
  fallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bg.elevated,
  },
  dot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.status.success,
    borderColor: theme.bg.primary,
  },
});

export default Avatar;
