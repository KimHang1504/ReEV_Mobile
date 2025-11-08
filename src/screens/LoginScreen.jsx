import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    StyleSheet,
    Alert,
    Platform,
} from 'react-native';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const auth = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
            return;
        }

        try {
            setLoading(true);
            const deviceInfo = `${Platform.OS} ${Platform.Version}`;

            // 1️⃣ Gọi API login
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

            // 2️⃣ Gọi API /users/me để lấy thông tin user
            const profileRes = await authService.getProfile(token);
            const user = profileRes?.data?.data || profileRes?.data || null;

            if (!user) {
                Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng');
                return;
            }

            // 3️⃣ Lưu token + user vào AsyncStorage qua AuthContext
            // user.user chứa thông tin thật (có userId, email, ...)
            const actualUser = user?.user || user;
            auth.login(token, actualUser);
            console.log('✅ Login success, saved user:', actualUser);
            console.log('✅ Login success, user:', user);

            // 4️⃣ Chuyển sang trang chính
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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <View style={styles.container}>
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
                    placeholder="Mật khẩu"
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
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#007AFF',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default LoginScreen;
