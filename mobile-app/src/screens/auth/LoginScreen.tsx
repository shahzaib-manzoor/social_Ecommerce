import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppDispatch';
import { login, clearError } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors, typography, spacing } from '../../theme';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });

  const validate = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
              placeholder="••••••••"
            />

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />

            <Button
              title="Create Account"
              onPress={() => navigation.navigate('Register')}
              variant="outline"
              fullWidth
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  form: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.md,
  },
});
