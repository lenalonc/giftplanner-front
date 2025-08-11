import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Button,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Icon from "react-native-vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";

export const EditFriendScreen = ({ navigation, route }) => {
  const { friend, onUpdate, onUpdateImage } = route.params;
  const [firstName, setFirstName] = useState(friend.firstName);
  const [lastName, setLastName] = useState(friend.lastName);
  const [birthday, setBirthday] = useState(new Date(friend.birthday));
  const [imageUrl, setImageUrl] = useState(friend.imageUrl);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempBirthday, setTempBirthday] = useState(birthday);

  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();

  const isSaveDisabled =
    firstName === friend.firstName &&
    lastName === friend.lastName &&
    birthday.getTime() === new Date(friend.birthday).getTime();

  const onSave = () => {
    onUpdate({
      ...friend,
      firstName,
      lastName,
      birthday: birthday.toLocaleDateString("en-CA"), 
      imageUrl,
    });
    navigation.goBack();
  };

  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
      if (selectedDate) {
        setBirthday(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempBirthday(selectedDate);
      }
    }
  };

  const onEditImage = async () => {
    Alert.alert(
      "Change Profile Picture",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const cameraPerm =
              await ImagePicker.requestCameraPermissionsAsync();
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
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  const handlePickerResult = (pickerResult) => {
    if (pickerResult.cancelled) return;

    setTimeout(() => {
      const simulatedUrl = pickerResult.uri;
      setImageUrl(simulatedUrl);
      onUpdateImage({
        id: friend.id,
        imageUrl: simulatedUrl,
      });
    }, 1000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.imageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.initialsContainer}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
        )}

        <TouchableOpacity style={styles.editIcon} onPress={onEditImage}>
          <Icon name="pencil" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Firstname"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Lastname"
        />

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.datePickerButton}
        >
          <Text style={styles.dateText}>{birthday.toLocaleDateString("en-GB")}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <>
            <DateTimePicker
              value={Platform.OS === "ios" ? tempBirthday : birthday}
              mode="date"
              display="spinner"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
            {Platform.OS === "ios" && (
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  marginVertical: 10,
                }}
              >
                <Button
                  title="Cancel"
                  onPress={() => {
                    setTempBirthday(birthday); //return to previous birthday if change is canceled
                    setShowDatePicker(false);
                  }}
                />
                <Button
                  title="OK"
                  onPress={() => {
                    setBirthday(tempBirthday); //set to new birthday if the change of temp birthday is confirmed
                    setShowDatePicker(false);
                  }}
                />
              </View>
            )}
          </>
        )}
        {!showDatePicker && (
          <View style={styles.buttonsRow}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              disabled={isSaveDisabled}
              color="red"
            />
            <Button title="Save" onPress={onSave} disabled={isSaveDisabled} />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
    alignItems: "center",
  },
  imageWrapper: {
    position: "relative",
    marginBottom: 20,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  initialsContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#9b9fa5ff",
    justifyContent: "center",
    alignItems: "center",
  },
  initialsText: {
    color: "white",
    fontSize: 56,
    fontWeight: "bold",
  },
  editIcon: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#00000099",
    borderRadius: 15,
    padding: 6,
  },
  form: {
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
  },
  datePickerButton: {
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    marginBottom: 20,
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
