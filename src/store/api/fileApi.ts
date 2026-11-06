import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { baseApi, ApiResponse } from "./baseApi";

export interface FileUploadResponse {
  url: string;
  key?: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export interface DeleteFileRequest {
  key?: string;
  url?: string;
}

export const fileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadFile: builder.mutation<ApiResponse<FileUploadResponse>, { uri: string; name?: string; type?: string } | FormData | any>({
      queryFn: async (arg, { getState }) => {
        try {
          const state = getState() as any;
          const token = state?.auth?.token;
          const headers: Record<string, string> = {
            Accept: "application/json",
          };
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/file/upload?multiSizes=false`;

          // If on native platform (iOS / Android) and we have a local file URI
          if (Platform.OS !== "web" && typeof arg?.uri === "string" && !arg.uri.startsWith("http")) {
            try {
              if (FileSystem && typeof FileSystem.uploadAsync === "function") {
                const uploadResult = await FileSystem.uploadAsync(uploadUrl, arg.uri, {
                  httpMethod: "POST",
                  uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                  fieldName: "file",
                  mimeType: arg.type || "image/jpeg",
                  headers,
                });

                if (uploadResult.status >= 200 && uploadResult.status < 300) {
                  let parsed: any;
                  try {
                    parsed = JSON.parse(uploadResult.body);
                  } catch {
                    parsed = { data: { url: uploadResult.body } };
                  }
                  return { data: parsed };
                } else {
                  let errorData: any;
                  try {
                    errorData = JSON.parse(uploadResult.body);
                  } catch {
                    errorData = uploadResult.body;
                  }
                  return { error: { status: uploadResult.status, data: errorData } };
                }
              }
            } catch {
              // Fallback to standard FormData fetch
            }
          }

          let formData: FormData;
          if (arg instanceof FormData || arg?._parts) {
            formData = arg;
          } else if (arg?.uri) {
            formData = new FormData();
            const filename = arg.name || arg.uri.split("/").pop() || "file.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const ext = match ? match[1].toLowerCase() : "jpg";
            let mimeType = arg.type || (ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg");
            if (mimeType.toLowerCase() === "image/jpg") {
              mimeType = "image/jpeg";
            }
            if (Platform.OS === "web") {
              try {
                if (arg.uri.startsWith("data:") || arg.uri.startsWith("blob:") || arg.uri.startsWith("http")) {
                  const blobRes = await fetch(arg.uri);
                  const blob = await blobRes.blob();
                  const file = new File([blob], filename, { type: mimeType || blob.type || "image/jpeg" });
                  formData.append("file", file);
                } else {
                  formData.append("file", arg.uri);
                }
              } catch {
                console.warn("[fileApi:web] Could not fetch Blob from URI, fallback to raw");
                formData.append("file", arg.uri);
              }
            } else {
              formData.append("file", { uri: arg.uri, name: filename, type: mimeType } as any);
            }
          } else {
            return { error: { status: "CUSTOM_ERROR", error: "Invalid upload arguments provided: missing uri or FormData" } };
          }

          const response = await fetch(uploadUrl, {
            method: "POST",
            headers,
            body: formData,
          });
          const data = await response.json();

          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (error: any) {
          if (Platform.OS === "android") {
            console.error("[fileApi][ANDROID] Network exception during upload:", error?.message || "Upload failed");
          }
          return { error: { status: "FETCH_ERROR", error: error?.message || String(error) } };
        }
      },
      invalidatesTags: ["File"],
    }),
    uploadManyFiles: builder.mutation<ApiResponse<FileUploadResponse[]>, FormData | any>({
      queryFn: async (formData, { getState }) => {
        try {
          const state = getState() as any;
          const token = state?.auth?.token;
          const headers: Record<string, string> = {};
          if (token) {
            headers.authorization = `Bearer ${token}`;
          }
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/file/upload/many`, {
            method: "POST",
            headers,
            body: formData,
          });
          const data = await response.json();
          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (error: any) {
          return { error: { status: "FETCH_ERROR", error: error?.message || String(error) } };
        }
      },
      invalidatesTags: ["File"],
    }),
    deleteFile: builder.mutation<ApiResponse<{ ok: boolean }>, DeleteFileRequest>({
      query: (body) => ({
        url: "/file",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["File"],
    }),
  }),
  overrideExisting: true,
});

export const {
  useUploadFileMutation,
  useUploadManyFilesMutation,
  useDeleteFileMutation,
} = fileApi;
