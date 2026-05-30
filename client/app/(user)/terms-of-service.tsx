import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';

export default function TermsOfServiceScreen() {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <Header title="Terms of Service" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/about')} />
      <Text style={styles.updated}>Last updated: May 2026</Text>
      <Text style={styles.heading}>1. Acceptance of Terms</Text>
      <Text style={styles.body}>By accessing or using the CoachME platform, you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the app immediately.</Text>
      <Text style={styles.heading}>2. User Accounts</Text>
      <Text style={styles.body}>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate and complete information when creating your account. Users must be at least 18 years old to register.</Text>
      <Text style={styles.heading}>3. Bookings & Payments</Text>
      <Text style={styles.body}>All bookings are subject to trainer availability and confirmation. Payments are processed securely through Razorpay. Cancellations made at least 24 hours before the scheduled session are eligible for a full refund. Refunds are processed within 5–7 business days.</Text>
      <Text style={styles.heading}>4. Trainer Responsibilities</Text>
      <Text style={styles.body}>Trainers are independent professionals and not employees of CoachME. Trainers must maintain valid certifications and provide accurate information about their qualifications, experience, and pricing.</Text>
      <Text style={styles.heading}>5. Limitation of Liability</Text>
      <Text style={styles.body}>CoachME acts as a platform connecting users with trainers. We are not liable for injuries, disputes, or dissatisfaction arising from training sessions. Users participate in sessions at their own risk.</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  updated: { ...typography.caption, color: theme.text.muted, marginBottom: spacing['2xl'] },
  heading: { ...typography.h3, color: theme.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm },
  body: { ...typography.body, color: theme.text.secondary, lineHeight: 22, marginBottom: spacing.lg },
});
