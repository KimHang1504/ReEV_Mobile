import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RootStack from './src/navigation/RootStack';
import { AuthProvider } from './src/context/AuthContext';


export default function App() {
  return (
    <SafeAreaProvider>
          <AuthProvider>
      <NavigationContainer>
        <RootStack />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
    </SafeAreaProvider>

  );
}
