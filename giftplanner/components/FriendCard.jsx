import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons as Icon } from '@expo/vector-icons';

export const FriendCard = ({ friend, onLongPress }) => {
  const initials = `${friend.firstName[0]}${friend.lastName[0]}`.toUpperCase();

  const renderRightActions = (progress, dragX) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <TouchableOpacity
        onPress={() => onDelete(friend.id)}
        style={styles.deleteButton}
      >
        <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
          <Icon name="trash" size={24} color="white" />
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => onLongPress(friend)}
        activeOpacity={0.7}
      >
        {friend.imageUrl ? (
          <Image source={{ uri: friend.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={styles.name}>
            {friend.firstName} {friend.lastName}
          </Text>
          <Text style={styles.birthday}>
            Rođendan: {new Date(friend.birthday).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
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
});
