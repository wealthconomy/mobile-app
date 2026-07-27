import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Alert } from "react-native";

export interface ImageSelectionResult {
  uri: string;
  base64?: string;
  fileName?: string;
  mimeType?: string;
  width?: number;
  height?: number;
}

export const imageService = {
  /**
   * Request library permissions and pick an image from the photo gallery.
   */
  async pickImageFromLibrary(
    options: ImagePicker.ImagePickerOptions = {}
  ): Promise<ImageSelectionResult | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant photo library permissions to select an image."
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        ...options,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        base64: asset.base64 || undefined,
        fileName: asset.fileName || asset.uri.split("/").pop() || "image.jpg",
        mimeType: asset.mimeType || "image/jpeg",
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.log("Error picking image from library:", error);
      Alert.alert("Error", "Could not pick image from library.");
      return null;
    }
  },

  /**
   * Request camera permissions and capture an image with the device camera.
   */
  async captureImageWithCamera(
    options: ImagePicker.ImagePickerOptions = {}
  ): Promise<ImageSelectionResult | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant camera permissions to take a photo."
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: true,
        ...options,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      return {
        uri: asset.uri,
        base64: asset.base64 || undefined,
        fileName: asset.fileName || asset.uri.split("/").pop() || "camera_photo.jpg",
        mimeType: asset.mimeType || "image/jpeg",
        width: asset.width,
        height: asset.height,
      };
    } catch (error) {
      console.log("Error capturing image with camera:", error);
      Alert.alert("Error", "Could not take photo with camera.");
      return null;
    }
  },

  /**
   * Convert any local image URI (file:// or content://) to a clean base64 string.
   */
  async convertImageToBase64(uri: string): Promise<string | null> {
    try {
      if (!uri) return null;
      // If uri already contains base64 data URI prefix, return or strip if needed
      if (uri.startsWith("data:image")) {
        return uri.split(",")[1] || uri;
      }
      const base64String = await FileSystem.readAsStringAsync(uri, {
        encoding: "base64" as any,
      });
      return base64String;
    } catch (error) {
      console.log("Error converting image to base64:", error);
      return null;
    }
  },

  /**
   * Cleanly format a URI into a standard payload object suitable for RTK Query uploadFile mutation.
   */
  formatFilePayload(uri: string, customName?: string, customType?: string) {
    const filename = customName || uri.split("/").pop() || "image.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const mimeType = customType || (match ? `image/${match[1]}` : "image/jpeg");
    return {
      uri,
      name: filename,
      type: mimeType,
    };
  },
};
