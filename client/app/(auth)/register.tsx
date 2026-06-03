import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Camera, Plus } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { trainerAPI, contentAPI } from '../../services/endpoints';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';

export default function RegisterScreen() {
  const [role, setRole] = useState<'user' | 'trainer'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  
  // Trainer specific
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('');
  const [pricing, setPricing] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [certifications, setCertifications] = useState('');
  const [sessionTypes, setSessionTypes] = useState('');
  const [languages, setLanguages] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  
  // Schedule & Capacity
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState('60');
  const [maxGroupCapacity, setMaxGroupCapacity] = useState('10');
  
  // File uploads
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);
  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);

  useEffect(() => {
    trainerAPI.getCategories().then(res => {
      if (res.data?.data) setCategories(res.data.data);
    }).catch(() => {});
  }, []);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto(asset.uri);
      setUploadingPhoto(true);
      try {
        let formData = new FormData();
        if (Platform.OS === 'web') {
           const res = await fetch(asset.uri);
           const blob = await res.blob();
           formData.append('image', blob as any, 'profile.jpg');
        } else {
           const localUri = asset.uri;
           const filename = localUri.split('/').pop() || 'profile.jpg';
           const match = /\.(\w+)$/.exec(filename);
           const type = match ? `image/${match[1]}` : `image`;
           formData.append('image', { uri: localUri, name: filename, type } as any);
        }
        const uploadRes = await contentAPI.uploadImage(formData);
        if (uploadRes.data?.data?.url) setPhoto(uploadRes.data.data.url);
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const pickPortfolioImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [4, 3], quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploadingPortfolio(true);
      try {
        let formData = new FormData();
        if (Platform.OS === 'web') {
           const res = await fetch(asset.uri);
           const blob = await res.blob();
           formData.append('image', blob as any, 'portfolio.jpg');
        } else {
           const localUri = asset.uri;
           const filename = localUri.split('/').pop() || 'portfolio.jpg';
           const match = /\.(\w+)$/.exec(filename);
           const type = match ? `image/${match[1]}` : `image`;
           formData.append('image', { uri: localUri, name: filename, type } as any);
        }
        const uploadRes = await contentAPI.uploadImage(formData);
        if (uploadRes.data?.data?.url) setPortfolioImages(prev => [...prev, uploadRes.data.data.url]);
      } catch (err) {
        Alert.alert('Upload Failed', 'Could not upload portfolio image.');
      } finally {
        setUploadingPortfolio(false);
      }
    }
  };

  const generateAvailability = () => {
    const slots: string[] = [];
    const current = new Date(`2000-01-01T${startTime.padStart(5, '0')}:00`);
    const end = new Date(`2000-01-01T${endTime.padStart(5, '0')}:00`);
    const duration = parseInt(slotDuration) || 60;
    while (current < end) {
      slots.push(current.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
      current.setMinutes(current.getMinutes() + duration);
    }
    return { monday: slots, tuesday: slots, wednesday: slots, thursday: slots, friday: slots, saturday: slots, sunday: [] };
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      if (Platform.OS === 'web') window.alert('Please fill in required fields (Name, Email, Password)');
      else Alert.alert('Error', 'Please fill in required fields (Name, Email, Password)');
      return;
    }
    setLoading(true);
    try {
      await register({
        name, fullName: name, email, password, mobile, role, city, gender,
        profileImage: photo, profilePhoto: photo, resume: resumeUrl,
        ...(role === 'trainer' && {
          category, experience: parseInt(experience) || 0, pricing: parseInt(pricing) || 0,
          specializations, certifications, sessionTypes, languages, portfolioImages,
          slotDuration: parseInt(slotDuration) || 60, maxGroupCapacity: parseInt(maxGroupCapacity) || 10,
          availability: generateAvailability(),
        }),
      });
      if (role === 'trainer') router.replace('/(trainer)/(tabs)/dashboard');
      else router.replace('/(user)/(tabs)/home');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Something went wrong';
      if (Platform.OS === 'web') window.alert(`Registration Failed: ${msg}`);
      else Alert.alert('Registration Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.desc}>Join CoachME today</Text>
        </Animated.View>

        {/* Role Toggle */}
        <Animated.View entering={FadeInDown.duration(400).delay(200)} style={styles.roleToggle}>
          <TouchableOpacity style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} onPress={() => setRole('user')}>
            <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleBtn, role === 'trainer' && styles.roleBtnActive]} onPress={() => setRole('trainer')}>
            <Text style={[styles.roleText, role === 'trainer' && styles.roleTextActive]}>Trainer</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Photo Upload */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)} style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoUploadBtn} onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                {uploadingPhoto ? (
                  <Text style={styles.photoText}>Uploading...</Text>
                ) : (
                  <>
                    <Camera size={24} color={theme.text.muted} />
                    <Text style={styles.photoText}>Upload Photo</Text>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Form Fields */}
        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Input label="Full Name *" placeholder="Your full name" value={name} onChangeText={setName} />
          <View style={{ height: spacing.md }} />
          <Input label="Email *" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <View style={{ height: spacing.md }} />
          <Input label="Mobile" placeholder="+91 XXXXXXXXXX" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
          <View style={{ height: spacing.md }} />
          <Input label="Password *" placeholder="Min 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
          <View style={{ height: spacing.md }} />
          <Input label="City" placeholder="Your city" value={city} onChangeText={setCity} />
        </Animated.View>

        {/* Gender */}
        <View style={{ height: spacing.lg }} />
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {(['male', 'female', 'other'] as const).map(g => (
            <Chip key={g} label={g.charAt(0).toUpperCase() + g.slice(1)} selected={gender === g} onPress={() => setGender(g)} size="md" />
          ))}
        </View>

        {/* Trainer-specific fields */}
        {role === 'trainer' && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Professional Details</Text>
            </View>

            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
              {categories.map((c) => (
                <View key={c.slug} style={{ marginRight: spacing.sm }}>
                  <Chip label={c.name} selected={category === c.slug} onPress={() => setCategory(c.slug)} />
                </View>
              ))}
            </ScrollView>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input label="Experience (yrs)" placeholder="0" value={experience} onChangeText={setExperience} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Pricing (₹/hr)" placeholder="0" value={pricing} onChangeText={setPricing} keyboardType="numeric" />
              </View>
            </View>
            <View style={{ height: spacing.md }} />

            <Input label="Specializations (comma separated)" placeholder="Yoga, Pilates, HIIT" value={specializations} onChangeText={setSpecializations} />
            <View style={{ height: spacing.md }} />
            <Input label="Certifications (comma separated)" placeholder="NASM, ACE" value={certifications} onChangeText={setCertifications} />
            <View style={{ height: spacing.md }} />
            <Input label="Session Types (comma separated)" placeholder="1-on-1, Group, Online" value={sessionTypes} onChangeText={setSessionTypes} />

            {/* Schedule & Capacity */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Schedule & Capacity</Text>
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input label="Start Time" placeholder="09:00" value={startTime} onChangeText={setStartTime} />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="End Time" placeholder="17:00" value={endTime} onChangeText={setEndTime} />
              </View>
            </View>
            <View style={{ height: spacing.md }} />
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: spacing.sm }}>
                <Input label="Slot Duration (mins)" placeholder="60" value={slotDuration} onChangeText={setSlotDuration} keyboardType="numeric" />
              </View>
              <View style={{ flex: 1 }}>
                <Input label="Max Group Capacity" placeholder="10" value={maxGroupCapacity} onChangeText={setMaxGroupCapacity} keyboardType="numeric" />
              </View>
            </View>

            {/* Portfolio */}
            <View style={{ height: spacing.lg }} />
            <Text style={styles.label}>Portfolio Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false} style={styles.portfolioScroll}>
              {portfolioImages.map((img, i) => (
                <Image key={i} source={{ uri: img }} style={styles.portfolioImg} />
              ))}
              <TouchableOpacity style={styles.addPortfolioBtn} onPress={pickPortfolioImage} disabled={uploadingPortfolio}>
                {uploadingPortfolio ? (
                  <Text style={styles.addPortfolioText}>...</Text>
                ) : (
                  <Plus size={24} color={theme.text.muted} />
                )}
              </TouchableOpacity>
            </ScrollView>

            <View style={{ height: spacing.md }} />
            <Input label="Languages (comma separated)" placeholder="English, Hindi" value={languages} onChangeText={setLanguages} />
            <View style={{ height: spacing.md }} />
            <Input label="Resume Link (PDF/Drive URL)" placeholder="https://..." value={resumeUrl} onChangeText={setResumeUrl} autoCapitalize="none" />
          </>
        )}

        <View style={{ height: spacing['2xl'] }} />
        <Button title={loading ? 'Creating Account...' : 'Create Account'} onPress={handleRegister} loading={loading} disabled={loading} fullWidth />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.push('/(auth)/login')}>
            <Text style={styles.link}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg.primary },
  scroll: { paddingHorizontal: spacing['2xl'], paddingVertical: spacing['5xl'] },
  title: { ...typography.h1, color: theme.text.primary },
  desc: { ...typography.body, color: theme.text.secondary, marginBottom: spacing['2xl'], marginTop: spacing.xs },
  
  roleToggle: { flexDirection: 'row', backgroundColor: theme.bg.card, borderRadius: radius.lg, padding: spacing.xs, marginBottom: spacing['2xl'], borderWidth: 1, borderColor: theme.border.subtle },
  roleBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  roleBtnActive: { backgroundColor: theme.accent.purple },
  roleText: { color: theme.text.secondary, ...typography.bodyMedium },
  roleTextActive: { color: '#FFFFFF' },
  
  label: { ...typography.label, color: theme.text.secondary, marginBottom: spacing.sm },
  genderRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  
  photoContainer: { alignItems: 'center', marginBottom: spacing['2xl'] },
  photoUploadBtn: { width: 100, height: 100, borderRadius: radius.full, backgroundColor: theme.bg.card, borderWidth: 2, borderColor: theme.border.default, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center', gap: spacing.xs },
  photoText: { color: theme.text.muted, ...typography.caption, fontWeight: '600' },
  
  sectionHeader: { marginTop: spacing['2xl'], marginBottom: spacing.lg },
  sectionTitle: { ...typography.h3, color: theme.text.primary },
  row: { flexDirection: 'row' },
  
  portfolioScroll: { flexDirection: 'row', marginTop: spacing.sm, marginBottom: spacing.lg },
  portfolioImg: { width: 80, height: 80, borderRadius: radius.md, marginRight: spacing.md },
  addPortfolioBtn: { width: 80, height: 80, borderRadius: radius.md, backgroundColor: theme.bg.input, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border.default, borderStyle: 'dashed' },
  addPortfolioText: { color: theme.text.muted, ...typography.body, fontWeight: '600' },
  
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing['2xl'], paddingBottom: spacing.xl },
  footerText: { color: theme.text.secondary, ...typography.body },
  link: { color: theme.accent.purple, ...typography.body, fontWeight: '700' },
});
