import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TabNavigator } from './TabNavigator';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { MessagesScreen } from '../screens/MessagesScreen';

const Stack = createStackNavigator();

// Placeholder screens for navigation
const PlaceholderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { View, Text, TouchableOpacity, StyleSheet } = require('react-native');
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Coming Soon</Text>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{ padding: 10, backgroundColor: '#4DB8AC', borderRadius: 8 }}
      >
        <Text style={{ color: 'white' }}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );
};

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />

      {/* Placeholder screens */}
      <Stack.Screen name="Orders" component={PlaceholderScreen} />
      <Stack.Screen name="Categories" component={PlaceholderScreen} />
      <Stack.Screen name="AllProducts" component={PlaceholderScreen} />
      <Stack.Screen name="Products" component={PlaceholderScreen} />
      <Stack.Screen name="Addresses" component={PlaceholderScreen} />
      <Stack.Screen name="PaymentMethods" component={PlaceholderScreen} />
      <Stack.Screen name="Settings" component={PlaceholderScreen} />
      <Stack.Screen name="Help" component={PlaceholderScreen} />
      <Stack.Screen name="EditProfile" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};
