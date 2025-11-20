import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from './MainTabs';
import DetailScreen from '../screens/DetailScreen';
import PaymentScreen from '../screens/PaymentScreen'; // 💳 Thêm dòng này
import LoginScreen from '../screens/LoginScreen';
import VerifyOtpScreen from '../screens/VerifyOtpScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import AuctionListScreen from '../screens/AuctionListScreen';
import AuctionRoomScreen from '../screens/AuctionRoomScreen';
import DepositScreen from '../screens/DepositScreen';
import WithdrawScreen from '../screens/WithdrawScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AddressManagementScreen from '../screens/AddressManagementScreen';
import AddressFormScreen from '../screens/AddressFormScreen';

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

      {/* 🏛️ Auction screens */}
      <Stack.Screen
        name="AuctionList"
        component={AuctionListScreen}
        options={{ title: 'Đấu giá' }}
      />
      <Stack.Screen
        name="AuctionRoom"
        component={AuctionRoomScreen}
        options={{ title: 'Phòng đấu giá' }}
      />

      {/* 💰 Wallet screens */}
      <Stack.Screen
        name="Deposit"
        component={DepositScreen}
        options={{ title: 'Nạp tiền' }}
      />
      <Stack.Screen
        name="Withdraw"
        component={WithdrawScreen}
        options={{ title: 'Rút tiền' }}
      />

      {/* 🛒 Cart & Checkout */}
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: 'Giỏ hàng' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ title: 'Thanh toán' }}
      />

      {/* 📍 Address Management */}
      <Stack.Screen
        name="AddressManagement"
        component={AddressManagementScreen}
        options={{ title: 'Địa chỉ của tôi' }}
      />
      <Stack.Screen
        name="AddressForm"
        component={AddressFormScreen}
        options={{ title: 'Thêm địa chỉ' }}
      />

    </Stack.Navigator>
  );
}

export default RootStack;
