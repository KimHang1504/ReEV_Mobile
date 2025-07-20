import { View, Text, Image, Pressable, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigation } from '@react-navigation/native'
import { MaterialIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'

const DetailScreen = ({ route }) => {
  const navigation = useNavigation()
  const { itemId } = route.params

  // Define state
  const [item, setItem] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false);
  // Define functions
  const fetchItem = async () => {
    try {
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}/${itemId}`)
      setItem(res.data)
    } catch (error) {
      console.log(error)
    }
  }
  const handleToggleFavorite = async () => {
    try {
      const storage = await AsyncStorage.getItem("favorites");
      let favs = storage ? JSON.parse(storage) : [];
      let updatedFavs;
      if (isFavorite) {
        updatedFavs = favs.filter(fav => fav.id !== itemId);
      } else {
        updatedFavs = [...favs, item];
      }
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavs));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log(error)
    }
  };
  const checkFavoriteStatus = async () => {
    try {
      const storage = await AsyncStorage.getItem("favorites");
      if (storage) {
        const favs = JSON.parse(storage);
        setIsFavorite(favs.some(fav => fav.id === itemId));
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      setIsFavorite(false);
    }
  };
  // Define useEffect
  useEffect(() => {
    fetchItem()
    checkFavoriteStatus()
  }, [])

  return (
    <ScrollView style={{ flex: 1 }}>
      <Image style={{ width: '100%', height: 500 }} source={{ uri: item?.image }}></Image>
      <View style={{ padding: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 20, fontWeight: '500', width: '80%' }}>
            {/* Điền variable item name dưới đây */}
            ---
            {/* ----------------------- */}
          </Text>
          <Pressable onPress={handleToggleFavorite}>
            <MaterialIcons
              name={isFavorite ? "favorite" : "favorite-border"}
              size={28}
              color="#e60000"
            />
          </Pressable>
        </View>
        {/* Thêm các trường hiển thị dưới dòng này */}
        
        {/* ----------------------- */}
      </View>
    </ScrollView>
  )
}

export default DetailScreen