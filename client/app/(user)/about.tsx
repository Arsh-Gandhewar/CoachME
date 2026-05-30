import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronRight } from 'lucide-react-native';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Card from '../../components/Card';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <Header title="About" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />

      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.logoContainer}>
        <Text style={styles.logoIcon}>🏋️</Text>
        <Text style={styles.logoText}>Coach<Text style={styles.logoAccent}>ME</Text></Text>
        <Text style={styles.version}>Version 1.0.0</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(250)}>
        <Card style={{ padding: 0 }}>
          <TouchableOpacity style={styles.itemRow} onPress={() => router.push('/(user)/terms-of-service')} activeOpacity={0.7}>
            <Text style={styles.itemLabel}>Terms of Service</Text>
            <ChevronRight size={18} color={theme.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.itemRow, { borderBottomWidth: 0 }]} onPress={() => router.push('/(user)/privacy-policy')} activeOpacity={0.7}>
            <Text style={styles.itemLabel}>Privacy Policy</Text>
            <ChevronRight size={18} color={theme.text.muted} />
          </TouchableOpacity>
        </Card>
      </Animated.View>

      <Text style={styles.copyright}>© 2026 CoachME Inc. All rights reserved.</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  logoContainer: { alignItems: 'center', marginVertical: spacing['4xl'] },
  logoIcon: { fontSize: 66, marginBottom: spacing.lg },
  logoText: { ...typography.hero, fontSize: 34, color: theme.text.primary },
  logoAccent: { color: theme.accent.purple },
  version: { ...typography.bodySmall, color: theme.text.muted, marginTop: spacing.sm },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
  itemLabel: { ...typography.body, color: theme.text.primary },
  copyright: { ...typography.caption, color: theme.text.muted, textAlign: 'center', marginTop: spacing['4xl'] },
});
