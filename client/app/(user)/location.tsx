import { View, Text, StyleSheet, Switch, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Card from '../../components/Card';

export default function LocationScreen() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <Header title="Location" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/settings')} />
      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Text style={styles.sectionTitle}>Location Services</Text>
        <Card style={{ padding: 0, marginBottom: spacing.xl }}>
          <View style={[styles.itemRow, styles.itemBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>Enable Location</Text>
              <Text style={styles.itemDesc}>Allow CoachME to use your location to find nearby trainers</Text>
            </View>
            <Switch trackColor={{ false: theme.bg.hover, true: theme.accent.purple }} thumbColor="#fff" value={true} />
          </View>
          <View style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemLabel}>Background Location</Text>
              <Text style={styles.itemDesc}>Allow location access while the app is in the background</Text>
            </View>
            <Switch trackColor={{ false: theme.bg.hover, true: theme.accent.purple }} thumbColor="#fff" value={false} />
          </View>
        </Card>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.label, color: theme.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, paddingLeft: spacing.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
  itemLabel: { ...typography.body, color: theme.text.primary, marginBottom: spacing.xs },
  itemDesc: { ...typography.caption, color: theme.text.muted },
});
