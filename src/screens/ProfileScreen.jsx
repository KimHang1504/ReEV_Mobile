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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/walletService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '../constants/theme';

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
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Gradient Header */}
            <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <Image
                            style={styles.avatar}
                            source={{
                                uri:
                                    user?.image ||
                                    'https://cdn-icons-png.flaticon.com/512/847/847969.png',
                            }}
                        />
                        <View style={styles.avatarBadge}>
                            <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                        </View>
                    </View>
                    <Text style={styles.name}>{user?.fullName || 'Người dùng'}</Text>
                    <Text style={styles.email}>{user?.email || 'No email'}</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.container}>

                {/* Wallet Card */}
                <View style={styles.walletCard}>
                    <LinearGradient
                        colors={[colors.success + '20', colors.success + '10']}
                        style={styles.walletCardGradient}
                    >
                        <View style={styles.walletHeader}>
                            <Ionicons name="wallet" size={28} color={colors.success} />
                            <Text style={styles.walletTitle}>Ví điện tử</Text>
                        </View>
                        <View style={styles.balanceContainer}>
                            <Text style={styles.balanceLabel}>Số dư khả dụng</Text>
                            <Text style={styles.balanceValue}>
                                {wallet?.available || wallet?.balance
                                    ? `${parseFloat(wallet.available || wallet.balance).toLocaleString('vi-VN')} ₫`
                                    : '0 ₫'}
                            </Text>
                        </View>
                        {wallet?.held && (
                            <View style={styles.heldContainer}>
                                <Text style={styles.heldLabel}>Đang giữ (escrow):</Text>
                                <Text style={styles.heldValue}>
                                    {parseFloat(wallet.held).toLocaleString('vi-VN')} ₫
                                </Text>
                            </View>
                        )}
                        <View style={styles.walletActions}>
                            <Pressable
                                style={styles.walletBtn}
                                onPress={() => navigation.navigate('Deposit')}
                            >
                                <LinearGradient
                                    colors={[colors.success, colors.success + 'DD']}
                                    style={styles.walletBtnGradient}
                                >
                                    <Ionicons name="add-circle" size={20} color="#fff" />
                                    <Text style={styles.walletBtnText}>Nạp tiền</Text>
                                </LinearGradient>
                            </Pressable>
                            <Pressable
                                style={styles.walletBtn}
                                onPress={() => navigation.navigate('Withdraw')}
                            >
                                <LinearGradient
                                    colors={[colors.error, colors.error + 'DD']}
                                    style={styles.walletBtnGradient}
                                >
                                    <Ionicons name="remove-circle" size={20} color="#fff" />
                                    <Text style={styles.walletBtnText}>Rút tiền</Text>
                                </LinearGradient>
                            </Pressable>
                        </View>
                    </LinearGradient>
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
                    <LinearGradient
                        colors={[colors.error, colors.error + 'DD']}
                        style={styles.logoutBtnGradient}
                    >
                        <Ionicons name="log-out" size={20} color="#fff" />
                        <Text style={styles.logoutText}>Đăng xuất</Text>
                    </LinearGradient>
                </Pressable>
            </ScrollView>
        </SafeAreaView>

    );
};

export default ProfileScreen;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        padding: spacing.md,
        paddingBottom: spacing.xxl,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    headerGradient: {
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
        paddingHorizontal: spacing.md,
    },
    header: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 2,
    },
    name: {
        ...typography.h2,
        color: '#fff',
        marginBottom: spacing.xs,
    },
    email: {
        ...typography.body,
        color: 'rgba(255,255,255,0.9)',
    },
    walletCard: {
        marginBottom: spacing.md,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        ...shadows.lg,
    },
    walletCardGradient: {
        padding: spacing.md,
    },
    walletHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        gap: spacing.sm,
    },
    walletTitle: {
        ...typography.h4,
        color: colors.text,
    },
    balanceContainer: {
        marginBottom: spacing.sm,
    },
    balanceLabel: {
        ...typography.caption,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    balanceValue: {
        ...typography.h2,
        color: colors.success,
    },
    heldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
        marginBottom: spacing.md,
    },
    heldLabel: {
        ...typography.caption,
        color: colors.textSecondary,
    },
    heldValue: {
        ...typography.bodyBold,
        color: colors.warning,
    },
    section: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        ...shadows.md,
    },
    sectionTitle: {
        ...typography.h4,
        color: colors.text,
        marginBottom: spacing.md,
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
    walletActions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.sm,
    },
    walletBtn: {
        flex: 1,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    walletBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.sm,
        gap: spacing.xs,
    },
    walletBtnText: {
        ...typography.captionBold,
        color: '#fff',
    },
    logoutBtn: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginTop: spacing.lg,
        ...shadows.md,
    },
    logoutBtnGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    logoutText: {
        ...typography.bodyBold,
        color: '#fff',
    },
});
