import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    ScrollView,
    Pressable,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/walletService';
import { SafeAreaView } from 'react-native-safe-area-context';

const ProfileScreen = () => {
    const { user, logout } = useAuth();
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();

    // 🔹 Lấy thông tin ví (qua service, không gọi axios trực tiếp)
    const fetchWallet = async () => {
        try {
            setLoading(true);
            const walletData = await walletService.getAvailable();
            setWallet(walletData);
        } catch (error) {
            console.error('Fetch wallet error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallet();
    }, []);

    const handleLogout = async () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Đăng xuất',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    navigation.replace('Login');
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Image
                        style={styles.avatar}
                        source={{
                            uri:
                                user?.image ||
                                'https://cdn-icons-png.flaticon.com/512/847/847969.png',
                        }}
                    />
                    <Text style={styles.name}>{user?.fullName || 'Người dùng'}</Text>
                    <Text style={styles.email}>{user?.email || 'No email'}</Text>
                </View>

                {/* Wallet */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>💰 Ví điện tử</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Số dư khả dụng:</Text>
                        <Text style={styles.value}>
                            {wallet?.balance
                                ? `${parseFloat(wallet.balance).toLocaleString()} ₫`
                                : '0 ₫'}
                        </Text>
                    </View>
                </View>

                {/* Contact */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📱 Thông tin liên hệ</Text>
                    <View style={styles.row}>
                        <Ionicons name="call-outline" size={20} color="#007AFF" />
                        <Text style={styles.rowText}>
                            {user?.phone || 'Không có số điện thoại'}
                        </Text>
                    </View>
                    <View style={styles.row}>
                        <Ionicons name="mail-outline" size={20} color="#007AFF" />
                        <Text style={styles.rowText}>{user?.email || 'Không có email'}</Text>
                    </View>
                </View>

                {/* Address */}
                {user?.addresses && user.addresses.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>📍 Địa chỉ mặc định</Text>
                        {user.addresses
                            .filter((a) => a.isDefault)
                            .map((addr) => (
                                <View key={addr.addressId} style={styles.addressBox}>
                                    <Text style={styles.label}>{addr.fullName}</Text>
                                    <Text style={styles.value}>{addr.phone}</Text>
                                    <Text style={styles.value}>{addr.line1}</Text>
                                </View>
                            ))}
                    </View>
                )}

                {/* Role */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>⚙️ Tài khoản</Text>
                    <Text style={styles.rowText}>Vai trò: {user?.role || 'member'}</Text>
                    <Text style={styles.rowText}>
                        Trạng thái: {user?.isActive ? 'Hoạt động ✅' : 'Vô hiệu ❌'}
                    </Text>
                </View>

                {/* Logout */}
                <Pressable style={styles.logoutBtn} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#fff" />
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>

    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#F8F9FB',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: '#E0F2FF',
        paddingVertical: 24,
        borderRadius: 16,
    },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        marginBottom: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: '700',
        color: '#222',
    },
    email: {
        color: '#555',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 4,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 10,
        color: '#333',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        color: '#555',
    },
    value: {
        fontWeight: '600',
        color: '#222',
    },
    rowText: {
        fontSize: 15,
        color: '#333',
        marginLeft: 8,
    },
    addressBox: {
        backgroundColor: '#F4F6F8',
        borderRadius: 8,
        padding: 10,
        marginTop: 4,
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E53935',
        paddingVertical: 14,
        borderRadius: 10,
        marginTop: 20,
    },
    logoutText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
});
