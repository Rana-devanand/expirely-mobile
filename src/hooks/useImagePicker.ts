import * as ImagePicker from "expo-image-picker";
import { Alert, Linking } from "react-native";

export const useImagePicker = () => {
  const requestPermission = async (
    type: "camera" | "gallery",
  ): Promise<boolean> => {
    let status;

    if (type === "camera") {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      status = permission.status;
    } else {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      status = permission.status;
    }

    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        `Permission to access ${type === "camera" ? "camera" : "gallery"} is required to upload product images.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermission("camera");
    if (!hasPermission) return null;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermission("gallery");
    if (!hasPermission) return null;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  return { takePhoto, pickImage };
};
