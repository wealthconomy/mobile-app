import { useCallback } from "react";
import { useUploadFileMutation } from "@/src/store/api/fileApi";
import { imageService } from "@/src/utils/imageService";

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
      const payload = imageService.formatFilePayload(uri, name, type);

      try {
        console.log("\n================ [USE_IMAGE_UPLOAD - DISPATCHING] ================");
        console.log("Local URI:", uri);
        console.log("Payload:", JSON.stringify(payload, null, 2));
        console.log("===================================================================\n");

        const uploadRes: any = await uploadFileMutation(payload).unwrap();

        console.log("\n================ [USE_IMAGE_UPLOAD - RAW MUTATION RESPONSE] ================");
        console.log(JSON.stringify(uploadRes, null, 2));
        console.log("===========================================================================\n");

        // Extract cloud URL from various possible backend response formats
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

        console.log("[USE_IMAGE_UPLOAD] Resolved Cloud URL:", cloudUrl);

        if (cloudUrl && (cloudUrl.startsWith("http://") || cloudUrl.startsWith("https://"))) {
          return cloudUrl;
        }

        if (allowFallback) {
          console.warn("Upload response did not contain a valid cloud URL, falling back to local URI.");
          return uri;
        }
        throw new Error("Cloud upload succeeded but did not return a valid public HTTPS URL.");
      } catch (err) {
        console.error("Image upload error:", err);
        if (allowFallback) {
          console.warn("Falling back to local URI for testing/dev mode.");
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
