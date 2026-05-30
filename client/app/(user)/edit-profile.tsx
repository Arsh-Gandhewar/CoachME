import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Camera, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { userAPI, contentAPI } from '../../services/endpoints';
import { theme } from '../../constants/colors';
import { typography } from '../../constants/typography';
import { spacing, radius } from '../../constants/spacing';
import ScreenWrapper from '../../components/ScreenWrapper';
import Header from '../../components/Header';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser, role } = useAuthStore();
  
  const [name, setName] = useState((user as any)?.name || (user as any)?.fullName || '');
  const [city, setCity] = useState((user as any)?.city || '');
  const [mobile, setMobile] = useState((user as any)?.mobile || '');
  const [photo, setPhoto] = useState<string | null>((user as any)?.profileImage || (user as any)?.profilePhoto || null);
  const [resume, setResume] = useState((user as any)?.resume || '');
  const [specializations, setSpecializations] = useState((user as any)?.specializations?.join(', ') || '');
  const [certifications, setCertifications] = useState((user as any)?.certifications?.join(', ') || '');
  const [sessionTypes, setSessionTypes] = useState((user as any)?.sessionTypes?.join(', ') || '');
  const [languages, setLanguages] = useState((user as any)?.languages?.join(', ') || '');
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [portfolioImages, setPortfolioImages] = useState<string[]>((user as any)?.portfolioImages || []);
  const [uploadingPortfolio, setUploadingPortfolio] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.5 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto(asset.uri);
      setUploadingPhoto(true);
      try {
        let formData = new FormData();
        if (Platform.OS === 'web') { const res = await fetch(asset.uri); const blob = await res.blob(); formData.append('image', blob as any, 'profile.jpg'); }
        else { const localUri = asset.uri; const filename = localUri.split('/').pop() || 'profile.jpg'; const match = /\.(\w+)$/.exec(filename); const type = match ? `image/${match[1]}` : `image`; formData.append('image', { uri: localUri, name: filename, type } as any); }
        const uploadRes = await contentAPI.uploadImage(formData);
        if (uploadRes.data?.data?.url) setPhoto(uploadRes.data.data.url);
      } catch (err) { console.error("Upload failed", err); }
      finally { setUploadingPhoto(false); }
    }
  };

  const pickPortfolioImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.5 });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setUploadingPortfolio(true);
      try {
        let formData = new FormData();
        if (Platform.OS === 'web') { const res = await fetch(asset.uri); const blob = await res.blob(); formData.append('image', blob as any, 'portfolio.jpg'); }
        else { const localUri = asset.uri; const filename = localUri.split('/').pop() || 'portfolio.jpg'; const match = /\.(\w+)$/.exec(filename); const type = match ? `image/${match[1]}` : `image`; formData.append('image', { uri: localUri, name: filename, type } as any); }
        const uploadRes = await contentAPI.uploadImage(formData);
        if (uploadRes.data?.data?.url) setPortfolioImages(prev => [...prev, uploadRes.data.data.url]);
      } catch (err) { console.error("Upload failed", err); }
      finally { setUploadingPortfolio(false); }
    }
  };

  const removePortfolioImage = (index: number) => setPortfolioImages(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setLoading(true);
    try {
      const parseList = (str: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
      const payload: any = { name, fullName: name, city, mobile, profileImage: photo, profilePhoto: photo };
      if (role === 'trainer') { payload.resume = resume; payload.specializations = parseList(specializations); payload.certifications = parseList(certifications); payload.sessionTypes = parseList(sessionTypes); payload.languages = parseList(languages); payload.portfolioImages = portfolioImages; }
      const res = await userAPI.updateProfile(payload);
      setUser(res.data.data, role || 'user');
      if (Platform.OS === 'web') window.alert('Profile updated successfully!');
      router.back();
    } catch (err) { console.error(err); if (Platform.OS === 'web') window.alert('Failed to update profile'); }
    finally { setLoading(false); }
  };

  return (
    <ScreenWrapper>
      <Header title="Edit Profile" onBack={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')} />

      {/* Photo */}
      <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.photoContainer}>
        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
          {photo ? (
            <Avatar uri={photo} name={name} size="xl" />
          ) : (
            <View style={styles.photoPlaceholder}>
              {uploadingPhoto ? <Text style={styles.photoText}>Uploading...</Text> : <Camera size={28} color={theme.text.muted} />}
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={pickImage}><Text style={styles.changePhotoText}>Change Photo</Text></TouchableOpacity>
      </Animated.View>

      {/* Form */}
      <Animated.View entering={FadeInDown.duration(400).delay(200)}>
        <Input label="Full Name" value={name} onChangeText={setName} />
        <View style={{ height: spacing.md }} />
        <Input label="Email (Cannot be changed)" value={(user as any)?.email || ''} editable={false} />
        <View style={{ height: spacing.md }} />
        <Input label="Mobile" value={mobile} onChangeText={setMobile} placeholder="+91..." keyboardType="phone-pad" />
        <View style={{ height: spacing.md }} />
        <Input label="City" value={city} onChangeText={setCity} placeholder="Mumbai" />
      </Animated.View>

      {role === 'trainer' && (
        <Animated.View entering={FadeInDown.duration(400).delay(350)}>
          <Text style={styles.sectionTitle}>Professional Details</Text>
          <Input label="Specializations (comma separated)" value={specializations} onChangeText={setSpecializations} placeholder="Yoga, Pilates, HIIT" />
          <View style={{ height: spacing.md }} />
          <Input label="Certifications (comma separated)" value={certifications} onChangeText={setCertifications} placeholder="NASM, ACE" />
          <View style={{ height: spacing.md }} />
          <Input label="Session Types (comma separated)" value={sessionTypes} onChangeText={setSessionTypes} placeholder="1-on-1, Group, Online" />
          <View style={{ height: spacing.md }} />
          <Input label="Languages (comma separated)" value={languages} onChangeText={setLanguages} placeholder="English, Hindi" />
          <View style={{ height: spacing.md }} />
          <Input label="Resume Link (PDF/Drive URL)" value={resume} onChangeText={setResume} placeholder="https://..." autoCapitalize="none" />

          <Text style={[styles.sectionTitle, { marginTop: spacing['2xl'] }]}>Portfolio</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {portfolioImages.map((img, idx) => (
              <View key={idx} style={styles.portfolioWrap}>
                <Image source={{ uri: img }} style={styles.portfolioImg} />
                <TouchableOpacity style={styles.removeImg} onPress={() => removePortfolioImage(idx)}>
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addPortfolio} onPress={pickPortfolioImage}>
              <Plus size={24} color={theme.text.muted} />
            </TouchableOpacity>
          </ScrollView>
          {uploadingPortfolio && <Text style={styles.uploadingText}>Uploading...</Text>}
        </Animated.View>
      )}

      <View style={{ height: spacing['2xl'] }} />
      <Button title={loading ? 'Saving...' : 'Save Changes'} onPress={handleSave} loading={loading} disabled={loading} fullWidth />
      <View style={{ height: spacing['4xl'] }} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  photoContainer: { alignItems: 'center', marginVertical: spacing['2xl'] },
  photoBtn: { width: 100, height: 100, borderRadius: radius.full, overflow: 'hidden' },
  photoPlaceholder: { width: 100, height: 100, borderRadius: radius.full, backgroundColor: theme.bg.card, borderWidth: 2, borderColor: theme.border.default, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  photoText: { ...typography.caption, color: theme.text.muted },
  changePhotoText: { ...typography.bodySmall, color: theme.accent.purple, fontWeight: '600', marginTop: spacing.sm },
  sectionTitle: { ...typography.h3, color: theme.text.primary, marginTop: spacing.xl, marginBottom: spacing.lg },
  portfolioWrap: { position: 'relative', marginRight: spacing.md },
  portfolioImg: { width: 80, height: 80, borderRadius: radius.md },
  removeImg: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: theme.status.error, alignItems: 'center', justifyContent: 'center' },
  addPortfolio: { width: 80, height: 80, borderRadius: radius.md, backgroundColor: theme.bg.input, borderWidth: 1, borderColor: theme.border.default, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' },
  uploadingText: { ...typography.caption, color: theme.accent.purple, marginTop: spacing.xs },
});
