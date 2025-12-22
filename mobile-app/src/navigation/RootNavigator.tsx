import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../hooks/useAppDispatch';
import { checkAuth } from '../store/slices/authSlice';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { colors } from '../theme';

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={styles.loading}>
    <ActivityIndicator size="large" color={colors.primary} />
  </View>
);

export const RootNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Temporarily wrapped in try-catch to debug initialization issues
    const initAuth = async () => {
      try {
        await dispatch(checkAuth());
      } catch (error) {
        console.log('Auth check skipped:', error);
      }
    };
    initAuth();
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
