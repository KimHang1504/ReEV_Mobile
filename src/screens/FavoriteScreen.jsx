import { View, Text, ScrollView, Image, Pressable, Alert } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AntDesign } from '@expo/vector-icons'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
const FavoriteScreen = () => {
  const navigation = useNavigation()
  // Define states
  const [favorites, setFavorites] = useState([])
  const [selected, setSelected] = useState([])
  const [isMultiSelected, setIsMultiSelected] = useState(false)
  // Define functions
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

  const handleToggleSelect = async (item) => {
    try {
      let updatedSelect
      const isSelected = selected.some(sel => sel.id === item.id)
      if (isSelected) {
        updatedSelect = selected.filter(sel => sel.id !== item.id)
      } else {
        updatedSelect = [...selected, item]
      }
      setSelected(updatedSelect)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSelectAll = async () => {
    try {
      setSelected(favorites)
    } catch (error) {
      console.log(error)
    }
  }

  const handleCancel = async () => {
    try {
      setSelected([])
    } catch (error) {
      console.log(error)
    }
  }

  const handleRemove = async () => {
    try {
      Alert.alert(
        'Xác nhận xóa',
        'Xác nhận loại khỏi danh sách yêu thích',
        [
          {
            text: 'Hủy',
            style: 'cancel'
          },
          {
            text: 'OK',
            onPress: async () => {
              try {
                const selectedIds = selected.map(sel => sel.id)
                const updatedFav = favorites.filter(fav => !selectedIds.includes(fav.id))
                setFavorites(updatedFav)
                setIsMultiSelected(false)
                await AsyncStorage.setItem('favorites', JSON.stringify(updatedFav))
              } catch (error) {
                console.log(error)
              }
            },
            style: 'destructive'
          }
        ]
      )

    } catch (error) {
      console.log(error)
    }
  }

  const handleReset = async () => {
    setIsMultiSelected(false)
    setSelected([])
  }
  // Define useEffect
  useFocusEffect(
    useCallback(() => {
      fetchFavorites()
      handleReset()
    }, [])
  )
  //===========================
  return (
    <>
      {favorites.length === 0 ? (
        <View style={{ display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text> Không có yêu thích nào để hiển thị</Text>
        </View>
      ) : (
        <ScrollView>
          {/* Multi selection options */}
          {isMultiSelected ? (
            <View style={{ display: favorites.length === 0 ? 'none' : 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingRight: 15, paddingTop: 10 }}>
              <Pressable onPress={() => handleSelectAll()} style={{ padding: 8, backgroundColor: 'black', borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Chọn tất cả</Text>
              </Pressable>
              <Pressable onPress={() => handleRemove()} style={{ padding: 8, backgroundColor: 'black', borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Bỏ thích</Text>
              </Pressable>
              <Pressable onPress={() => handleCancel()} style={{ padding: 8, backgroundColor: 'black', borderRadius: 8 }}>
                <Text style={{ color: 'white' }}>Hủy chọn</Text>
              </Pressable>
            </View>
          ) : (
            favorites.length > 0 &&
            <Pressable hitSlop={10} style={{ padding: 10 }} onPress={() => setIsMultiSelected(true)}>
              <Text style={{ fontSize: 18 }}>Edit</Text>
            </Pressable>
          )}

          {/* Show items */}
          <View style={{ flex: 1, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 10 }}>
            {favorites.map((item) => (
              <Pressable onPress={() => navigation.navigate('Detail', { itemId: item.id })} key={item.id} style={{ height: 450, width: '49%', position: 'relative' }}>
                <Image style={{ width: '100%', height: 350 }} source={{ uri: item.image }}></Image>
                {/* Thêm các trường hiển thị dưới dòng này */}


                {/* ----------------------------- */}
                {/* Love selection*/}
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
                {/* Multi selection */}
                <Pressable onPress={() => handleToggleSelect(item)} hitSlop={10} style={{ position: 'absolute', top: 15, left: 10 }} >
                  {isMultiSelected && (
                    selected.some(sel => sel.id === item.id) ?
                      (
                        <MaterialCommunityIcons name="checkbox-marked-circle" size={30} color="blue" />
                      )
                      : (
                        <MaterialCommunityIcons name="checkbox-blank-circle-outline" size={30} color="white" />
                      )
                    // 
                  )}
                </Pressable>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
    </>
  )
}

export default FavoriteScreen