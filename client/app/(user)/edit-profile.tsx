import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '../../components/Avatar';
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from '../../store/authStore';
import { userAPI, contentAPI } from '../../services/endpoints';

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
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
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
        if (uploadRes.data?.data?.url) {
          setPhoto(uploadRes.data.data.url); // Set secure Cloudinary URL
        }
      } catch (err) {
        console.error("Upload failed", err);
        if (Platform.OS === 'web') {
          window.alert('Could not upload image to cloud.');
        }
      } finally {
        setUploadingPhoto(false);
      }
    }
  };

  const pickPortfolioImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
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
        if (uploadRes.data?.data?.url) {
          setPortfolioImages(prev => [...prev, uploadRes.data.data.url]);
        }
      } catch (err) {
        console.error("Upload failed", err);
      } finally {
        setUploadingPortfolio(false);
      }
    }
  };

  const removePortfolioImage = (index: number) => {
    setPortfolioImages(prev => prev.filter((_, i) => i !== index));
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
        payload.portfolioImages = portfolioImages;
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.canGoBack() ? router.back() : router.push('/(user)/(tabs)/profile')}>
          <Text style={styles.backText}>{'<'} Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.photoContainer}>
        <TouchableOpacity style={styles.photoUploadBtn} onPress={pickImage}>
          {photo ? (
            <Avatar 
              uri={photo} 
              style={styles.photoPreview} 
              containerStyle={styles.photoPreview} 
              fallbackIcon="👤" 
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              {uploadingPhoto ? (
                <Text style={styles.photoText}>Uploading...</Text>
              ) : (
                <>
                  <Text style={styles.photoIcon}>📷</Text>
                  <Text style={styles.photoText}>Change Photo</Text>
                </>
              )}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Portfolio Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row', marginTop: 10 }}>
                {portfolioImages.map((img, idx) => (
                  <View key={idx} style={{ position: 'relative', marginRight: 10 }}>
                    <Image source={{ uri: img }} style={{ width: 80, height: 80, borderRadius: 12 }} />
                    <TouchableOpacity 
                      style={{ position: 'absolute', top: -5, right: -5, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}
                      onPress={() => removePortfolioImage(idx)}
                    >
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>X</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity 
                  style={{ width: 80, height: 80, borderRadius: 12, backgroundColor: '#0A0A0A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center' }}
                  onPress={pickPortfolioImage}
                >
                  <Text style={{ fontSize: 24, color: '#666' }}>+</Text>
                </TouchableOpacity>
              </ScrollView>
              {uploadingPortfolio && <Text style={{ color: '#9D00FF', fontSize: 10, marginTop: 5 }}>Uploading...</Text>}
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
  backText: { color: '#A1A1AA', fontSize: 12 },
  title: { color: '#fff', fontSize: 12, fontWeight: '700' },
  
  photoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
  photoUploadBtn: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#0A0A0A', borderWidth: 2, borderColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoIcon: { fontSize: 12, marginBottom: 8 },
  photoText: { color: '#666', fontSize: 12, fontWeight: '600' },

  form: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: { color: '#A1A1AA', fontSize: 12, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: '#0A0A0A', borderRadius: 12, padding: 16, color: '#fff', fontSize: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  
  saveBtn: { backgroundColor: '#9D00FF', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
