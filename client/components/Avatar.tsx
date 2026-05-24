import React, { useState } from 'react';
import { Image, View, Text, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';

interface AvatarProps {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackIcon?: string;
  fallbackText?: string;
}

export function Avatar({ uri, style, containerStyle, fallbackIcon = '👤', fallbackText }: AvatarProps) {
  const [error, setError] = useState(false);

  if (!uri || error) {
    return (
      <View style={[styles.fallbackContainer, containerStyle, style as any]}>
        {fallbackText ? (
          <Text style={styles.fallbackText}>{fallbackText}</Text>
        ) : (
          <Text style={styles.fallbackIcon}>{fallbackIcon}</Text>
        )}
      </View>
    );
  }

  return (
    <Image 
      source={{ uri }} 
      style={style} 
      onError={() => setError(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallbackContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
  },
  fallbackIcon: {
    fontSize: 24, // Will be overridden or scaled by container
  },
  fallbackText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
