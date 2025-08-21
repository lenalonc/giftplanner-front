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
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DropDownPicker from "react-native-dropdown-picker";
import * as ImagePicker from "expo-image-picker";
import { API_BASE } from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const EditGiftScreen = ({ navigation, route }) => {
  const { gift, onUpdate } = route.params;

  const [origTitle, setOrigTitle] = useState(gift.title);
  const [origDescription, setOrigDescription] = useState(gift.description);

  const [origPrice, setOrigPrice] = useState(gift.price?.toString());
  const [origCurrency, setOrigCurrency] = useState(gift.currency);
  const [origImgUrl, setOrigImgUrl] = useState(gift.imageUrl);

  const [title, setTitle] = useState(origTitle);
  const [description, setDescription] = useState(origDescription);
  const [price, setPrice] = useState(origPrice);
  const [currency, setCurrency] = useState(origCurrency);
  const [file, setFile] = useState(null);
  const[imgUrl, setImgUrl] = useState(origImgUrl);

  const [isEditing, setIsEditing] = useState(false);

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([
    { label: "EUR", value: "EUR" },
    { label: "RSD", value: "RSD" },
    { label: "USD", value: "USD" },
    { label: "GBP", value: "GBP" },
    { label: "JPY", value: "JPY" },
    { label: "CHF", value: "CHF" },
  ]);

  const isSaveDisabled = !title.trim();

  const confirmDiscard = (goBackAfterDiscard = false) => {
    Alert.alert(
      "Discard changes?",
      "You have unsaved changes. Are you sure you want to discard this gift?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Discard",
          style: "destructive",
          onPress: () => {
            setTitle(origTitle);
            setDescription(origDescription);
            setPrice(origPrice);
            setCurrency(origCurrency);
            setFile(null);
            setIsEditing(false);
            setImgUrl(origImgUrl);

            if (goBackAfterDiscard) {
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  const handleBackPress = () => {
    if (isEditing) {
      confirmDiscard(true);
    } else {
      navigation.goBack();
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleBackPress}
          style={{ paddingRight: 16 }}
        >
          <Icon name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (isEditing) {
              confirmDiscard();
            } else {
              setIsEditing(true);
            }
          }}
          style={{ paddingRight: 16 }}
        >
          <Text style={{ fontSize: 16, color: "#007AFF" }}>
            {isEditing ? "Cancel" : "Edit"}
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing]);

  const onEditImage = async () => {
    if (!isEditing) return;

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
          if (!result.canceled) {
            handlePickerResult(result);
          }
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
          if (!result.canceled) {
            handlePickerResult(result);
          }
        },
      },
    ];

    if (file || gift.imageUrl) {
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
                onPress: () => {
                  setFile(null);
                  setImgUrl(null);
                },
              },
            ]
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

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("id", gift.id);
    formData.append("title", title);

    if (description?.trim()) {
      formData.append("description", description);
    }

    if (price !== undefined && price !== "") {
      formData.append("price", price);
    }

    formData.append("currency", currency);
    formData.append("deletedPhoto", imgUrl === null)

    if (file) formData.append("file", file);

    try {
      const token = await AsyncStorage.getItem("token");

      const response = await fetch(`${API_BASE}/recipient/gift`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to update gift");

      const updatedGift = await response.json();
      if (onUpdate) onUpdate(updatedGift);

      setOrigTitle(updatedGift.title);
      setOrigDescription(updatedGift.description || "");
      setOrigPrice(updatedGift.price?.toString() || "");
      setOrigCurrency(updatedGift.currency || "EUR");
      setOrigImgUrl(updatedGift.imgUrl || null);

      setIsEditing(false);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
      nestedScrollEnabled
    >
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={[styles.input, !isEditing && styles.readonly]}
        value={title}
        onChangeText={setTitle}
        editable={isEditing}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline, !isEditing && styles.readonly]}
        value={description ?? ""}
        onChangeText={setDescription}
        multiline
        editable={isEditing}
      />

      <View style={styles.row}>
        <View style={[styles.inputContainer, { flex: 2 }]}>
          <Text style={styles.label}>Price</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.readonly]}
            value={price ?? ""}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={isEditing}
          />
        </View>

        <View
          style={[
            styles.inputContainer,
            { flex: 1, marginLeft: 10, zIndex: 5000 },
          ]}
        >
          <Text style={styles.label}>Currency</Text>
          {isEditing ? (
            <DropDownPicker
              open={open}
              value={currency}
              items={items}
              setOpen={setOpen}
              setValue={setCurrency}
              setItems={setItems}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={{ fontSize: 14, lineHeight: 22 }}
              listMode="SCROLLVIEW"
            />
          ) : (
            <TextInput
              style={[styles.input, styles.readonly]}
              value={currency}
              editable={false}
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.imageContainer}
        onPress={onEditImage}
        activeOpacity={isEditing ? 0.7 : 1}
      >
        {file ? (
          <Image source={{ uri: file.uri }} style={styles.image} />
        ) : imgUrl ? (
          <Image
            source={{ uri: `${API_BASE}/giftPhoto/${imgUrl}` }}
            style={styles.image}
          />
        ) : (
          <View style={styles.placeholder}>
            <Icon name="camera" size={40} color="#999" />
            <Text style={styles.placeholderText}>Gift Image</Text>
          </View>
        )}

        {isEditing && (file || origImgUrl) && (
          <View style={styles.editOverlay}>
            <Icon name="pencil" size={20} color="white" />
          </View>
        )}
      </TouchableOpacity>

      {isEditing && (
        <Button
          title="Save Changes"
          onPress={handleSave}
          color="#007AFF"
          disabled={isSaveDisabled}
        />
      )}
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white", padding: 15 },
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
  readonly: { backgroundColor: "#f9f9f9", color: "#666" },
  multiline: { height: 80, textAlignVertical: "top" },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 5, color: "#333" },
  imageContainer: {
    height: 380,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#f0f0f0",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%", resizeMode: "cover" },
  editOverlay: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 6,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: { justifyContent: "center", alignItems: "center" },
  placeholderText: { color: "#999", marginTop: 5 },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    minHeight: 35,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    position: "absolute",
    top: 35,
    zIndex: 5000,
  },
});
