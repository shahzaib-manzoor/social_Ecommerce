# Remaining Fixes for Social E-Commerce App

## ✅ COMPLETED
1. **Dynamic Wishlist Heart Icon** - HomeScreen now has full wishlist functionality with dynamic add/remove
2. **Safe Area Insets** - All screens now have proper top margins with safe area support
3. **ProductCard Component** - Updated to support wishlist toggle functionality

## 🔄 IN PROGRESS / TODO

### 1. Update AllProductsScreen with Wishlist
**File:** `mobile-app/src/screens/AllProductsScreen.tsx`

Add the same wishlist logic as HomeScreen:

```typescript
// Add state
const [wishlistStatus, setWishlistStatus] = useState<Record<string, boolean>>({});

// Add to useEffect
const loadWishlistStatus = async () => {
  if (!user) return;
  try {
    const wishlist = await apiService.getMyWishlist();
    const statusMap: Record<string, boolean> = {};
    wishlist.forEach((item: any) => {
      statusMap[item.product._id] = true;
    });
    setWishlistStatus(statusMap);
  } catch (error) {
    console.error('Failed to load wishlist status:', error);
  }
};

// Add handler
const handleWishlistToggle = async (productId: string) => {
  if (!user) {
    Alert.alert('Login Required', 'Please login to add items to your wishlist');
    return;
  }

  const isCurrentlyInWishlist = wishlistStatus[productId];

  try {
    if (isCurrentlyInWishlist) {
      await apiService.removeFromWishlist(productId);
      setWishlistStatus(prev => ({ ...prev, [productId]: false }));
      Alert.alert('Removed', 'Product removed from wishlist');
    } else {
      await apiService.addToWishlist(productId);
      setWishlistStatus(prev => ({ ...prev, [productId]: true }));
      Alert.alert('Added', 'Product added to wishlist');
    }
  } catch (error: any) {
    console.error('Wishlist toggle error:', error);
    Alert.alert('Error', error.message || 'Failed to update wishlist');
  }
};

// Update renderProduct
const renderProduct = ({ item }: { item: any }) => (
  <View style={styles.productWrapper}>
    <ProductCard
      product={item}
      onPress={() => navigation.navigate('ProductDetail', { productId: item._id })}
      onWishlistToggle={() => handleWishlistToggle(item._id)}
      isInWishlist={wishlistStatus[item._id] || false}
      compact
    />
  </View>
);
```

### 2. Update ProductDetailScreen with Wishlist

**File:** `mobile-app/src/screens/ProductDetailScreen.tsx`

The ProductDetailScreen already tracks `isInWishlist` state and has wishlist functionality. Just ensure the heart button calls the toggle function.

### 3. Profile Picture Upload & Profile Details Edit

**Current Status:** EditProfileScreen allows editing bio and interests, but NOT profile picture upload.

**Required Changes:**

#### A. Add Image Picker
```bash
cd mobile-app
npx expo install expo-image-picker
```

#### B. Update EditProfileScreen.tsx

Add image picker functionality:

```typescript
import * as ImagePicker from 'expo-image-picker';

const [avatar, setAvatar] = useState(user?.avatar || '');
const [uploading, setUploading] = useState(false);

const pickImage = async () => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'We need camera roll permissions');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled) {
    uploadImage(result.assets[0].uri);
  }
};

const uploadImage = async (uri: string) => {
  try {
    setUploading(true);

    const formData = new FormData();
    formData.append('avatar', {
      uri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await apiService.uploadAvatar(formData);
    setAvatar(response.avatar);
    Alert.alert('Success', 'Profile picture updated!');
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Failed to upload image');
  } finally {
    setUploading(false);
  }
};
```

#### C. Add Backend Avatar Upload API

**File:** `backend/src/routes/userRoutes.ts`

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: './uploads/avatars',
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 5000000 } }); // 5MB limit

