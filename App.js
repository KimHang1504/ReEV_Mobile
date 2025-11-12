import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Linking } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStack from './src/navigation/RootStack';
import { AuthProvider } from './src/context/AuthContext';
import { useEffect, useRef } from 'react';

export default function App() {
  const navigationRef = useRef(null);

  // Deep linking configuration
  const linking = {
    prefixes: ['reev://', 'https://reev.app', 'exp://'],
    config: {
      screens: {
        PaymentSuccess: {
          path: 'payment-success',
          parse: {
            orderId: (orderId) => orderId,
            amount: (amount) => amount,
            transactionId: (transactionId) => transactionId,
          },
        },
        Payment: 'payment',
        // Add other screens as needed
      },
    },
  };

  useEffect(() => {
    // Handle initial URL when app is opened via deep link
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        console.log('📱 Initial URL:', url);
        handleDeepLink(url);
      }
    };

    // Handle URL when app is already open
    const handleURLChange = ({ url }) => {
      console.log('📱 URL changed:', url);
      handleDeepLink(url);
    };

    const subscription = Linking.addEventListener('url', handleURLChange);
    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url) => {
    if (!url || !navigationRef.current) return;

    // Parse URL to extract payment success info
    // Example: reev://payment-success?orderId=xxx&amount=xxx&transactionId=xxx
    const match = url.match(/payment-success\?(.*)/);
    if (match) {
      const params = new URLSearchParams(match[1]);
      const orderId = params.get('orderId');
      const amount = params.get('amount');
      const transactionId = params.get('transactionId');
      const status = params.get('status');

      if (status === 'paid' || status === 'success') {
        navigationRef.current?.navigate('PaymentSuccess', {
          order: { orderId, grandTotal: amount },
          transactionId,
        });
      }
    }
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer ref={navigationRef} linking={linking}>
          <RootStack />
          <StatusBar style="auto" />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
