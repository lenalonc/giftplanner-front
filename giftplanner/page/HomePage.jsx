import { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";
import { friends as initialFriends } from "../data/friends";
import { FriendCard } from "../components/FriendCard";
import { SearchBar } from "react-native-elements";
import Icon from "react-native-vector-icons/Ionicons";
import { ROUTES } from "../constants";

export const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState(initialFriends);
  const [filteredFriends, setFilteredFriends] = useState(initialFriends);
  const [refreshing, setRefreshing] = useState(false);
  const currentlyOpenSwipeableRef = useRef(null);

  const onRefresh = () => {
    setRefreshing(true);

    if (currentlyOpenSwipeableRef.current) {
      currentlyOpenSwipeableRef.current.close();
      currentlyOpenSwipeableRef.current = null;
    }

    // this is where I will call api for getting friends - refreshing
    setTimeout(() => {
      setFriends((prevFriends) => [...prevFriends]);
      setRefreshing(false);
    }, 1000);
  };

  useEffect(() => {
    const filtered = friends.filter((friend) => {
      const fullName = (friend.firstName + " " + friend.lastName).toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
    setFilteredFriends(filtered);
  }, [search, friends]);

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

  //when we slide left with one card, if the other is moved to the left it will go back to normal
  const handleSwipeableOpen = (swipeableRef) => {
    if (
      currentlyOpenSwipeableRef.current &&
      currentlyOpenSwipeableRef.current !== swipeableRef.current
    ) {
      currentlyOpenSwipeableRef.current.close();
    }
    currentlyOpenSwipeableRef.current = swipeableRef.current;
  };

  const handleAddFriend = (friendData) => {
    // simulating backend call
    setTimeout(() => {
      const newFriendFromBackend = {
        id: Date.now().toString(),
        firstName: friendData.firstName,
        lastName: friendData.lastName,
        birthday: friendData.birthday,
        imageUrl: "https://picsum.photos/200", 
      };
      setFriends((prev) => [...prev, newFriendFromBackend]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <SearchBar
          placeholder="Search..."
          onChangeText={setSearch}
          value={search}
          platform={Platform.OS}
          lightTheme
          round
          containerStyle={styles.searchContainerRow}
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

        <TouchableOpacity
          onPress={() =>
            navigation.navigate(ROUTES.FRIEND_ADD, {
              onAdd: handleAddFriend,
            })
          }
          style={styles.simplePlusContainer}
        >
          <Icon name="add" size={30} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredFriends}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <FriendCard
            friend={item}
            onLongPress={handleEdit}
            onDelete={handleDeleteFriend}
            onSwipeableOpen={handleSwipeableOpen}
          />
        )}
        contentContainerStyle={{ paddingVertical: 12 }}
        keyboardShouldPersistTaps="handled"
        refreshing={refreshing}
        onRefresh={onRefresh}
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: "#f0f0f0",
  },
  searchContainerRow: {
    flex: 1,
    backgroundColor: "transparent",
    borderBottomWidth: 0,
    borderTopWidth: 0,
    padding: 0,
    marginRight: 8,
  },
  plusButton: {
    paddingHorizontal: 6,
  },
});