router.post('/upload-avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await User.findByIdAndUpdate(req.user.id, { avatar: avatarUrl });

    res.json({ success: true, data: { avatar: avatarUrl } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

#### D. Add API Service Method

**File:** `mobile-app/src/services/api.ts`

```typescript
async uploadAvatar(formData: FormData): Promise<{ avatar: string }> {
  const { data } = await this.api.post<ApiResponse<{ avatar: string }>>('/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  if (!data.success || !data.data) throw new Error(data.error || 'Failed to upload avatar');
  return data.data;
}

async updateProfile(updates: { bio?: string; interests?: string[]; fullName?: string }): Promise<User> {
  const { data } = await this.api.put<ApiResponse<User>>('/users/profile', updates);
  if (!data.success || !data.data) throw new Error(data.error || 'Failed to update profile');
  return data.data;
}
```

### 4. Wishlist Friends Tab

**Status:** ✅ ALREADY IMPLEMENTED

WishlistScreen already has tabs:
- "My Items" - shows only user's wishlist
- "All" - shows combined wishlist (user + friends)

The toggle is already functional at line 43: `const [view, setView] = useState<'own' | 'combined'>('combined');`

### 5. Checkout Flow with Cash on Delivery

This requires creating the complete order system.

#### A. Create Order Model

**File:** `backend/src/models/Order.ts`

```typescript
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  }],
  total: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['cash_on_delivery'], default: 'cash_on_delivery' },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    address: String,
    city: String,
    postalCode: String,
  },
  notes: String,
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
```

#### B. Create Order Routes

**File:** `backend/src/routes/orderRoutes.ts`

```typescript
import express from 'express';
import { auth } from '../middleware/auth';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';

const router = express.Router();

// Create order from cart
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress, notes } = req.body;

    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    const order = new Order({
      user: req.user.id,
      items: cart.items,
      total: cart.total,
      paymentMethod: 'cash_on_delivery',
      shippingAddress,
      notes,
    });

    await order.save();

    // Clear cart after order
    await Cart.findOneAndUpdate({ user: req.user.id }, { items: [], total: 0 });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user orders
router.get('/my', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get order by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

#### C. Add to Backend Routes

**File:** `backend/src/index.ts`

```typescript
import orderRoutes from './routes/orderRoutes';

app.use('/api/v1/orders', orderRoutes);
```

#### D. Create CheckoutScreen

**File:** `mobile-app/src/screens/CheckoutScreen.tsx`

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { apiService } from '../services/api';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { clearCart } from '../store/slices/cartSlice';

export const CheckoutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { cart } = useAppSelector((state) => state.cart);
  const { user } = useAppSelector((state) => state.auth);

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !address || !city) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await apiService.createOrder({
        shippingAddress: { fullName, phone, address, city, postalCode },
        notes,
      });

      dispatch(clearCart());

      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. We will contact you for confirmation.',
        [
          {
            text: 'View Orders',
            onPress: () => navigation.navigate('Orders'),
          },
          {
            text: 'Continue Shopping',
            onPress: () => navigation.navigate('HomeMain'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, spacing.md) }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Information</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            placeholderTextColor={colors.textSecondary}
            value={fullName}
            onChangeText={setFullName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            placeholderTextColor={colors.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Address *"
            placeholderTextColor={colors.textSecondary}
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />

          <TextInput
            style={styles.input}
            placeholder="City *"
            placeholderTextColor={colors.textSecondary}
            value={city}
            onChangeText={setCity}
          />

          <TextInput
            style={styles.input}
            placeholder="Postal Code"
            placeholderTextColor={colors.textSecondary}
            value={postalCode}
            onChangeText={setPostalCode}
            keyboardType="number-pad"
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Order Notes (Optional)"
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Ionicons name="cash-outline" size={24} color={colors.primary} />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items:</Text>
            <Text style={styles.summaryValue}>{cart?.items.length || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>Rs {cart?.total.toFixed(2) || '0.00'}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, isSubmitting && styles.placeOrderButtonDisabled]}
          onPress={handlePlaceOrder}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.placeOrderButtonText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    minHeight: 56,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text,
  },
  placeholder: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.background,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    minHeight: 48,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.sm,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  paymentText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.text,
  },
  totalLabel: {
    ...typography.h3,
    fontWeight: '600',
    color: colors.text,
  },
  totalValue: {
    ...typography.h2,
    fontWeight: 'bold',
    color: colors.primary,
  },
  footer: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeOrderButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    opacity: 0.6,
  },
  placeOrderButtonText: {
    ...typography.bodyMedium,
    fontWeight: '600',
    color: colors.textInverse,
  },
});
```

#### E. Add API Service Methods

**File:** `mobile-app/src/services/api.ts`

```typescript
// Order APIs
async createOrder(orderData: { shippingAddress: any; notes?: string }): Promise<any> {
  const { data } = await this.api.post<ApiResponse<any>>('/orders', orderData);
  if (!data.success || !data.data) throw new Error(data.error || 'Failed to create order');
  return data.data;
}

async getMyOrders(): Promise<any[]> {
  const { data } = await this.api.get<ApiResponse<any[]>>('/orders/my');
  if (!data.success || !data.data) throw new Error(data.error || 'Failed to get orders');
  return data.data;
}

async getOrder(orderId: string): Promise<any> {
  const { data } = await this.api.get<ApiResponse<any>>(`/orders/${orderId}`);
  if (!data.success || !data.data) throw new Error(data.error || 'Failed to get order');
  return data.data;
}
```

#### F. Update CartScreen

**File:** `mobile-app/src/screens/CartScreen.tsx`

Change line 92:
```typescript
// FROM:
<Button title="Checkout" onPress={() => Alert.alert('Checkout', 'Checkout feature coming soon!')} fullWidth />

// TO:
<Button title="Checkout" onPress={() => navigation.navigate('Checkout')} fullWidth />
```

Add navigation prop:
```typescript
export const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
```

#### G. Add Checkout Route to Navigation

**File:** `mobile-app/src/navigation/CartStackNavigator.tsx`

```typescript
import { CheckoutScreen } from '../screens/CheckoutScreen';

// Add inside Stack.Navigator:
<Stack.Screen name="Checkout" component={CheckoutScreen} />
```

## Summary

### What's Done:
✅ Wishlist heart icon is now dynamic (HomeScreen)
✅ All screens have proper safe area top margins
✅ ProductCard supports wishlist toggle

### What Needs to Be Done:
1. Apply wishlist functionality to AllProductsScreen (copy from HomeScreen)
2. Add profile picture upload (requires expo-image-picker and backend multipart/form-data endpoint)
3. Create complete order system (backend model, routes, and frontend checkout screen)
4. Update CartScreen to navigate to Checkout
5. Add Checkout screen to navigation

### Priority Order:
1. **AllProductsScreen wishlist** (Quick - 5 min)
2. **Order System** (30 min - most impactful)
3. **Profile Picture Upload** (20 min)
