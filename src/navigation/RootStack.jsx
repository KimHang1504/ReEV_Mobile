import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import DetailScreen from '../screens/DetailScreen';
import PaymentScreen from '../screens/PaymentScreen'; // 💳 Thêm dòng này
import LoginScreen from '../screens/LoginScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator initialRouteName="Login">
      {/* 🔐 Đăng nhập */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* 🔢 OTP */}
      <Stack.Screen
        name="VerifyOtp"
        component={VerifyOtpScreen}
        options={{ headerShown: false }}
      />

      {/* 🏠 Tabs chính */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* 🔍 Chi tiết sản phẩm */}
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{ title: 'Chi tiết sản phẩm' }}
      />

      {/* 💳 Thanh toán */}
      <Stack.Screen
        name="PaymentScreen"
        component={PaymentScreen}
        options={{ title: 'Thanh toán' }}
      />
      <Stack.Screen
       name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{ headerShown: false }} />
      <Stack.Screen
       name="OrderDetail"
       component={OrderDetailScreen}
       options={{ title: 'Chi tiết đơn hàng' }} />

    </Stack.Navigator>
  );
}

export default RootStack;
