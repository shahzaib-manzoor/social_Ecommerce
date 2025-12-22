# Social E-Commerce Mobile App

React Native mobile application for the social e-commerce platform.

## ✨ Features

- **Authentication**: Register, login, JWT token management
- **Product Browsing**: Infinite scroll, search, categories
- **Semantic Search**: AI-powered product discovery
- **Shopping Cart**: Add, update, remove items
- **Social Features**: Friends, messaging, product sharing
- **Profile**: User profiles, interests, avatars
- **Green & White Theme**: Clean, modern UI

## 🏗️ Architecture

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Button, Input, Card, etc.
│   ├── products/       # ProductCard, ProductList
│   ├── cart/           # CartItem, CartSummary
│   ├── friends/        # FriendCard, FriendRequest
│   └── messages/       # MessageBubble, ConversationItem
├── screens/            # App screens
│   ├── auth/          # Login, Register
│   ├── home/          # Product feed
│   ├── search/        # Search products
│   ├── cart/          # Shopping cart
│   ├── friends/       # Friends management
│   ├── messages/      # Messaging
│   └── profile/       # User profile
├── navigation/         # React Navigation setup
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx (Drawer)
├── store/             # Redux Toolkit
│   ├── index.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── productsSlice.ts
│       ├── cartSlice.ts
│       ├── friendsSlice.ts
│       └── messagesSlice.ts
├── services/          # API and external services
│   └── api.ts
├── hooks/             # Custom React hooks
├── theme/             # Design system
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── index.ts
├── types/             # TypeScript types
└── utils/             # Helper functions
```

## 🎨 Design System

### Colors
```typescript
primary: '#2d6a4f'          // Green
background: '#ffffff'        // White
text: '#333333'             // Dark gray
textSecondary: '#666666'    // Medium gray
border: '#dddddd'           // Light gray
error: '#e63946'            // Red
```

### Typography
- **H1**: 32px, Bold
- **H2**: 28px, Bold
- **H3**: 24px, Semibold
- **H4**: 20px, Semibold
- **Body**: 16px, Regular
- **Small**: 14px, Regular
- **Caption**: 12px, Regular

### Spacing
- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **xxl**: 48px

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator
- Backend API running

### Installation
```bash
npm install
```

### Configuration
Create `.env`:
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
```

For testing on device, use your computer's IP:
```
EXPO_PUBLIC_API_URL=http://192.168.1.XXX:5000/api/v1
```

### Running
```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app

## 📱 Navigation Structure

```
RootNavigator
├── Auth (if not logged in)
│   ├── Login
│   └── Register
└── Main (if logged in) - Drawer Navigator
    ├── Home (Product Feed)
    ├── Search
    ├── Cart
    ├── Friends
    ├── Messages
    └── Profile
