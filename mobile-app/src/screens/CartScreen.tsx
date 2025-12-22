import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { fetchCart, updateCartItem, removeFromCart, clearCart } from '../store/slices/cartSlice';
import { Button } from '../components/common/Button';
import { colors, typography, spacing } from '../theme';

export const CartScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cart, isLoading } = useAppSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, []);

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      Alert.alert('Remove Item', 'Remove this item from cart?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => dispatch(removeFromCart(productId)) },
      ]);
    } else {
      dispatch(updateCartItem({ productId, quantity: newQuantity }));
    }
  };

  const handleClearCart = () => {
    Alert.alert('Clear Cart', 'Remove all items from cart?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => dispatch(clearCart()) },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <Text style={styles.emptySubtext}>Add some products to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product._id}
        renderItem={({ item }) => (
          <View style={styles.cartItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.product.title}</Text>
              <Text style={styles.itemPrice}>${item.product.price.toFixed(2)} each</Text>
            </View>
            <View style={styles.quantityControl}>
              <Button
                title="-"
                onPress={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                variant="outline"
                style={styles.quantityButton}
              />
              <Text style={styles.quantity}>{item.quantity}</Text>
              <Button
                title="+"
                onPress={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                variant="outline"
                style={styles.quantityButton}
              />
            </View>
            <Text style={styles.subtotal}>${item.subtotal.toFixed(2)}</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${cart.total.toFixed(2)}</Text>
        </View>

        <Button title="Checkout" onPress={() => Alert.alert('Checkout', 'Checkout feature coming soon!')} fullWidth />
        <Button title="Clear Cart" onPress={handleClearCart} variant="outline" fullWidth style={styles.clearButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
  },
  list: {
    padding: spacing.md,
  },
  cartItem: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    ...typography.small,
    color: colors.textSecondary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quantityButton: {
    width: 36,
    minHeight: 36,
    paddingHorizontal: 0,
  },
  quantity: {
    ...typography.bodyMedium,
    marginHorizontal: spacing.sm,
    minWidth: 30,
    textAlign: 'center',
  },
  subtotal: {
    ...typography.h4,
    color: colors.primary,
  },
  footer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.text,
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  clearButton: {
    marginTop: spacing.sm,
  },
});
