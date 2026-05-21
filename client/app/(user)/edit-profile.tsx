import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { userAPI } from '../../services/endpoints';

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

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const parseList = (str: string) => str ? str.split(',').map(s => s.trim()).filter(Boolean) : [];
      
      const payload: any = {
        name,
        fullName: name,
        city,
        mobile,
        profileImage: photo,
        profilePhoto: photo,
      };
      
      if (role === 'trainer') {
        payload.resume = resume;
        payload.specializations = parseList(specializations);
        payload.certifications = parseList(certifications);
        payload.sessionTypes = parseList(sessionTypes);
        payload.languages = parseList(languages);
      }

      // Hit the real backend endpoint to update the database
      const res = await userAPI.updateProfile(payload);
      
      // Update local store with the new data from server
      setUser(res.data.data, role || 'user');
      
      if (Platform.OS === 'web') {
        window.alert('Profile updated successfully!');
      }
      router.back();
    } catch (err) {
      console.error(err);
      if (Platform.OS === 'web') {
        window.alert('Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 60 }}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.photoContainer}>
        <TouchableOpacity style={styles.photoUploadBtn} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoText}>Change Photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholderTextColor="#666" />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email (Cannot be changed)</Text>
          <TextInput style={[styles.input, { opacity: 0.5 }]} value={(user as any)?.email} editable={false} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mobile</Text>
          <TextInput style={styles.input} value={mobile} onChangeText={setMobile} placeholder="+91..." placeholderTextColor="#666" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Mumbai" placeholderTextColor="#666" />
        </View>

        {role === 'trainer' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Specializations (comma separated)</Text>
              <TextInput style={styles.input} value={specializations} onChangeText={setSpecializations} placeholder="Yoga, Pilates, HIIT" placeholderTextColor="#666" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Certifications (comma separated)</Text>
              <TextInput style={styles.input} value={certifications} onChangeText={setCertifications} placeholder="NASM, ACE" placeholderTextColor="#666" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Session Types (comma separated)</Text>
              <TextInput style={styles.input} value={sessionTypes} onChangeText={setSessionTypes} placeholder="1-on-1, Group, Online" placeholderTextColor="#666" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Languages (comma separated)</Text>
              <TextInput style={styles.input} value={languages} onChangeText={setLanguages} placeholder="English, Hindi" placeholderTextColor="#666" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Resume Link (PDF/Drive URL)</Text>
              <TextInput style={styles.input} value={resume} onChangeText={setResume} placeholder="https://..." placeholderTextColor="#666" autoCapitalize="none" />
            </View>
          </>
        )}

        <TouchableOpacity style={[styles.saveBtn, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'web' ? 40 : 60, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  backBtn: { width: 60 },
  backText: { color: '#9E9E9E', fontSize: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '700' },
  
  photoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  photoUploadBtn: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#1a1a1a', borderWidth: 2, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoIcon: { fontSize: 28, marginBottom: 8 },
  photoText: { color: '#666', fontSize: 12, fontWeight: '600' },

  form: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#9E9E9E', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, color: '#fff', fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  saveBtn: { backgroundColor: '#FF5722', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
