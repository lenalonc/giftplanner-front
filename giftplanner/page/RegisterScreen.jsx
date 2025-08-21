import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { API_BASE } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ROUTES } from "../constants";

export const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const hasGiftPNG = true;
  const [errors, setErrors] = useState({
    username: false,
    email: false,
    password: false,
  });

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleRegister = async () => {
    const newErrors = {
      username: !username,
      email: !email || !isValidEmail(email),
      password: !password,
    };
    setErrors(newErrors);

    if (!username || !email || !password) return;

    if (!isValidEmail(email)) {
      Alert.alert(
        "Invalid email address",
        "Please enter a valid email address"
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            throw new Error(errorData.message || "Login failed");
          } else {
            throw new Error("Error occured during registration");
          }
        } else {
          throw new Error("Error occured during registration");
        }
      }
      // throw new Error(`Registration failed: ${response.status}`);

      const data = await response.json();

      if (data && data.token) {
        await AsyncStorage.setItem("token", data.token);
        navigation.replace(ROUTES.HOME);
      } else {
        alert("Account created, but no token returned!");
      }
    } catch (err) {
      alert(err.message);
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
          style={[
            styles.input,
            errors.username && { borderColor: "red", borderWidth: 2 },
          ]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.input,
            errors.email && { borderColor: "red", borderWidth: 2 },
          ]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={[
            styles.input,
            errors.password && { borderColor: "red", borderWidth: 2 },
          ]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registering..." : "Register"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginBottom: 160,
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
    width: "100%",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
