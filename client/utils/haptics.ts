import { Platform } from 'react-native';

let Haptics: any = null;

try {
  Haptics = require('expo-haptics');
} catch {}

export const hapticLight = () => {
  try {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {}
};

export const hapticMedium = () => {
  try {
    if (Platform.OS !== 'web' && Haptics?.impactAsync) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  } catch {}
};
