import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { FriendsProductsScreen } from '../screens/FriendsProductsScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { CartScreen } from '../screens/CartScreen';
import { colors } from '../theme';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.darkGray,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.lightGray,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Product Feed',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="FriendsProducts"
        component={FriendsProductsScreen}
        options={{
          title: 'Friends Products',
          tabBarLabel: 'Friends',
          tabBarIcon: ({ color }) => <TabIcon icon="👥" color={color} />,
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          title: 'Friends',
          tabBarLabel: 'Social',
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          title: 'Messages',
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color }) => <TabIcon icon="💬" color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Shopping Cart',
          tabBarLabel: 'Cart',
          tabBarIcon: ({ color }) => <TabIcon icon="🛒" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Simple emoji icon component
const TabIcon: React.FC<{ icon: string; color: string }> = ({ icon }) => {
  return <Text style={{ fontSize: 24 }}>{icon}</Text>;
};
