import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeft, CheckCircle, Calendar, Clock, CreditCard } from 'lucide-react-native';
import { trainerAPI, bookingAPI, paymentAPI } from '../../../services/endpoints';
import { Trainer } from '../../../types';
import { loadRazorpayScript } from '../../../utils/razorpay';
import { RAZORPAY_KEY, APP_NAME } from '../../../constants/config';
import { useAuthStore } from '../../../store/authStore';
import { theme } from '../../../constants/colors';
import { typography } from '../../../constants/typography';
import { spacing, radius } from '../../../constants/spacing';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function BookingFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotMetadata, setSlotMetadata] = useState<Record<string, any>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (selectedDate && trainer) {
      setLoadingSlots(true);
      trainerAPI.getAvailability(trainer._id, selectedDate)
        .then(res => { setBookedSlots(res.data.data.bookedSlots || []); setSlotMetadata(res.data.data.slotMetadata || {}); })
        .catch(console.error)
        .finally(() => setLoadingSlots(false));
    } else { setBookedSlots([]); setSlotMetadata({}); }
  }, [selectedDate, trainer]);

  useEffect(() => {
    (async () => { try { const res = await trainerAPI.getById(id!); setTrainer(res.data.data); } catch {} setLoading(false); })();
  }, [id]);

  const user = useAuthStore(s => s.user);

  const handleBook = async () => {
    if (!trainer) return;
    setBooking(true);
    try {
      const bookingRes = await bookingAPI.create({ trainerId: trainer._id, bookingDate: selectedDate, timeSlot: selectedSlot, sessionType });
      const bookingId = bookingRes.data.data._id;
      const orderRes = await paymentAPI.createOrder({ bookingId, amount: trainer.pricing });
      const { orderId, amount, currency } = orderRes.data.data;

      if (Platform.OS === 'web') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) { window.alert('Razorpay SDK failed to load.'); setBooking(false); return; }
        const options = {
          key: RAZORPAY_KEY, amount: amount.toString(), currency, name: APP_NAME,
          description: `Booking with ${trainer.fullName}`, order_id: orderId,
          handler: async function (response: any) {
            try {
              await paymentAPI.verify({ razorpayOrderId: response.razorpay_order_id, razorpayPaymentId: response.razorpay_payment_id, razorpaySignature: response.razorpay_signature });
              window.alert('Payment successful! Your booking is confirmed.');
              router.replace('/(user)/(tabs)/bookings');
            } catch (err: any) { window.alert('Payment verification failed: ' + err.message); }
          },
          prefill: { name: user?.name || user?.fullName, email: user?.email, contact: user?.mobile || '' },
          theme: { color: '#7C4DFF' },
        };
        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      } else {
        Alert.alert('Success! 🎉', 'Booking created! (Payment skipped on mobile in dev mode)', [
          { text: 'View Bookings', onPress: () => router.replace('/(user)/(tabs)/bookings') },
        ]);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to create booking';
      if (Platform.OS === 'web') window.alert(msg); else Alert.alert('Error', msg);
    }
    setBooking(false);
  };

  if (loading) return <View style={styles.loadingState}><SkeletonLoader variant="card" count={2} /></View>;
  if (!trainer) return <View style={styles.loadingState}><Text style={{ ...typography.body, color: theme.status.error }}>Trainer not found</Text></View>;

  const dates = Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); return d.toISOString().split('T')[0]; });
  const dayName = (d: string) => new Date(d).toLocaleDateString('en', { weekday: 'short' });
  const dayNum = (d: string) => new Date(d).getDate();
  const dayOfWeek = (d: string) => new Date(d).toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
  const availableSlots = selectedDate ? (trainer.availability?.[dayOfWeek(selectedDate)] || []) : [];

  const isNextDisabled = (step === 1 && !sessionType) || (step === 2 && (!selectedDate || !selectedSlot));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : (router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/bookings'))} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Book Session</Text>
        <Text style={styles.stepText}>Step {step}/3</Text>
      </View>

      {/* Progress */}
      <View style={styles.progress}>
        {[1, 2, 3].map((s) => <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />)}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Step 1: Session Type */}
        {step === 1 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Select Session Type</Text>
            {trainer.sessionTypes?.map((type) => (
              <Card key={type} onPress={() => setSessionType(type)} style={[styles.optionCard, sessionType === type && styles.optionCardActive]}>
                <Text style={[styles.optionText, sessionType === type && styles.optionTextActive]}>{type}</Text>
                {sessionType === type && <CheckCircle size={20} color={theme.accent.purple} />}
              </Card>
            ))}
          </Animated.View>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Select Date & Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((d) => (
                <TouchableOpacity key={d} style={[styles.dateChip, selectedDate === d && styles.dateChipActive]} onPress={() => { setSelectedDate(d); setSelectedSlot(''); }} activeOpacity={0.7}>
                  <Text style={[styles.dateDay, selectedDate === d && styles.dateTextActive]}>{dayName(d)}</Text>
                  <Text style={[styles.dateNum, selectedDate === d && styles.dateTextActive]}>{dayNum(d)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedDate && (
              <View>
                <Text style={styles.slotTitle}>Available Slots</Text>
                <View style={styles.slots}>
                  {loadingSlots ? <ActivityIndicator color={theme.accent.purple} /> : availableSlots.length > 0 ? availableSlots.map((slot: string) => {
                    const isFullyBooked = bookedSlots.includes(slot);
                    const meta = slotMetadata[slot];
                    let isDisabled = isFullyBooked;
                    if (!isDisabled && meta && sessionType) {
                      const isRequestingGroup = sessionType.toLowerCase().includes('group') || sessionType.toLowerCase().includes('online');
                      const isExistingGroup = meta.sessionType.toLowerCase().includes('group') || meta.sessionType.toLowerCase().includes('online');
                      if (isRequestingGroup !== isExistingGroup) isDisabled = true;
                    }
                    return (
                      <TouchableOpacity key={slot} disabled={isDisabled} style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive, isDisabled && styles.slotChipDisabled]} onPress={() => setSelectedSlot(slot)} activeOpacity={0.7}>
                        <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive, isDisabled && styles.slotTextDisabled]}>{slot}</Text>
                        {meta && !isDisabled && <Text style={styles.slotCapacity}>{meta.remainingCapacity} left</Text>}
                      </TouchableOpacity>
                    );
                  }) : <Text style={styles.noSlots}>No slots available on this day</Text>}
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.stepTitle}>Confirm Booking</Text>
            <Card style={styles.summaryCard}>
              <Text style={styles.summaryName}>{trainer.fullName}</Text>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Session</Text><Text style={styles.summaryValue}>{sessionType}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Date</Text><Text style={styles.summaryValue}>{new Date(selectedDate).toLocaleDateString()}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Time</Text><Text style={styles.summaryValue}>{selectedSlot}</Text></View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0, marginTop: spacing.sm }]}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.totalPrice}>₹{trainer.pricing}</Text>
              </View>
            </Card>
          </Animated.View>
        )}
        <View style={{ height: spacing['5xl'] }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <Button
          title={booking ? 'Processing...' : step === 3 ? 'Confirm & Pay' : 'Continue'}
          onPress={() => step < 3 ? setStep(step + 1) : handleBook()}
          disabled={isNextDisabled || booking}
          loading={booking}
          fullWidth
          icon={step === 3 ? <CreditCard size={18} color="#fff" /> : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  loadingState: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.bg.primary, padding: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  backBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: theme.bg.card, alignItems: 'center', justifyContent: 'center' },
  title: { ...typography.h3, color: theme.text.primary },
  stepText: { ...typography.caption, color: theme.text.muted },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.lg },
  progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.bg.hover },
  progressDotActive: { backgroundColor: theme.accent.purple },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  stepTitle: { ...typography.h2, color: theme.text.primary, marginBottom: spacing.xl },
  optionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, padding: spacing.lg, borderWidth: 1.5, borderColor: theme.border.subtle },
  optionCardActive: { borderColor: theme.accent.purple, backgroundColor: `${theme.accent.purple}12` },
  optionText: { ...typography.bodyMedium, color: theme.text.primary },
  optionTextActive: { color: theme.accent.purple },
  dateScroll: { marginBottom: spacing.xl },
  dateChip: { alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.lg, backgroundColor: theme.bg.card, marginRight: spacing.sm, borderWidth: 1, borderColor: theme.border.subtle, minWidth: 56 },
  dateChipActive: { backgroundColor: theme.accent.purple, borderColor: theme.accent.purple },
  dateDay: { ...typography.caption, color: theme.text.muted },
  dateNum: { ...typography.bodyMedium, color: theme.text.primary, marginTop: spacing.xs },
  dateTextActive: { color: '#fff' },
  slotTitle: { ...typography.bodyMedium, color: theme.text.primary, marginBottom: spacing.md },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slotChip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: theme.bg.card, borderWidth: 1, borderColor: theme.border.subtle },
  slotChipActive: { backgroundColor: theme.accent.purple, borderColor: theme.accent.purple },
  slotChipDisabled: { backgroundColor: theme.bg.input, opacity: 0.5 },
  slotText: { ...typography.bodySmall, color: theme.text.primary },
  slotTextActive: { color: '#fff', fontWeight: '600' },
  slotTextDisabled: { color: theme.text.muted, textDecorationLine: 'line-through' },
  slotCapacity: { ...typography.micro, color: theme.accent.purple, textAlign: 'center', marginTop: 2 },
  noSlots: { ...typography.bodySmall, color: theme.text.muted },
  summaryCard: { padding: spacing.xl },
  summaryName: { ...typography.h3, color: theme.text.primary, marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: theme.border.subtle },
  summaryLabel: { ...typography.body, color: theme.text.secondary },
  summaryValue: { ...typography.bodyMedium, color: theme.text.primary },
  totalPrice: { ...typography.h2, color: theme.accent.purple },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: theme.border.subtle },
});
