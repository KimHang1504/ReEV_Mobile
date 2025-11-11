import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // hoặc AntDesign, MaterialIcons tuỳ bạn
import HomeScreen from '../screens/HomeScreen';
import FavoriteScreen from '../screens/FavoriteScreen';
import CustomerScreen from '../screens/Customer';
import ProfileScreen from '../screens/ProfileScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import AuctionListScreen from '../screens/AuctionListScreen';
import { SafeAreaView } from 'react-native-safe-area-context';  

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 0.3,
          borderTopColor: '#ccc',
          paddingBottom: 15,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',

        // 🎨 Icon theo từng tab
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Auction':
              iconName = focused ? 'hammer' : 'hammer-outline';
              break;
            case 'Favorite':
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case 'Customer':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Trang chủ' }}
      />
      <Tab.Screen
        name="Auction"
        component={AuctionListScreen}
        options={{ title: 'Đấu giá' }}
      />
      <Tab.Screen
        name="Favorite"
        component={FavoriteScreen}
        options={{ title: 'Yêu thích' }}
      />
      <Tab.Screen
        name="Customer"
        component={CustomerScreen}
        options={{ title: 'Khách hàng' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Hồ sơ' }}
      />
      <Tab.Screen
      name="Orders"
      component={OrderHistoryScreen}
      options={{ title: 'Đơn hàng' }} />
    </Tab.Navigator>
  );
}

export default MainTabs;
