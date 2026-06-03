import { View, Text, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Star, Briefcase, DollarSign, LogOut, Edit2 } from 'lucide-react-native';
import { useAuthStore } from '../../../store/authStore';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import ScreenWrapper from '../../../components/ScreenWrapper';
import Avatar from '../../../components/Avatar';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import Button from '../../../components/Button';

export default function TrainerProfileScreen() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const trainer = user as any;

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to log out?')) { logout(); router.replace('/(auth)/login'); }
    } else { logout(); router.replace('/(auth)/login'); }
  };

  return (
    <ScreenWrapper>
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.header}>
        <Avatar uri={trainer?.profilePhoto} name={trainer?.fullName || 'Trainer'} size="xl" />
        <Text style={styles.name}>{trainer?.fullName || 'Trainer'}</Text>
        <Text style={styles.email}>{trainer?.email || ''}</Text>

        <View style={styles.statRow}>
          <Card style={styles.statCard}>
            <Star size={18} color={theme.accent.orange} />
            <Text style={styles.statVal}>{trainer?.rating || 0}</Text>
            <Text style={styles.statLbl}>Rating</Text>
          </Card>
          <Card style={styles.statCard}>
            <Briefcase size={18} color={theme.accent.cyan} />
            <Text style={styles.statVal}>{trainer?.experience || 0}yr</Text>
            <Text style={styles.statLbl}>Experience</Text>
          </Card>
          <Card style={styles.statCard}>
            <DollarSign size={18} color={theme.status.success} />
            <Text style={styles.statVal}>₹{trainer?.pricing || 0}</Text>
            <Text style={styles.statLbl}>Per Hour</Text>
          </Card>
        </View>
      </Animated.View>

      {trainer?.specializations?.length > 0 && (
        <Animated.View entering={FadeInDown.duration(400).delay(250)} style={styles.section}>
          <Text style={styles.sectionTitle}>Specializations</Text>
          <View style={styles.tags}>
            {trainer.specializations.map((s: string, i: number) => (
              <Chip key={i} label={s} selected={false} onPress={() => {}} size="sm" />
            ))}
          </View>
        </Animated.View>
      )}

      {trainer?.portfolioImages?.length > 0 && (
        <Animated.View entering={FadeInDown.duration(400).delay(350)} style={styles.section}>
          <Text style={styles.sectionTitle}>Portfolio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
            {trainer.portfolioImages.map((img: string, i: number) => (
              <Image key={i} source={{ uri: img }} style={styles.portfolioImg} />
            ))}
          </ScrollView>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.duration(400).delay(450)} style={styles.actions}>
        <Button title="Edit Profile" variant="secondary" onPress={() => router.push('/(user)/edit-profile')} fullWidth icon={<Edit2 size={16} color={theme.accent.purple} />} />
        <View style={{ height: spacing.md }} />
        <Button title="Log Out" variant="danger" onPress={handleLogout} fullWidth icon={<LogOut size={16} color="#fff" />} />
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: spacing['2xl'], marginBottom: spacing.xl },
  name: { ...typography.h2, color: theme.text.primary, marginTop: spacing.lg },
  email: { ...typography.bodySmall, color: theme.text.secondary, marginTop: spacing.xs },
  statRow: { flexDirection: 'row', marginTop: spacing['2xl'], gap: spacing.sm },
  statCard: { alignItems: 'center', flex: 1, paddingVertical: spacing.lg },
  statVal: { ...typography.h3, color: theme.text.primary, marginTop: spacing.sm },
  statLbl: { ...typography.caption, color: theme.text.muted, marginTop: spacing.xs },
  section: { marginBottom: spacing.xl },
  sectionTitle: { ...typography.h3, color: theme.text.primary, marginBottom: spacing.md },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  portfolioImg: { width: 120, height: 120, borderRadius: radius.lg, marginRight: spacing.md },
  actions: { marginTop: spacing.xl, paddingBottom: spacing['4xl'] },
});
