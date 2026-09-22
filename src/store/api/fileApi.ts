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
            headers.authorization = `Bearer ${token}`;
            headers.Authorization = `Bearer ${token}`;
          }

          const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL}/file/upload`;
          console.log("\n================ [FILE UPLOAD - INITIATING REQUEST] ================");
          console.log("Upload URL:", uploadUrl);
          console.log("Platform:", Platform.OS);
          console.log("File Arg:", typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg));
          console.log("====================================================================\n");

          // If on native platform (iOS / Android) and we have a local file URI
          if (Platform.OS !== "web" && typeof arg?.uri === "string" && !arg.uri.startsWith("http")) {
            try {
              if (FileSystem && typeof FileSystem.uploadAsync === "function") {
                console.log("[FILE UPLOAD] Using native FileSystem.uploadAsync...");
                const uploadResult = await FileSystem.uploadAsync(uploadUrl, arg.uri, {
                  httpMethod: "POST",
                  uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                  fieldName: "file",
                  headers,
                });

                console.log("\n================ [FILE UPLOAD - NATIVE RESULT] ================");
                console.log("HTTP Status:", uploadResult.status);
                console.log("Raw Response Body:", uploadResult.body);
                console.log("==============================================================\n");

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
            } catch (nativeUploadErr) {
              console.log("Native FileSystem.uploadAsync failed, attempting FormData fallback:", nativeUploadErr);
            }
          }

          let formData: FormData;
          if (arg instanceof FormData || arg?._parts) {
            formData = arg;
          } else if (arg?.uri) {
            formData = new FormData();
            const filename = arg.name || arg.uri.split("/").pop() || "file.jpg";
            const match = /\.(\w+)$/.exec(filename);
            const mimeType = arg.type || (match ? `image/${match[1]}` : "image/jpeg");
            formData.append("file", { uri: arg.uri, name: filename, type: mimeType } as any);
          } else {
            return { error: { status: "CUSTOM_ERROR", error: "Invalid upload arguments provided: missing uri or FormData" } };
          }

          console.log("[FILE UPLOAD] Executing standard FormData fetch...");
          const response = await fetch(uploadUrl, {
            method: "POST",
            headers,
            body: formData,
          });
          const data = await response.json();
          console.log("\n================ [FILE UPLOAD - FETCH RESULT] ================");
          console.log("HTTP Status:", response.status);
          console.log("Response Body:", JSON.stringify(data, null, 2));
          console.log("=============================================================\n");
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
