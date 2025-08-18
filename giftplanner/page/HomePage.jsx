import { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";
import { FriendCard } from "../components/FriendCard";
import { SearchBar } from "react-native-elements";
import Icon from "react-native-vector-icons/Ionicons";
import { ROUTES } from "../constants";
import { API_BASE } from "../config";

export const HomeScreen = ({ navigation }) => {
  const [search, setSearch] = useState("");
  const [friends, setFriends] = useState([]);
  const [filteredFriends, setFilteredFriends] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const currentlyOpenSwipeableRef = useRef(null);

  const fetchFriends = () => {
    fetch(`${API_BASE}/recipient`)
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setFriends(data);
        setFilteredFriends(data);
      })
      .catch((err) => console.error("Error loading friends:", err))
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);

    if (currentlyOpenSwipeableRef.current) {
      currentlyOpenSwipeableRef.current.close();
      currentlyOpenSwipeableRef.current = null;
    }

    fetchFriends();
  };

  useEffect(() => {
    if (!friends) return;
    const filtered = friends.filter((friend) => {
      if (!friend) return false;

      const first = friend.firstname ?? "";
      const last = friend.lastname ?? "";
      if (first.trim() === "" && last.trim() === "") return false;

      const fullName = (first + " " + last).toLowerCase();
      return fullName.includes(search.toLowerCase());
    });
    setFilteredFriends(filtered);
  }, [search, friends]);

  const handleUpdateFriend = (updatedFriend) => {
    fetch(`${API_BASE}/recipient`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedFriend),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // fetchFriends();
        setFriends((prev) => prev.map((f) => (f.id === data.id ? data : f)));
      })
      .catch((err) => console.error("Error updating friend:", err));
  };

  const handleUpdateImage = (friendId, newUrl) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, profileImg: newUrl } : f))
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

  const handleDeleteFriend = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/recipient/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete friend");
      }

      setFriends((prev) => prev.filter((friend) => friend.id !== id));
    } catch (error) {
      console.error("Error occured while deleting a friend:", error);
    }
  };

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
    setFriends((prevFriends) => [...prevFriends, friendData]);
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
