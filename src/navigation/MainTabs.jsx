import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen'
import FavoriteScreen from '../screens/FavoriteScreen'
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Favorite" component={FavoriteScreen} />
      {/* Add question 5 tab below */}
      
      {/* ------------------------ */}
    </Tab.Navigator>
  );
}

export default MainTabs