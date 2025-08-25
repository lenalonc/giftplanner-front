import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { GiftItem } from "../components/GiftItem";
import { API_BASE } from "../config";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { ROUTES } from "../constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GiftsScreen = ({ route }) => {
  const { friendId } = route.params;
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchGifts = async () => {
    if (!refreshing) setLoading(true);
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE}/recipient/${friendId}/gift`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();
      setGifts(data);
    } catch (error) {
      console.error("Failed to fetch gifts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddGift = (newGift) => {
    setGifts((prevGifts) => [...prevGifts, newGift]);
  };

  const handleEdit = (gift) => {
    if (!gift) return;

    navigation.navigate(ROUTES.GIFT_EDIT, {
      gift,
      onUpdate: handleUpdateGift,
    });
  };

  const handleUpdateGift = (updatedGift) => {
    setGifts((prevGifts) =>
      prevGifts.map((gift) => (gift.id === updatedGift.id ? updatedGift : gift))
    );
  };

  const handleDelete = async (id) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE}/recipient/gift/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete gift");
      }

      setGifts((prev) => prev.filter((gift) => gift.id !== id));
    } catch (error) {
      console.error("Error occured while deleting a gift:", error);
    }
  };

  const handleCheckItem = async (giftId, check) => {
    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE}/recipient/gift/${giftId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(check),
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();
      if (data != null) {
        setGifts((prevGifts) =>
          prevGifts.map((gift) =>
            gift.id === giftId ? { ...gift, purchased: data } : gift
          )
        );
      }
    } catch (error) {
      console.error("Error checking the gift:", error);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, [friendId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchGifts();
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(ROUTES.GIFT_ADD, {
              friendId,
              onAdd: handleAddGift,
            })
          }
          style={styles.simplePlusContainer}
        >
          <Icon name="add" size={30} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: "white" }]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!gifts.length) {
    return (
      <View style={[styles.center, { backgroundColor: "white" }]}>
        <Text>No gifts found for this recipient.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={gifts}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <GiftItem
          gift={item}
          onDelete={handleDelete}
          onPressItem={handleEdit}
          onCheck={handleCheckItem}
        />
      )}
      contentContainerStyle={{ paddingBottom: 20 }}
      style={{ backgroundColor: "white" }}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  simplePlusContainer: {},
});
