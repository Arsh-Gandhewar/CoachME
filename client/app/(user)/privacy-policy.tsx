import { Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  return (
    <ScreenWrapper>
      <Header title="Privacy Policy" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/about')} />
      <Text style={styles.updated}>Last updated: May 2026</Text>
      <Text style={styles.heading}>1. Information We Collect</Text>
      <Text style={styles.body}>We collect information you provide directly, such as your name, email address, phone number, and profile photo when you create an account. For trainers, we also collect professional details including certifications, experience, and pricing.</Text>
      <Text style={styles.heading}>2. How We Use Your Information</Text>
      <Text style={styles.body}>Your information is used to provide and improve our services, facilitate bookings between users and trainers, process payments via Razorpay, and send you relevant notifications about your sessions.</Text>
      <Text style={styles.heading}>3. Data Security</Text>
      <Text style={styles.body}>We implement industry-standard security measures to protect your personal data. Passwords are hashed using bcrypt, and all API communications are encrypted via HTTPS. Payment data is handled securely by our payment partner Razorpay.</Text>
      <Text style={styles.heading}>4. Your Rights</Text>
      <Text style={styles.body}>You may request access to, correction of, or deletion of your personal data at any time by contacting our support team or through the Settings page in the app.</Text>
      <Text style={styles.heading}>5. Contact Us</Text>
      <Text style={styles.body}>For privacy-related inquiries, please contact us at privacy@coachme.app.</Text>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  updated: { ...typography.caption, color: theme.text.muted, marginBottom: spacing['2xl'] },
  heading: { ...typography.h3, color: theme.text.primary, marginTop: spacing.xl, marginBottom: spacing.sm },
  body: { ...typography.body, color: theme.text.secondary, lineHeight: 22, marginBottom: spacing.lg },
});
