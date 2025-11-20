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

  const parseUrlParams = (url) => {
    const params = {};
    if (!url) return params;
    const queryString = url.split('?')[1];
    if (!queryString) return params;
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        params[decodeURIComponent(key)] = decodeURIComponent(value);
      }
    });
    return params;
  };

  const handleDeepLink = (url) => {
    if (!url || !navigationRef.current) return;

    // Parse URL to extract payment success info
    // Example: reev://payment-success?orderId=xxx&amount=xxx&transactionId=xxx&code=00&status=success
    // hoặc: https://chargex.id.vn/payment-success?code=00&status=success&tx=xxx
    const match = url.match(/payment-success\?(.*)/);
    if (match) {
      const params = parseUrlParams(match[1]);
      const orderId = params.orderId;
      const amount = params.amount;
      const transactionId = params.transactionId || params.tx;
      const status = params.status;
      const code = params.code;

      // Check code=00 for success
      const isSuccess = code === '00' || status === 'paid' || status === 'success';

      if (isSuccess) {
        navigationRef.current?.navigate('PaymentSuccess', {
          order: { orderId, grandTotal: amount },
          transactionId,
          code,
          status,
        });
      } else {
        // Handle error case
        console.error('Payment failed:', { code, status });
        // Could navigate to error screen if needed
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
