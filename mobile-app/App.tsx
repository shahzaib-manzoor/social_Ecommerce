import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { store } from './src/store';
import { RootNavigator } from './src/navigation/RootNavigator';

// Polyfill to prevent screen capture errors on Android
if (Platform.OS === 'android') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const msg = args.join(' ');
    if (msg.includes('DETECT_SCREEN_CAPTURE') || msg.includes('registerScreenCaptureObserver')) {
      return;
    }
    originalWarn(...args);
  };
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong!</Text>
          <Text style={styles.errorDetails}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <Provider store={store}>
          <SafeAreaProvider>
            <StatusBar style="light" />
            <RootNavigator />
          </SafeAreaProvider>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e63946',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
