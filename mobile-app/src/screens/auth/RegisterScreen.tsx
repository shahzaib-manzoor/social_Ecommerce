import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { register } from '../../store/slices/authSlice';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { colors, typography, spacing } from '../../theme';

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useAppDispatch();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ username: '', email: '', password: '', confirmPassword: '' });

  const validate = () => {
    const newErrors = { username: '', email: '', password: '', confirmPassword: '' };
    let isValid = true;

    if (!username) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
      isValid = false;
    }

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
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await dispatch(register({ username, email, password })).unwrap();
    } catch (err: any) {
      Alert.alert('Registration Failed', err.message || 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join our community</Text>

          <View style={styles.form}>
            <Input
              label="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              error={errors.username}
              placeholder="johndoe"
            />

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

            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
              placeholder="••••••••"
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.button}
            />

            <Button
              title="Back to Sign In"
              onPress={() => navigation.goBack()}
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
