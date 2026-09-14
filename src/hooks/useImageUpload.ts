import { useCallback } from "react";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { useSelector } from "react-redux";
import { RootState } from "@/src/store";
import { useUploadFileMutation } from "@/src/store/api/fileApi";

export interface UploadImageOptions {
  name?: string;
  type?: string;
  /**
   * If true, if network upload fails during dev or offline mode, returns the local URI as a fallback.
   * Defaults to false so broken local paths are not saved to remote databases.
   */
  allowFallback?: boolean;
}

export function useImageUpload() {
  const [uploadFileMutation, { isLoading, error, data }] = useUploadFileMutation();
  const token = useSelector((state: RootState) => state.auth.token);

  /**
   * Uploads any local image URI (`file://` or `content://`) to the cloud server and returns the `https://` URL.
   * If the URI is already a remote `http://` or `https://` URL, returns it immediately without re-uploading.
   */
  const uploadImage = useCallback(
    async (uri: string, options: UploadImageOptions = {}): Promise<string> => {
      if (!uri) return "";

      // If already a remote URL, no need to upload again
      if (uri.startsWith("http://") || uri.startsWith("https://")) {
        return uri;
      }

      const { allowFallback = false, name, type } = options;

      // 1. Clean the URI
      let cleanUri = uri;
      if (Platform.OS === "android") {
        if (!cleanUri.startsWith("file://") && !cleanUri.startsWith("content://")) {
          cleanUri = `file://${cleanUri}`;
        }
      }

      // 2. Derive a valid filename with an extension
      let filename = name;
      if (!filename) {
        const uriPath = cleanUri.split("?")[0].split("#")[0];
        const rawName = uriPath.split("/").pop();
        filename = rawName && rawName.includes(".") ? rawName : `photo_${Date.now()}.jpg`;
      }
      if (!filename.includes(".")) {
        filename = `${filename}.jpg`;
      }

      // 3. Determine MIME type (Android requires standard types e.g. image/jpeg, never image/jpg)
      const extMatch = /\.(\w+)$/.exec(filename);
      const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
      let mimeType = type;
      if (!mimeType) {
        if (ext === "png") mimeType = "image/png";
        else if (ext === "webp") mimeType = "image/webp";
        else mimeType = "image/jpeg";
      } else if (mimeType.toLowerCase() === "image/jpg") {
        mimeType = "image/jpeg";
      }

      // 4. Construct explicit file object (uri, name, type) for Android multipart serialization
      const fileObject = {
        uri: cleanUri,
        name: filename,
        type: mimeType,
      };

      const formData = new FormData();
      formData.append("file", fileObject as any);

      // Log immediately before upload on Android
      if (Platform.OS === "android") {
        console.log(`[useImageUpload][android] 🚀 Initiating upload with file object:`, JSON.stringify(fileObject, null, 2));
      }

      try {
        const uploadRes = await uploadFileMutation(formData).unwrap();

        // Log immediately after upload resolves on Android
        if (Platform.OS === "android") {
          console.log(`[useImageUpload][android] ✅ Upload resolved:`, {
            platform: Platform.OS,
            fileObject,
            rawResponse: uploadRes,
          });
        }

        const cloudUrl =
          uploadRes?.data?.url ||
          (uploadRes as any)?.url ||
          (typeof uploadRes?.data === "string" ? uploadRes.data : null);

        if (cloudUrl) {
          console.log("✅ [useImageUpload] Image uploaded successfully:", cloudUrl);
          return cloudUrl;
        }

        if (allowFallback) {
          console.log("Upload response did not contain URL, falling back to local URI:", uploadRes);
          return uri;
        }
        throw new Error("Upload response missing cloud URL.");
      } catch (err: any) {
        // Log immediately after upload rejects on Android
        if (Platform.OS === "android") {
          console.error(`[useImageUpload][android] ❌ Upload rejected:`, {
            platform: Platform.OS,
            fileObject,
            rawError: err?.data || err?.message || err,
          });
        }

        // Native FileSystem.uploadAsync fallback on Android if JS FormData bridge encountered ENOENT
        if (Platform.OS === "android") {
          console.log("[useImageUpload][android] Attempting native FileSystem.uploadAsync fallback...");
          try {
            const fsUploadRes = await FileSystem.uploadAsync(
              `${process.env.EXPO_PUBLIC_API_URL}/file/upload`,
              cleanUri,
              {
                fieldName: "file",
                httpMethod: "POST",
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                mimeType,
              }
            );

            console.log(`[useImageUpload][android] FileSystem.uploadAsync resolved with status ${fsUploadRes.status}:`, fsUploadRes.body);

            if (fsUploadRes.status >= 200 && fsUploadRes.status < 300) {
              const parsed = JSON.parse(fsUploadRes.body);
              const cloudUrl =
                parsed?.data?.url ||
                parsed?.url ||
                (typeof parsed?.data === "string" ? parsed.data : null);

              if (cloudUrl) {
                console.log("✅ [useImageUpload][android] Native FileSystem.uploadAsync succeeded:", cloudUrl);
                return cloudUrl;
              }
            }
          } catch (fsErr) {
            console.error("❌ [useImageUpload][android] FileSystem.uploadAsync fallback failed:", fsErr);
          }
        }

        console.log("Image upload error:", err);
        if (allowFallback) {
          console.log("Falling back to local URI for testing/dev mode.");
          return uri;
        }
        throw err;
      }
    },
    [uploadFileMutation, token]
  );

  return {
    uploadImage,
    isLoading,
    error,
    data,
  };
}
