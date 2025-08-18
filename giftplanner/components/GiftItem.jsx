import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const GiftItem = ({ gift, onDelete, onPressItem, onCheck }) => {
  const handleMenuPress = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ["Cancel", "Delete"],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0,
          title: gift.title,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Alert.alert(
              "Confirm Delete",
              `Are you sure you want to delete "${gift.title}"?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => onDelete(gift.id),
                },
              ]
            );
          }
        }
      );
    } else {
      Alert.alert(
        "Delete Gift",
        `Are you sure you want to delete "${gift.title}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(gift.id),
          },
        ]
      );
    }
  };

  const priceText = gift.price
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: gift.currency || "USD",
      }).format(gift.price)
    : "0.00";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.noImage}
        onPress={() => onCheck(gift.id, !gift.purchased)}
      >
        <View
          style={[
            styles.outerCircle,
            { borderColor: gift.purchased ? "#1E90FF" : "#ccc" },
          ]}
        >
          {gift.purchased && <View style={styles.innerCircle} />}
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.textContainer}
        onPress={() => onPressItem(gift)}
      >
        <Text style={styles.title}>{gift.title}</Text>
        <Text style={styles.price}>{priceText}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton}>
        <Ionicons name="trash-outline" size={20} color="#1E90FF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "white",
  },
  noImage: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
    marginLeft: 12,
    maxWidth: "70%",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  price: {
    marginTop: 4,
    color: "#666",
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 60,
  },
  menuButton: {
    padding: 8,
    marginLeft: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  outerCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#1E90FF",
    justifyContent: "center",
    alignItems: "center",
  },

  innerCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#1E90FF",
  },
});
