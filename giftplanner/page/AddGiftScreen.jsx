import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Button,
  Alert,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import DropDownPicker from "react-native-dropdown-picker";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { API_BASE } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AddGiftScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { friendId, onAdd } = route.params || {};

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("RSD");
  const [file, setFile] = useState(null);
  const [bypassGuard, setBypassGuard] = useState(false);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "EUR", value: "EUR" },
    { label: "RSD", value: "RSD" },
    { label: "USD", value: "USD" },
    { label: "GBP", value: "GBP" },
    { label: "JPY", value: "JPY" },
    { label: "CHF", value: "CHF" },
  ]);

  const hasUnsavedChanges = !!(
    title.trim() ||
    description.trim() ||
    price ||
    file
  );

  const handleBackPress = () => {
    if (!bypassGuard && hasUnsavedChanges) {
      Alert.alert(
        "Discard new gift?",
        "You have unsaved changes. Are you sure you want to discard this gift?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ paddingRight: 16, paddingVertical: 8 }}
        >
          <Icon name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, hasUnsavedChanges, bypassGuard]);

  const onPickImage = async () => {
    const options = [
      {
        text: "Take Photo",
        onPress: async () => {
          const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (!cameraPerm.granted) {
            alert("Camera permission is required!");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          handlePickerResult(result);
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          const galleryPerm =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!galleryPerm.granted) {
            alert("Gallery permission is required!");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          handlePickerResult(result);
        },
      },
    ];

    if (file) {
      options.push({
        text: "Remove Photo",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Confirm Delete",
            "Are you sure you want to remove the image?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => setFile(null),
              },
            ],
            { cancelable: true }
          );
        },
      });
    }

    options.push({ text: "Cancel", style: "cancel" });
    Alert.alert("Change Gift Image", "Choose an option", options, {
      cancelable: true,
    });
  };

  const handlePickerResult = (pickerResult) => {
    if (pickerResult.cancelled) return;
    const asset = pickerResult.assets && pickerResult.assets[0];
    if (!asset) {
      return;
    }

    const uriParts = asset.uri.split("/");
    const fileName = asset.fileName || uriParts[uriParts.length - 1];
    const fileType = asset.mimeType || "image/jpeg";

    const selectedFile = { uri: asset.uri, name: fileName, type: fileType };
    setFile(selectedFile);
  };

  const isSaveDisabled = !title.trim();

  const handleSave = async () => {
    setBypassGuard(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("currency", currency);
    formData.append("recipientId", friendId);

    if (file) {
      formData.append("file", file);
    }

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE}/recipient/gift`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const data = await response.json();

      if (data != null) {
        onAdd(data);
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error saving new friend:", error);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled={true}
    >
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Enter description"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 2 }]}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        <View
          style={[
            styles.inputContainer,
            { flex: 1, marginLeft: 10, zIndex: 5000 },
          ]}
        >
          <Text style={styles.label}>Currency</Text>
          <DropDownPicker
            open={open}
            value={currency}
            items={items}
            setOpen={setOpen}
            setValue={setCurrency}
            setItems={setItems}
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              paddingHorizontal: 10,
              minHeight: 35,
            }}
            dropDownContainerStyle={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              position: "absolute",
              top: 35,
              zIndex: 5000,
            }}
            textStyle={{ fontSize: 14, lineHeight: 22 }}
            listMode="SCROLLVIEW"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.imageContainer} onPress={onPickImage}>
        {file ? (
          <Image source={{ uri: file.uri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="camera" size={40} color="#999" />
            <Text style={styles.placeholderText}>Add Gift Image</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={{ marginTop: 20 }}>
        <Button
          title="Save Gift"
          onPress={handleSave}
          color="#007AFF"
          disabled={isSaveDisabled}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "white", flex: 1, padding: 15 },
  row: { flexDirection: "row" },
  inputContainer: { flex: 1 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: "white",
  },
  multiline: { height: 80, textAlignVertical: "top" },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 5, color: "#333" },
  imageContainer: {
    height: 380,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#999", marginTop: 5 },
});
