import { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, Platform } from "react-native";
import { friends as initialFriends } from "../data/friends";
import { FriendCard } from "../components/FriendCard";
import { SearchBar } from "react-native-elements";
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity } from "react-native";
import { ROUTES } from "../constants";

export const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState(initialFriends);
  const [filteredFriends, setFilteredFriends] = useState(initialFriends);

  useEffect(() => {
    const filtered = friends.filter((friend) => {
      const fullName = (friend.firstName + " " + friend.lastName).toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
    setFilteredFriends(filtered);
  }, [search, friends]);

  // Kad se sacuvaju izmene u EditFriendScreen, dobijemo updatedFriend i update-ujemo listu
  const handleUpdateFriend = (updatedFriend) => {
    console.log(updatedFriend);
    setFriends((prev) =>
      prev.map((f) => (f.id === updatedFriend.id ? updatedFriend : f))
    );
  };

  const handleUpdateImage = (friendId, newImageUrl) => {
    console.log(friendId);
    console.log(newImageUrl);
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, imageUrl: newImageUrl } : f))
    );
  };

  // Poziva se na dugom pritisku kartice
  const handleEdit = (friend) => {
    if (!friend) return;

    navigation.navigate(ROUTES.FRIEND_EDIT, {
      friend,
      onUpdate: handleUpdateFriend,
      onUpdateImage: handleUpdateImage,
    });
  };

  const handleDeleteFriend = (id) => {
    setFriends((prev) => prev.filter((friend) => friend.id !== id));
  };

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search..."
        onChangeText={setSearch}
        value={search}
        platform={Platform.OS}
        lightTheme
        round
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInputContainer}
        inputStyle={styles.searchInput}
        searchIcon={<Icon name="search" size={20} color="#888" />}
        clearIcon={
          <TouchableOpacity onPress={() => setSearch("")}>
            <Icon name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        }
        onClear={() => setSearch("")}
        showCancel={true}
        onCancel={() => setSearch("")}
      />
      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard friend={item} onLongPress={handleEdit} />
        )}
        contentContainerStyle={{ paddingVertical: 12 }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  searchInput: { fontSize: 14, paddingVertical: 4 },
  searchInputContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    height: 36,
    paddingVertical: 0,
  },
  searchContainer: {
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: "100%",
    alignSelf: "center",
  },
});
