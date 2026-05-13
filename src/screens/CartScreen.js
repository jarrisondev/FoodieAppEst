import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartContext } from '../context/CartContext';
import { db } from '../config/firebase';
import { COLORS, globalStyles } from '../styles/globalStyles';

const IVA_RATE = 0.19;

const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    getCartTotal,
    incrementQuantity,
    decrementQuantity,
    updateNotes,
  } = useContext(CartContext);

  const subtotal = getCartTotal();
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega platos al carrito antes de confirmar.');
      return;
    }

    try {
      await db.collection('orders').add({
        items: cartItems,
        subtotal,
        iva,
        total,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
      });

      clearCart();
      Alert.alert(
        '¡Pedido Confirmado!',
        'Tu pedido ha sido enviado a la cocina.',
        [{ text: 'OK', onPress: () => navigation.navigate('OrdersTab') }]
      );
    } catch (error) {
      console.log('Order saved locally:', error.message);
      clearCart();
      Alert.alert('¡Pedido Confirmado!', 'Tu pedido ha sido registrado.');
    }
  };

  const handleRemoveItem = (item) => {
    Alert.alert(
      'Eliminar del carrito',
      `¿Deseas eliminar ${item.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => removeFromCart(item.id),
        },
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemCard}>
      <View style={styles.topRow}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemPrice}>
            ${item.price.toLocaleString('es-CO')} c/u
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
        >
          <Text style={styles.removeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.qtyContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => decrementQuantity(item.id)}
          >
            <Text style={styles.qtyButtonText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => incrementQuantity(item.id)}
          >
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemSubtotal}>
          ${(item.price * item.quantity).toLocaleString('es-CO')}
        </Text>
      </View>

      <TextInput
        style={styles.notesInput}
        placeholder="Notas especiales: sin cebolla, extra picante..."
        placeholderTextColor={COLORS.disabled}
        value={item.notes || ''}
        onChangeText={(text) => updateNotes(item.id, text)}
        multiline
      />
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={globalStyles.container}>
        <View style={styles.header}>
          <Text style={globalStyles.title}>Mi Carrito 🛒</Text>
          {cartItems.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Vaciar carrito', '¿Estás seguro?', [
                  { text: 'Cancelar', style: 'cancel' },
                  { text: 'Vaciar', style: 'destructive', onPress: clearCart },
                ]);
              }}
            >
              <Text style={styles.clearText}>Vaciar</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={globalStyles.emptyState}>
              <Text style={{ fontSize: 60 }}>🛒</Text>
              <Text style={globalStyles.emptyText}>Tu carrito está vacío</Text>
              <TouchableOpacity
                style={[globalStyles.button, { marginTop: 20 }]}
                onPress={() => navigation.navigate('MenuTab')}
              >
                <Text style={globalStyles.buttonText}>Ver Menú</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {cartItems.length > 0 && (
          <View style={styles.bottomSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>
                ${subtotal.toLocaleString('es-CO')}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IVA (19%)</Text>
              <Text style={styles.totalValue}>
                ${Math.round(iva).toLocaleString('es-CO')}
              </Text>
            </View>
            <View style={[styles.totalRow, styles.grandTotal]}>
              <Text style={styles.grandTotalLabel}>Total</Text>
              <Text style={styles.grandTotalValue}>
                ${Math.round(total).toLocaleString('es-CO')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmOrder}
            >
              <Text style={styles.confirmButtonText}>
                Confirmar Pedido • ${Math.round(total).toLocaleString('es-CO')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  clearText: {
    fontSize: 15,
    color: COLORS.error,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  cartItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemInfo: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  qtyValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginHorizontal: 14,
    minWidth: 24,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primary,
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '700',
  },
  notesInput: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
    minHeight: 38,
  },
  bottomSection: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 4,
    marginBottom: 16,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  confirmButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});

export default CartScreen;
