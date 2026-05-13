import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { CartContext } from '../context/CartContext';
import { db } from '../config/firebase';
import { LOCAL_MENU, CATEGORIES } from '../utils/seedData';
import { COLORS, globalStyles } from '../styles/globalStyles';

const MenuScreen = ({ navigation }) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [search, setSearch] = useState('');
  const { cartCount } = useContext(CartContext);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const snapshot = await db.collection('menu').get();
      if (!snapshot.empty) {
        const menuData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDishes(menuData);
      } else {
        setDishes(LOCAL_MENU);
      }
    } catch (error) {
      console.log('Using local menu data:', error.message);
      setDishes(LOCAL_MENU);
    } finally {
      setLoading(false);
    }
  };

  const filteredDishes = dishes
    .filter((dish) =>
      selectedCategory === 'Todas' ? true : dish.category === selectedCategory
    )
    .filter((dish) =>
      dish.name.toLowerCase().includes(search.trim().toLowerCase())
    );

  const renderDishItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dishCard}
      onPress={() =>
        navigation.navigate('DishDetail', {
          dishId: item.id,
          dishName: item.name,
          dishPrice: item.price,
          dishDescription: item.description,
          dishImage: item.image,
          dishRating: item.rating,
          dishCategory: item.category,
        })
      }
    >
      <Image
        source={{ uri: item.image }}
        style={styles.dishImage}
        resizeMode="cover"
      />
      <View style={styles.dishInfo}>
        <Text style={styles.dishName}>{item.name}</Text>
        <Text style={styles.dishCategory}>{item.category}</Text>
        <View style={styles.dishFooter}>
          <Text style={styles.dishPrice}>
            ${item.price.toLocaleString('es-CO')}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>★</Text>
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[globalStyles.container, globalStyles.emptyState]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={globalStyles.emptyText}>Cargando menú...</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <Text style={globalStyles.title}>FoodieApp 🍽️</Text>
        <Text style={globalStyles.bodyText}>
          {filteredDishes.length} platos disponibles
        </Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar platos..."
          placeholderTextColor={COLORS.disabled}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity
            style={styles.searchClear}
            onPress={() => setSearch('')}
          >
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesRow}
      >
        {CATEGORIES.map((cat) => {
          const active = cat === selectedCategory;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <FlatList
        data={filteredDishes}
        renderItem={renderDishItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={globalStyles.emptyState}>
            <Text style={globalStyles.emptyText}>
              No se encontraron platos
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  searchClear: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchClearText: {
    color: COLORS.error,
    fontWeight: '700',
  },
  categoriesRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  dishCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  dishImage: {
    width: '100%',
    height: 160,
    backgroundColor: COLORS.border,
  },
  dishInfo: {
    padding: 14,
  },
  dishName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dishCategory: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  dishFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dishPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    fontSize: 16,
    color: COLORS.star,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
});

export default MenuScreen;
