import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CartContext } from '../context/CartContext';
import { COLORS, globalStyles } from '../styles/globalStyles';

const FAVORITES_KEY = '@foodie_favorites';

const DishDetailScreen = ({ route, navigation }) => {
  const { addToCart } = useContext(CartContext);
  const {
    dishId,
    dishName,
    dishPrice,
    dishDescription,
    dishImage,
    dishRating,
    dishCategory,
  } = route.params || {};

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        const favorites = stored ? JSON.parse(stored) : [];
        setIsFavorite(favorites.some((fav) => fav.id === dishId));
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    })();
  }, [dishId]);

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      const favorites = stored ? JSON.parse(stored) : [];
      const exists = favorites.some((fav) => fav.id === dishId);
      const updated = exists
        ? favorites.filter((fav) => fav.id !== dishId)
        : [
            ...favorites,
            {
              id: dishId,
              name: dishName,
              price: dishPrice,
              image: dishImage,
              category: dishCategory,
            },
          ];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      setIsFavorite(!exists);
    } catch (error) {
      console.error('Error saving favorite:', error);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: dishId,
      name: dishName,
      price: dishPrice,
      image: dishImage,
    });
    Alert.alert('¡Agregado!', `${dishName} se agregó al carrito`, [
      { text: 'Seguir viendo', style: 'cancel' },
      { text: 'Ver carrito', onPress: () => navigation.navigate('CartTab') },
    ]);
  };

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['bottom']}>
      <ScrollView style={globalStyles.container}>
        <Image
          source={{ uri: dishImage || 'https://via.placeholder.com/400x250' }}
          style={styles.heroImage}
          resizeMode="cover"
        />
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.dishName}>{dishName || 'Plato no encontrado'}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingText}>{dishRating || '0.0'}</Text>
            </View>
          </View>

          <View style={styles.subHeaderRow}>
            <Text style={styles.category}>{dishCategory || 'Sin categoría'}</Text>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <Text
                style={[
                  styles.favoriteIcon,
                  isFavorite && styles.favoriteIconActive,
                ]}
              >
                {isFavorite ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.price}>
            ${(dishPrice || 0).toLocaleString('es-CO')}
          </Text>

          <View style={globalStyles.divider} />

          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.description}>
            {dishDescription || 'Sin descripción disponible.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addToCartButton}
          onPress={handleAddToCart}
        >
          <Text style={styles.addToCartText}>🛒 Agregar al Carrito</Text>
          <Text style={styles.addToCartPrice}>
            ${(dishPrice || 0).toLocaleString('es-CO')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  heroImage: {
    width: '100%',
    height: 250,
    backgroundColor: COLORS.border,
  },
  contentContainer: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  dishName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingStar: {
    fontSize: 16,
    color: COLORS.star,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  category: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  favoriteButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  favoriteIcon: {
    fontSize: 28,
    color: COLORS.textSecondary,
  },
  favoriteIconActive: {
    color: COLORS.error,
  },
  price: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  bottomBar: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  addToCartPrice: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default DishDetailScreen;
