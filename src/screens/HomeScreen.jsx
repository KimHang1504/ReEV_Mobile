import { View, Text, Image, ScrollView, Pressable } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import AntDesign from '@expo/vector-icons/AntDesign';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { filters } from '../data/filters';
import { sortItemsDescending } from '../utils/sortItems';
const HomeScreen = () => {
  const navigation = useNavigation()
  // Define states
  const [items, setItems] = useState([])
  const [favorites, setFavorites] = useState([])
  const [selectedFilter, setSelectedFilter] = useState('')

  // Define functions
  const fetchItemList = async () => {
    const res = await axios.get(process.env.EXPO_PUBLIC_API_URL)
    const arrangedItems = sortItemsDescending(res.data)
    setItems(arrangedItems)
  }

  const fetchFavorites = async () => {
    try {
      const storage = await AsyncStorage.getItem('favorites')
      if (storage) {
        setFavorites(JSON.parse(storage))
      } else {
        setFavorites([])
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleToggleFavorites = async (item) => {
    try {
      let updatedFav
      const isAddedToFav = favorites.some(fav => fav.id === item.id)
      if (isAddedToFav) {
        updatedFav = favorites.filter((fav) => fav.id !== item.id)
      } else {
        updatedFav = [...favorites, item]
      }
      setFavorites(updatedFav)
      await AsyncStorage.setItem('favorites', JSON.stringify(updatedFav))
    } catch (error) {
      console.log(error)
    }
  }

  const fetchFilterItems = async (filter) => {
    if (filter == selectedFilter) {
      setSelectedFilter('')
      fetchItemList()
    } else {
      // sửa điều kiện lọc
      const res = await axios.get(`${process.env.EXPO_PUBLIC_API_URL}?team=${filter}`)
      // ----------------
      setItems(res.data)
      setSelectedFilter(filter)
    }
  }

  const handleReset = async () => {
    try {
      setSelectedFilter('')
    } catch (error) {
      console.log(error)
    }
  }
  // Define useEffect
  useEffect(() => {
    fetchItemList()
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchFavorites()
      handleReset()
    }, [])
  )

  return (
    <ScrollView>
      {/* Filter by team */}
      <Pressable style={{ display: 'flex', flexDirection: 'row', gap: 8, justifyContent: 'space-around', marginTop: 10 }}>
        {filters.map(filter => (
          <Pressable
            key={filter.id}
            onPress={() => fetchFilterItems(filter?.name)}
            style={{ paddingVertical: 8, paddingHorizontal: 10, backgroundColor: filter.name == selectedFilter ? 'gray' : 'black', borderRadius: 8 }}>
            <Text style={{ color: 'white' }}>{filter?.name}</Text>
          </Pressable>
        ))}
      </Pressable>
      <View style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 10 }}>
        {items.map((item) => (
          <Pressable onPress={() => navigation.navigate('Detail', { itemId: item.id })} key={item.id} style={{ height: 450, width: '49%', position: 'relative' }}>
            <Image style={{ width: '100%', height: 350 }} source={{ uri: item.image }}></Image>
            {/* Thêm các trường hiển thị dưới dòng này */}

            
            {/* ----------------------------------- */}
            {/* Love icons */}
            {favorites.some((fav) => fav.id === item.id) ? (
              <Pressable onPress={() => handleToggleFavorites(item)} style={{ top: 10, right: 10, position: 'absolute', padding: 8, backgroundColor: 'white', borderRadius: '50%' }}>
                <AntDesign name="heart" size={24} color="red" />
              </Pressable>
            ) : (
              <Pressable onPress={() => handleToggleFavorites(item)} style={{ top: 10, right: 10, position: 'absolute', padding: 8, backgroundColor: 'white', borderRadius: '50%' }}>
                <AntDesign name="hearto" size={24} color="red" />
              </Pressable>
            )
            }
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )
}

export default HomeScreen