import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import {
  GestureHandlerRootView,
  Swipeable,
} from "react-native-gesture-handler";
import { Ionicons as Icon } from "@expo/vector-icons";
import { useRef } from "react";
import { API_BASE } from "../config";
import { useNavigation } from "@react-navigation/native";
import { ROUTES } from "../constants";

export const FriendCard = ({
  friend,
  onLongPress,
  onDelete,
  onSwipeableOpen,
}) => {
  const navigation = useNavigation();
  const initials = `${friend.firstname[0] || ""}${friend.lastname[0] || ""}`.toUpperCase();
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const maxSwipe = 80;

    const translateX = dragX.interpolate({
      inputRange: [-maxSwipe, 0],
      outputRange: [0, maxSwipe],
      extrapolate: "clamp",
    });

    const confirmDelete = () => {
      Alert.alert(
        "Confirm Delete",
        "You will delete this item. Are you sure?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              swipeableRef.current?.close();
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(friend.id),
          },
        ],
        { cancelable: true }
      );
    };

    return (
      <Animated.View style={{ transform: [{ translateX }] }}>
        <TouchableOpacity
          onPress={confirmDelete}
          style={[styles.deleteButton, { width: maxSwipe }]}
        >
          <Icon name="trash" size={24} color="red" />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const handleSwipeableWillOpen = () => {
    if (onSwipeableOpen) {
      onSwipeableOpen(swipeableRef);
    }
  };

  const handlePress = () => {
    navigation.navigate(ROUTES.GIFTS, { friendId: friend.id });
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={20}
        onSwipeableWillOpen={handleSwipeableWillOpen}
      >
        <TouchableOpacity
          style={styles.card}
          onLongPress={() => onLongPress(friend)}
          activeOpacity={0.7}
          onPress={handlePress}
        >
          {friend.profileImg ? (
            <Image
              source={{
                uri: `${API_BASE}/profilePicture/${friend.profileImg}`,
              }}
              style={styles.image}
            />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initialsText}>{initials}</Text>
            </View>
          )}

          <View style={styles.textContainer}>
            <Text style={styles.name}>
              {friend.firstname} {friend.lastname}
            </Text>
            <Text style={styles.birthday}>
              Birthday: {new Date(friend.birthday).toLocaleDateString("en-GB")}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    alignItems: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  initialsContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#9b9fa5ff",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  birthday: {
    color: "#666",
    marginTop: 4,
  },
  deleteButton: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
});
