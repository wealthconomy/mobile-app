import { useCallback } from "react";
import { useUploadFileMutation } from "@/src/store/api/fileApi";
import { imageService } from "@/src/utils/imageService";

export interface UploadImageOptions {
  name?: string;
  type?: string;
  /**
   * If true, if network upload fails during dev or offline mode, returns the local URI as a fallback.
   * Defaults to true so flows can still be tested locally.
   */
  allowFallback?: boolean;
}

export function useImageUpload() {
  const [uploadFileMutation, { isLoading, error, data }] = useUploadFileMutation();

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

      const { allowFallback = true, name, type } = options;
      const payload = imageService.formatFilePayload(uri, name, type);

      try {
        const uploadRes = await uploadFileMutation(payload).unwrap();
        if (uploadRes?.data?.url) {
          return uploadRes.data.url;
        }
        if (allowFallback) {
          console.log("Upload response did not contain URL, falling back to local URI.");
          return uri;
        }
        throw new Error("Upload response missing cloud URL.");
      } catch (err) {
        console.log("Image upload error:", err);
        if (allowFallback) {
          console.log("Falling back to local URI for testing/dev mode.");
          return uri;
        }
        throw err;
      }
    },
    [uploadFileMutation]
  );

  return {
    uploadImage,
    isLoading,
    error,
    data,
  };
}
