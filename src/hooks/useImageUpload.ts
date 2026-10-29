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
   * Defaults to false so production flows never leak local device URIs.
   */
  allowFallback?: boolean;
}

export function useImageUpload() {
  const [uploadFileMutation, { isLoading, error, data }] = useUploadFileMutation();
  const token = useSelector((state: RootState) => state.auth.token);

  /**
   * Uploads any local image URI (`file://` or `content://`) to the cloud server and returns the public `https://` URL.
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

      // 4. Construct FormData (Web requires actual Blob/File; Native iOS/Android requires { uri, name, type } object)
      const fileObject = {
        uri: cleanUri,
        name: filename,
        type: mimeType,
      };

      const formData = new FormData();
      if (Platform.OS === "web") {
        try {
          if (cleanUri.startsWith("data:") || cleanUri.startsWith("blob:") || cleanUri.startsWith("http")) {
            const blobRes = await fetch(cleanUri);
            const blob = await blobRes.blob();
            const file = new File([blob], filename, { type: mimeType || blob.type || "image/jpeg" });
            formData.append("file", file);
          } else {
            formData.append("file", cleanUri);
          }
        } catch {
          console.warn("[useImageUpload:web] Could not fetch Blob from URI, fallback to raw");
          formData.append("file", cleanUri);
        }
      } else {
        formData.append("file", fileObject as any);
      }

      try {
        const uploadRes: any = await uploadFileMutation(fileObject).unwrap();

        const cloudUrl =
          (typeof uploadRes === "string" && uploadRes.startsWith("http") ? uploadRes : null) ||
          (typeof uploadRes?.data === "string" && uploadRes.data.startsWith("http") ? uploadRes.data : null) ||
          uploadRes?.data?.url ||
          uploadRes?.data?.fileUrl ||
          uploadRes?.data?.secure_url ||
          uploadRes?.data?.imageUrl ||
          uploadRes?.url ||
          uploadRes?.fileUrl ||
          uploadRes?.secure_url;

        if (cloudUrl) {
          return cloudUrl;
        }

        if (allowFallback) {
          return uri;
        }
        throw new Error("Upload response missing cloud URL.");
      } catch (err: any) {
        // Native FileSystem.uploadAsync fallback on Android if JS FormData bridge encountered ENOENT
        if (Platform.OS === "android") {
          try {
            const fsUploadRes = await FileSystem.uploadAsync(
              `${process.env.EXPO_PUBLIC_API_URL}/file/upload?multiSizes=false`,
              cleanUri,
              {
                fieldName: "file",
                httpMethod: "POST",
                uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                mimeType,
              }
            );

            if (fsUploadRes.status >= 200 && fsUploadRes.status < 300) {
              const parsed = JSON.parse(fsUploadRes.body);
              const cloudUrl =
                parsed?.data?.url ||
                parsed?.url ||
                (typeof parsed?.data === "string" ? parsed.data : null);

              if (cloudUrl) {
                return cloudUrl;
              }
            }
          } catch {
            console.error("[useImageUpload][android] FileSystem.uploadAsync fallback failed");
          }
        }

        console.error("[useImageUpload] Image upload failed on all attempts");
        if (allowFallback) {
          console.warn("Falling back to local URI for testing/dev mode.");
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
