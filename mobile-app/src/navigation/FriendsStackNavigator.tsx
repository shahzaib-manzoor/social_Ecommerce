import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { FriendsScreen } from '../screens/FriendsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';

const Stack = createStackNavigator();

export const FriendsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FriendsMain" component={FriendsScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
};
