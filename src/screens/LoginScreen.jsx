import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi đăng nhập', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const deviceInfo = `${Platform.OS} ${Platform.Version}`;
      const res = await authService.login(email, password, deviceInfo);
      const body = res?.data?.data || res?.data;
      if (!body) {
        Alert.alert('Lỗi', 'Không nhận được phản hồi hợp lệ từ máy chủ');
        return;
      }
      const token =
        body?.accessToken ||
        body?.token ||
        body?.data?.accessToken ||
        body?.data?.token;
      if (!token) {
        Alert.alert('Lỗi', 'Không tìm thấy access token');
        return;
      }
      const profileRes = await authService.getProfile(token);
      const user = profileRes?.data?.data || profileRes?.data || null;
      if (!user) {
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
        return;
      }
      const actualUser = user?.user || user;
      auth.login(token, actualUser);
      navigation.replace('MainTabs');
    } catch (error) {
      console.error('❌ Login error', error);
      const msg =
        error?.data?.message ||
        error?.message ||
        'Đăng nhập thất bại, vui lòng thử lại.';
      Alert.alert('Lỗi', typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FDF6EC' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <View style={styles.topBackground} />

          <View style={styles.card}>
            <Text style={styles.title}>Sign in</Text>

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Đang đăng nhập...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert('Tính năng đang phát triển')}>
              <Text style={styles.forgotText}>Forgot your password?</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bottomContainer}>
            <Text style={{ color: '#444' }}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signUpText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topBackground: {
    backgroundColor: '#4C6EF5',
    height: '35%',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    marginTop: -100,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#4C6EF5',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  forgotText: {
    color: '#4C6EF5',
    textAlign: 'center',
    marginTop: 15,
    fontSize: 15,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  signUpText: {
    color: '#4C6EF5',
    fontWeight: '600',
  },
});

export default LoginScreen;
