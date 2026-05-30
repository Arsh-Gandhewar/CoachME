import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MessageCircle, Mail, ChevronRight, ChevronDown } from 'lucide-react-native';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Card from '../../components/Card';

const faqData = [
  { q: 'How do I cancel a booking?', a: 'You can cancel a booking up to 24 hours before the scheduled session for a full refund. Go to your Bookings tab, find the booking, and tap "Cancel".' },
  { q: 'How do payments work?', a: 'Payments are processed securely via Razorpay. We support credit/debit cards, UPI, and net banking. Payment is charged when you confirm a booking.' },
  { q: 'Refund policy', a: 'Once a cancellation is approved, refunds are processed within 5–7 business days back to your original payment method.' },
];

export default function SupportScreen() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <ScreenWrapper>
      <Header title="Help & Support" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />

      <Animated.View entering={FadeInDown.duration(400).delay(100)}>
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Card style={{ padding: 0, marginBottom: spacing['2xl'] }}>
          <TouchableOpacity style={[styles.itemRow, styles.itemBorder]} onPress={() => router.push('/(user)/support-chat')} activeOpacity={0.7}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: theme.accent.purpleLight }]}>
                <MessageCircle color={theme.accent.purple} size={20} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Live AI Support</Text>
                <Text style={styles.itemDesc}>Instant answers to your queries</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.text.muted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.itemRow} activeOpacity={0.7}>
            <View style={styles.itemLeft}>
              <View style={[styles.iconWrap, { backgroundColor: theme.accent.purpleLight }]}>
                <Mail color={theme.accent.purple} size={20} />
              </View>
              <View>
                <Text style={styles.itemLabel}>Email Support</Text>
                <Text style={styles.itemDesc}>support@coachme.app</Text>
              </View>
            </View>
            <ChevronRight size={18} color={theme.text.muted} />
          </TouchableOpacity>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(400).delay(250)}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <Card style={{ padding: 0 }}>
          {faqData.map((faq, i) => (
            <TouchableOpacity key={i} style={[styles.faqRow, i < faqData.length - 1 && styles.itemBorder]} onPress={() => setOpenFaq(openFaq === i ? null : i)} activeOpacity={0.7}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                {openFaq === i ? <ChevronDown size={18} color={theme.accent.purple} /> : <ChevronRight size={18} color={theme.text.muted} />}
              </View>
              {openFaq === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}
        </Card>
      </Animated.View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { ...typography.label, color: theme.text.muted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm, paddingLeft: spacing.xs },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  itemLabel: { ...typography.bodyMedium, color: theme.text.primary },
  itemDesc: { ...typography.caption, color: theme.text.muted, marginTop: 2 },
  faqRow: { padding: spacing.lg },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { ...typography.bodyMedium, color: theme.text.primary, flex: 1 },
  faqAnswer: { ...typography.bodySmall, color: theme.text.secondary, marginTop: spacing.sm, lineHeight: 20 },
});
