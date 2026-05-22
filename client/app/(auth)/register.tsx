import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { trainerAPI, contentAPI } from '../../services/endpoints';

export default function RegisterScreen() {
  const [role, setRole] = useState<'user' | 'trainer'>('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  
  // Trainer specific
  const [category, setCategory] = useState('');
  const [experience, setExperience] = useState('');
  const [pricing, setPricing] = useState('');
  const [specializations, setSpecializations] = useState('');
  const [certifications, setCertifications] = useState('');
  const [sessionTypes, setSessionTypes] = useState('');
  const [languages, setLanguages] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  
  // File uploads
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [categories, setCategories] = useState<{slug: string, name: string}[]>([]);

  useEffect(() => {
    trainerAPI.getCategories().then(res => {
      if (res.data?.data) {
        setCategories(res.data.data);
      }
    }).catch(err => console.log('Failed to fetch categories:', err));
  }, []);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const register = useAuthStore((s) => s.register);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setPhoto(asset.uri); // Temporary preview
      
      setUploadingPhoto(true);
      try {
        let formData = new FormData();
        
        if (Platform.OS === 'web') {
           // For Web, fetch the blob and append
           const res = await fetch(asset.uri);
           const blob = await res.blob();
           formData.append('image', blob as any, 'profile.jpg');
        } else {
           // For Mobile, append the object directly
           const localUri = asset.uri;
           const filename = localUri.split('/').pop() || 'profile.jpg';
           const match = /\.(\w+)$/.exec(filename);
           const type = match ? `image/${match[1]}` : `image`;
           formData.append('image', { uri: localUri, name: filename, type } as any);
        }

        const uploadRes = await contentAPI.uploadImage(formData);
        if (uploadRes.data?.data?.url) {
          setPhoto(uploadRes.data.data.url); // Replace with secure Cloudinary URL
        }
      } catch (err) {
        console.error("Upload failed", err);
        Alert.alert('Upload Failed', 'Could not upload image to cloud.');
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      if (Platform.OS === 'web') {
        window.alert('Please fill in required fields (Name, Email, Password)');
      } else {
        Alert.alert('Error', 'Please fill in required fields (Name, Email, Password)');
      }
      return;
    }
    setLoading(true);
    try {
      await register({
        name,
        fullName: name,
        email,
        password,
        mobile,
        role,
        city,
        profileImage: photo,
        profilePhoto: photo, // Trainer schema uses this
        resume: resumeUrl,
        ...(role === 'trainer' && {
          category,
          experience: parseInt(experience) || 0,
          pricing: parseInt(pricing) || 0,
          specializations,
          certifications,
          sessionTypes,
          languages,
        }),
      });
      
      // Explicitly push the user to their respective dashboard since AuthGate can have a race condition on web
      if (role === 'trainer') {
        router.replace('/(trainer)/(tabs)/dashboard');
      } else {
        router.replace('/(user)/(tabs)/home');
      }

    } catch (error: any) {
      const msg = error.response?.data?.message || 'Something went wrong';
      if (Platform.OS === 'web') {
        window.alert(`Registration Failed: ${msg}`);
      } else {
        Alert.alert('Registration Failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.desc}>Join CoachME today</Text>

        <View style={styles.roleToggle}>
          <TouchableOpacity style={[styles.roleBtn, role === 'user' && styles.roleBtnActive]} onPress={() => setRole('user')}>
            <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleBtn, role === 'trainer' && styles.roleBtnActive]} onPress={() => setRole('trainer')}>
            <Text style={[styles.roleText, role === 'trainer' && styles.roleTextActive]}>Trainer</Text>
          </TouchableOpacity>
        </View>

        {/* Photo Upload for both User and Trainer */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoUploadBtn} onPress={pickImage}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                {uploadingPhoto ? (
                  <Text style={styles.photoText}>Uploading...</Text>
                ) : (
                  <>
                    <Text style={styles.photoIcon}>📷</Text>
                    <Text style={styles.photoText}>Upload Photo</Text>
                  </>
                )}
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor="#666" value={name} onChangeText={setName} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} placeholder="your@email.com" placeholderTextColor="#666" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile</Text>
          <TextInput style={styles.input} placeholder="+91 XXXXXXXXXX" placeholderTextColor="#666" value={mobile} onChangeText={setMobile} keyboardType="phone-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password *</Text>
          <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor="#666" value={password} onChangeText={setPassword} secureTextEntry />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} placeholder="Your city" placeholderTextColor="#666" value={city} onChangeText={setCity} />
        </View>

        {role === 'trainer' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {categories.map((c) => (
                  <TouchableOpacity key={c.slug} style={[styles.catChip, category === c.slug && styles.catChipActive]} onPress={() => setCategory(c.slug)}>
                    <Text style={[styles.catText, category === c.slug && styles.catTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Experience (yrs)</Text>
                <TextInput style={styles.input} placeholder="0" placeholderTextColor="#666" value={experience} onChangeText={setExperience} keyboardType="numeric" />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Pricing (₹/hr)</Text>
                <TextInput style={styles.input} placeholder="0" placeholderTextColor="#666" value={pricing} onChangeText={setPricing} keyboardType="numeric" />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specializations (comma separated)</Text>
              <TextInput style={styles.input} placeholder="Yoga, Pilates, HIIT" placeholderTextColor="#666" value={specializations} onChangeText={setSpecializations} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Certifications (comma separated)</Text>
              <TextInput style={styles.input} placeholder="NASM, ACE" placeholderTextColor="#666" value={certifications} onChangeText={setCertifications} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Session Types (comma separated)</Text>
              <TextInput style={styles.input} placeholder="1-on-1, Group, Online" placeholderTextColor="#666" value={sessionTypes} onChangeText={setSessionTypes} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Languages (comma separated)</Text>
              <TextInput style={styles.input} placeholder="English, Hindi" placeholderTextColor="#666" value={languages} onChangeText={setLanguages} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Resume Link (PDF/Drive URL)</Text>
              <TextInput style={styles.input} placeholder="https://..." placeholderTextColor="#666" value={resumeUrl} onChangeText={setResumeUrl} autoCapitalize="none" />
            </View>
          </>
        )}

        <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
        </TouchableOpacity>

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
  container: { flex: 1, backgroundColor: '#0f0f0f' },
  scroll: { paddingHorizontal: 24, paddingVertical: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#fff' },
  desc: { fontSize: 14, color: '#9E9E9E', marginBottom: 24, marginTop: 4 },
  
  roleToggle: { flexDirection: 'row', backgroundColor: '#1a1a1a', borderRadius: 14, padding: 4, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  roleBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  roleBtnActive: { backgroundColor: '#FF5722' },
  roleText: { color: '#9E9E9E', fontWeight: '600', fontSize: 14 },
  roleTextActive: { color: '#fff' },
  
  photoContainer: { alignItems: 'center', marginBottom: 24 },
  photoUploadBtn: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoIcon: { fontSize: 24, marginBottom: 4 },
  photoText: { color: '#666', fontSize: 11, fontWeight: '600' },

  resumeUploadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed' },
  resumeIcon: { fontSize: 18, marginRight: 10 },
  resumeText: { color: '#FF5722', fontSize: 14, flex: 1 },

  inputGroup: { marginBottom: 14 },
  label: { fontSize: 13, color: '#9E9E9E', marginBottom: 6, fontWeight: '500' },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, fontSize: 15, color: '#fff', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  row: { flexDirection: 'row' },
  catScroll: { marginBottom: 4 },
  catChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#1a1a1a', marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  catChipActive: { backgroundColor: 'rgba(255,87,34,0.15)', borderColor: '#FF5722' },
  catText: { color: '#9E9E9E', fontSize: 13, textTransform: 'capitalize' },
  catTextActive: { color: '#FF5722' },
  
  btn: { backgroundColor: '#FF5722', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 16 },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24, paddingBottom: 20 },
  footerText: { color: '#9E9E9E', fontSize: 14 },
  link: { color: '#FF5722', fontSize: 14, fontWeight: '600' },
});
