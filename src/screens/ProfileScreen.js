import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, globalStyles } from '../styles/globalStyles';

const STORAGE_KEY = '@foodie_user_profile';
const FAVORITES_KEY = '@foodie_favorites';
const THEME_KEY = '@foodie_dark_mode';

const ProfileScreen = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const theme = darkMode ? darkTheme : lightTheme;

  useEffect(() => {
    loadProfile();
    loadTheme();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const profile = JSON.parse(stored);
        setUserName(profile.name || '');
        setUserEmail(profile.email || '');
        setUserPhone(profile.phone || '');
        setUserAddress(profile.address || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      setFavorites(stored ? JSON.parse(stored) : []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_KEY);
      if (stored !== null) setDarkMode(JSON.parse(stored));
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleDarkMode = async (value) => {
    setDarkMode(value);
    try {
      await AsyncStorage.setItem(THEME_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const removeFavorite = async (id) => {
    const updated = favorites.filter((fav) => fav.id !== id);
    setFavorites(updated);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const saveProfile = async () => {
    try {
      const profile = {
        name: userName,
        email: userEmail,
        phone: userPhone,
        address: userAddress,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      setIsEditing(false);
      Alert.alert('¡Guardado!', 'Tu perfil ha sido actualizado.');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'No se pudo guardar el perfil.');
    }
  };

  const clearProfile = async () => {
    Alert.alert(
      'Borrar perfil',
      '¿Estás seguro de que deseas borrar toda tu información?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setUserName('');
            setUserEmail('');
            setUserPhone('');
            setUserAddress('');
            setIsEditing(false);
            Alert.alert('Perfil borrado', 'Tu información ha sido eliminada.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[globalStyles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
        <View style={styles.header}>
          <Text style={[globalStyles.title, { color: theme.textPrimary }]}>
            Mi Perfil 👤
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {userName ? userName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
            <Text style={[styles.avatarName, { color: theme.textPrimary }]}>
              {userName || 'Sin nombre'}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Nombre completo
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                {
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.surface,
                },
                !isEditing && styles.fieldDisabled,
              ]}
              value={userName}
              onChangeText={setUserName}
              placeholder="Tu nombre"
              placeholderTextColor={COLORS.disabled}
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Correo electrónico
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                {
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.surface,
                },
                !isEditing && styles.fieldDisabled,
              ]}
              value={userEmail}
              onChangeText={setUserEmail}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={COLORS.disabled}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Teléfono
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                {
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.surface,
                },
                !isEditing && styles.fieldDisabled,
              ]}
              value={userPhone}
              onChangeText={setUserPhone}
              placeholder="300 123 4567"
              placeholderTextColor={COLORS.disabled}
              keyboardType="phone-pad"
              editable={isEditing}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>
              Dirección de entrega
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                styles.fieldMultiline,
                {
                  borderColor: theme.border,
                  color: theme.textPrimary,
                  backgroundColor: theme.surface,
                },
                !isEditing && styles.fieldDisabled,
              ]}
              value={userAddress}
              onChangeText={setUserAddress}
              placeholder="Calle, número, barrio, ciudad"
              placeholderTextColor={COLORS.disabled}
              multiline
              numberOfLines={3}
              editable={isEditing}
            />
          </View>

          <View style={styles.buttonContainer}>
            {isEditing ? (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={saveProfile}
                >
                  <Text style={styles.saveButtonText}>💾 Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.cancelButton,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                  ]}
                  onPress={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                >
                  <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>✏️ Editar Perfil</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.themeRow}>
            <Text style={[styles.themeLabel, { color: theme.textPrimary }]}>
              🌙 Modo Oscuro
            </Text>
            <Switch
              value={darkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#D1D5DB', true: COLORS.primary }}
              thumbColor={'#FFFFFF'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            ❤️ Mis Favoritos ({favorites.length})
          </Text>
          {favorites.length === 0 ? (
            <Text style={[styles.emptyFavs, { color: theme.textSecondary }]}>
              Aún no has marcado platos como favoritos.
            </Text>
          ) : (
            favorites.map((fav) => (
              <View
                key={fav.id}
                style={[
                  styles.favRow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Image source={{ uri: fav.image }} style={styles.favImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.favName, { color: theme.textPrimary }]}>
                    {fav.name}
                  </Text>
                  <Text style={[styles.favPrice, { color: COLORS.primary }]}>
                    ${(fav.price || 0).toLocaleString('es-CO')}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.favRemove}
                  onPress={() => removeFavorite(fav.id)}
                >
                  <Text style={styles.favRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <TouchableOpacity style={styles.dangerButton} onPress={clearProfile}>
            <Text style={styles.dangerButtonText}>🗑️ Borrar datos del perfil</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const lightTheme = {
  background: COLORS.background,
  surface: COLORS.surface,
  textPrimary: COLORS.textPrimary,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
};

const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  formContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  fieldMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },
  fieldDisabled: {
    opacity: 0.6,
  },
  buttonContainer: {
    marginTop: 8,
    gap: 10,
  },
  actionButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: COLORS.secondary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: COLORS.primary,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  themeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  themeLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 4,
  },
  emptyFavs: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  favImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  favName: {
    fontSize: 15,
    fontWeight: '600',
  },
  favPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  favRemove: {
    backgroundColor: '#FEE2E2',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favRemoveText: {
    color: COLORS.error,
    fontWeight: '700',
  },
  dangerButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: COLORS.error,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default ProfileScreen;
