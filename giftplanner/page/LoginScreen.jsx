import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { API_BASE } from "../config";
import Icon from "react-native-vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROUTES } from "../constants";
import * as Notifications from "expo-notifications";

export const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const hasGiftPNG = true;

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        } else {
          throw new Error("Incorrect password");
        }
      }

      const data = await response.json();
      if (data?.token) {
        await AsyncStorage.setItem("token", data.token);
        // const expoPushToken = await Notifications.getExpoPushTokenAsync();
        // console.log(JSON.stringify({ expoPushToken: expoPushToken.data }));

        // await fetch(`${API_BASE}/user/push-token`, {
        //   method: "POST",
        //   headers: {
        //     Authorization: `Bearer ${data.token}`,
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({ expoPushToken: expoPushToken.data }),
        // });

        navigation.replace("Home");
      } else {
        Alert.alert("Error", "Token not received from server");
      }
    } catch (err) {
      // console.error(err);
      Alert.alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <View style={styles.iconContainer}>
          {hasGiftPNG ? (
            <Image
              source={require("../assets/gift-black.png")}
              style={{ width: 120, height: 120, marginBottom: 10 }}
              resizeMode="contain"
            />
          ) : (
            <Icon name="gift-outline" size={80} color="#007AFF" />
          )}
        </View>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Log in"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.navigate("Register")}
        >
          <Text style={styles.outlineButtonText}>Create new account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  mainContent: {
    flex: 1,
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 30,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    backgroundColor: "transparent",
    width: "100%",
  },
  outlineButtonText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