```

## 🔐 Authentication Flow

1. User opens app
2. Check for stored tokens (AsyncStorage)
3. If tokens exist, verify with API
4. If valid, go to Main navigator
5. If invalid, go to Auth navigator
6. After login/register, store tokens
7. Token auto-refreshes on 401 errors

## 📊 State Management

Using Redux Toolkit with slices:

### Auth Slice
```typescript
state: {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

actions:
- login(email, password)
- register(username, email, password)
- logout()
- checkAuth()
```

### Products Slice
```typescript
state: {
  products: Product[]
  isLoading: boolean
  error: string | null
}

actions:
- fetchProducts(page, limit, category)
- searchProducts(query, mode)
- likeProduct(productId)
- fetchFriendsProducts()
```

### Cart Slice
```typescript
state: {
  cart: Cart | null
  isLoading: boolean
}

actions:
- fetchCart()
- addToCart(productId, quantity)
- updateCartItem(productId, quantity)
- removeFromCart(productId)
- clearCart()
```

## 🎯 Key Screens

### Home Screen
- Product feed with infinite scroll
- Pull to refresh
- Like products
- Navigate to product details

### Search Screen
- Search input
- Semantic/keyword/hybrid modes
- Category filter
- Search results list

### Cart Screen
- Cart items list
- Quantity controls
- Total price
- Checkout button

### Friends Screen
- Friends list
- Pending requests
- Search users
- Send friend requests

### Messages Screen
- Conversations list
- Unread indicators
- Navigate to conversation

### Conversation Screen
- Message history
- Send message input
- Auto-scroll to bottom
- Mark as read

### Profile Screen
- User info display
- Edit profile
- Interests
- Logout button

## 🧩 Key Components

### Button
```typescript
<Button
  title="Add to Cart"
  onPress={handlePress}
  variant="primary"
  loading={isLoading}
  fullWidth
/>
```

### ProductCard
```typescript
<ProductCard
  product={product}
  onPress={() => navigate('ProductDetail', { id: product._id })}
  onLike={() => dispatch(likeProduct(product._id))}
  showLikeButton
/>
```

### Input
```typescript
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={errors.email}
/>
```

## 🔌 API Integration

All API calls use the `apiService`:

```typescript
import { apiService } from '../services/api';

// In Redux thunk
export const fetchProducts = createAsyncThunk(
  'products/fetch',
  async ({ page, limit }: { page: number; limit: number }) => {
    return await apiService.getProducts(page, limit);
  }
);
```

API service handles:
- ✅ Token attachment
- ✅ Auto token refresh
- ✅ Error handling
- ✅ Type safety

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📦 Building

### Development Build
```bash
expo build:android
expo build:ios
```

### Production Build (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure
eas build:configure

# Build
eas build --platform android
eas build --platform ios
```

## 🎯 Development Workflow

1. **Feature Branch**: Create branch for new feature
2. **Develop**: Implement feature with components
3. **Connect Redux**: Add slice and actions
4. **Integrate API**: Connect to backend
5. **Style**: Apply theme system
6. **Test**: Manual testing on device
7. **Review**: Code review
8. **Merge**: Merge to main

## 🐛 Debugging

### React Native Debugger
```bash
# Open debugger
open "rndebugger://set-debugger-loc?host=localhost&port=19000"
```

### Inspect Element
Shake device → "Show Element Inspector"

### Network Requests
Use React Native Debugger's Network tab

### Redux State
React Native Debugger shows Redux state

## 📝 Code Style

### Imports Order
```typescript
// 1. React
import React, { useState, useEffect } from 'react';

// 2. React Native
import { View, Text, StyleSheet } from 'react-native';

// 3. Third-party
import { useSelector, useDispatch } from 'react-redux';

// 4. Local
import { Button } from '../components/common/Button';
import { colors } from '../theme';
import { Product } from '../types';
```

### Component Structure
```typescript
interface Props {
  // Props interface
}

export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState();
  const dispatch = useDispatch();

  // Effects
  useEffect(() => {}, []);

  // Handlers
  const handlePress = () => {};

  // Render
  return (
    <View style={styles.container}>
      {/* JSX */}
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles
});
```

## 🚀 Performance Tips

1. **Use FlatList**: For long lists
2. **Memoize**: Use React.memo for components
3. **Optimize Images**: Use proper sizes
4. **Lazy Load**: Load data on demand
5. **Debounce**: Search inputs
6. **Cache**: Store frequently accessed data

## 🔒 Security

- Tokens stored in AsyncStorage (encrypted on iOS)
- No sensitive data in Redux state
- API calls over HTTPS in production
- Input validation on client and server
- XSS prevention in message rendering

## 📱 Platform Differences

### iOS
- SafeAreaView for notch
- Haptic feedback
- Native share sheet

### Android
- Hardware back button handling
- Different status bar behavior
- Material Design elements

## 🌐 Internationalization (Future)

Structure ready for i18n:
```typescript
// src/i18n/en.json
{
  "common": {
    "add_to_cart": "Add to Cart",
    "login": "Login"
  }
}
```

## 📊 Analytics (Future)

Integration points:
- Screen views
- Button clicks
- Product views
- Cart actions
- Search queries

## 🎨 Theming (Future Enhancement)

Dark mode ready:
```typescript
const darkColors = {
  primary: '#52b788',
  background: '#1a1a1a',
  text: '#ffffff',
  // ...
};
```

## 📄 License

ISC

## 🆘 Support

See [QUICK_START.md](../QUICK_START.md) for setup help
See [IMPLEMENTATION_GUIDE.md](../IMPLEMENTATION_GUIDE.md) for implementation details

---

**Happy Coding! 🎉**
