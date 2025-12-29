import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { WriteReviewScreen } from '../screens/WriteReviewScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
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

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="WriteReview" component={WriteReviewScreen} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Messages" component={MessagesScreen} />
      <Stack.Screen name="Friends" component={FriendsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Categories" component={PlaceholderScreen} />
      <Stack.Screen name="AllProducts" component={PlaceholderScreen} />
      <Stack.Screen name="ShareProduct" component={PlaceholderScreen} />
    </Stack.Navigator>
  );
};
