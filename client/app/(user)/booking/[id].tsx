import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trainerAPI, bookingAPI, paymentAPI } from '../../../services/endpoints';
import { Trainer } from '../../../types';
import { Platform } from 'react-native';
import { loadRazorpayScript } from '../../../utils/razorpay';
import { RAZORPAY_KEY, APP_NAME } from '../../../constants/config';
import { useAuthStore } from '../../../store/authStore';

export default function BookingFlowScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [trainer, setTrainer] = useState<Trainer | null>(null);
  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      try { const res = await trainerAPI.getById(id!); setTrainer(res.data.data); } catch {}
      setLoading(false);
    })();
  }, [id]);

  const user = useAuthStore(s => s.user);

  const handleBook = async () => {
    if (!trainer) return;
    setBooking(true);
    try {
      // 1. Create booking in DB
      const bookingRes = await bookingAPI.create({
        trainerId: trainer._id,
        bookingDate: selectedDate,
        timeSlot: selectedSlot,
        sessionType,
      });
      const bookingId = bookingRes.data.data._id;

      // 2. Create Payment Order
      const orderRes = await paymentAPI.createOrder(bookingId, trainer.pricing);
      const { orderId, amount, currency } = orderRes.data.data;

      // 3. Open Razorpay Checkout (Web)
      if (Platform.OS === 'web') {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          Alert.alert('Error', 'Razorpay SDK failed to load. Are you online?');
          setBooking(false);
          return;
        }

        const options = {
          key: RAZORPAY_KEY,
          amount: amount.toString(),
          currency: currency,
          name: APP_NAME,
          description: `Booking with ${trainer.fullName}`,
          order_id: orderId,
          handler: async function (response: any) {
            try {
              await paymentAPI.verify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              Alert.alert('Success! 🎉', 'Payment successful. Your booking is confirmed.', [
                { text: 'View Bookings', onPress: () => router.replace('/(user)/(tabs)/bookings') },
              ]);
            } catch (err: any) {
              Alert.alert('Payment Verification Failed', err.message);
            }
          },
          prefill: {
            name: user?.name || user?.fullName,
            email: user?.email,
            contact: user?.mobile || '',
          },
          theme: {
            color: '#FF5722',
          },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.open();
      } else {
        // Mobile fallback (since we don't have native Razorpay SDK installed in Expo Go)
        Alert.alert('Success! 🎉', 'Booking created! (Payment skipped on mobile in dev mode)', [
          { text: 'View Bookings', onPress: () => router.replace('/(user)/(tabs)/bookings') },
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create booking');
    }
    setBooking(false);
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#FF5722" /></View>;
  if (!trainer) return <View style={styles.center}><Text style={styles.err}>Trainer not found</Text></View>;

  // Generate next 14 days
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return d.toISOString().split('T')[0];
  });

  const dayName = (d: string) => new Date(d).toLocaleDateString('en', { weekday: 'short' });
  const dayNum = (d: string) => new Date(d).getDate();
  const dayOfWeek = (d: string) => new Date(d).toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
  const availableSlots = selectedDate ? (trainer.availability?.[dayOfWeek(selectedDate)] || []) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : (router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/bookings'))}>
          <Text style={styles.backText}>← {step > 1 ? 'Back' : 'Close'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Book Session</Text>
        <Text style={styles.stepText}>Step {step}/3</Text>
      </View>

      <View style={styles.progress}>
        {[1, 2, 3].map((s) => <View key={s} style={[styles.progressDot, s <= step && styles.progressDotActive]} />)}
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>Select Session Type</Text>
            {trainer.sessionTypes?.map((type) => (
              <TouchableOpacity key={type} style={[styles.optionCard, sessionType === type && styles.optionCardActive]} onPress={() => setSessionType(type)}>
                <Text style={[styles.optionText, sessionType === type && styles.optionTextActive]}>{type}</Text>
                {sessionType === type && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>Select Date & Time</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
              {dates.map((d) => (
                <TouchableOpacity key={d} style={[styles.dateChip, selectedDate === d && styles.dateChipActive]} onPress={() => { setSelectedDate(d); setSelectedSlot(''); }}>
                  <Text style={[styles.dateDay, selectedDate === d && styles.dateDayActive]}>{dayName(d)}</Text>
                  <Text style={[styles.dateNum, selectedDate === d && styles.dateNumActive]}>{dayNum(d)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedDate && (
              <View>
                <Text style={styles.slotTitle}>Available Slots</Text>
                <View style={styles.slots}>
                  {availableSlots.length > 0 ? availableSlots.map((slot: string) => (
                    <TouchableOpacity key={slot} style={[styles.slotChip, selectedSlot === slot && styles.slotChipActive]} onPress={() => setSelectedSlot(slot)}>
                      <Text style={[styles.slotText, selectedSlot === slot && styles.slotTextActive]}>{slot}</Text>
                    </TouchableOpacity>
                  )) : <Text style={styles.noSlots}>No slots available on this day</Text>}
                </View>
              </View>
            )}
          </View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>Confirm Booking</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryName}>{trainer.fullName}</Text>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Session</Text><Text style={styles.summaryValue}>{sessionType}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Date</Text><Text style={styles.summaryValue}>{new Date(selectedDate).toLocaleDateString()}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Time</Text><Text style={styles.summaryValue}>{selectedSlot}</Text></View>
              <View style={[styles.summaryRow, styles.summaryTotal]}><Text style={styles.summaryLabel}>Total</Text><Text style={styles.totalPrice}>₹{trainer.pricing}</Text></View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.nextBtn, (step === 1 && !sessionType || step === 2 && (!selectedDate || !selectedSlot)) && styles.nextBtnDisabled]}
          disabled={step === 1 && !sessionType || step === 2 && (!selectedDate || !selectedSlot) || booking}
          onPress={() => step < 3 ? setStep(step + 1) : handleBook()}
        >
          <Text style={styles.nextBtnText}>{booking ? 'Booking...' : step === 3 ? 'Confirm & Book' : 'Continue'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f0f' },
  err: { color: '#F44336', fontSize: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  backText: { color: '#FF5722', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff' },
  stepText: { color: '#9E9E9E', fontSize: 13 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 16 },
  progressDot: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#242424' },
  progressDotActive: { backgroundColor: '#FF5722' },
  content: { flex: 1, paddingHorizontal: 20 },
  stepTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 20 },
  optionCard: { backgroundColor: '#1a1a1a', borderRadius: 16, padding: 18, marginBottom: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)', flexDirection: 'row', justifyContent: 'space-between' },
  optionCardActive: { borderColor: '#FF5722', backgroundColor: 'rgba(255,87,34,0.08)' },
  optionText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  optionTextActive: { color: '#FF5722' },
  check: { color: '#FF5722', fontSize: 18, fontWeight: '700' },
  dateScroll: { marginBottom: 24 },
  dateChip: { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: '#1a1a1a', marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', minWidth: 56 },
  dateChipActive: { backgroundColor: '#FF5722', borderColor: '#FF5722' },
  dateDay: { color: '#9E9E9E', fontSize: 12, fontWeight: '500' },
  dateDayActive: { color: '#fff' },
  dateNum: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  dateNumActive: { color: '#fff' },
  slotTitle: { fontSize: 16, fontWeight: '600', color: '#fff', marginBottom: 12 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  slotChipActive: { backgroundColor: '#FF5722', borderColor: '#FF5722' },
  slotText: { color: '#fff', fontSize: 14 },
  slotTextActive: { color: '#fff', fontWeight: '600' },
  noSlots: { color: '#666', fontSize: 14 },
  summaryCard: { backgroundColor: '#1a1a1a', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  summaryName: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  summaryLabel: { color: '#9E9E9E', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 14, fontWeight: '500' },
  summaryTotal: { borderBottomWidth: 0, marginTop: 8 },
  totalPrice: { color: '#FF5722', fontSize: 20, fontWeight: '700' },
  footer: { paddingHorizontal: 20, paddingBottom: 34, paddingTop: 12 },
  nextBtn: { backgroundColor: '#FF5722', borderRadius: 14, padding: 16, alignItems: 'center' },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
