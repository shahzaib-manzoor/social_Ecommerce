import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CartScreen } from '../screens/CartScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';

const Stack = createStackNavigator();

// Placeholder screens
const PlaceholderScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { View, Text, TouchableOpacity } = require('react-native');
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

export const CartStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CartMain" component={CartScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Addresses" component={PlaceholderScreen} />
      <Stack.Screen name="PaymentMethods" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};
