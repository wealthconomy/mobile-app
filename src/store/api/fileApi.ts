import { Platform } from "react-native";
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
          const headers: Record<string, string> = {};
          if (token) {
            headers.authorization = `Bearer ${token}`;
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
            formData.append("file", { uri: arg.uri, name: filename, type: mimeType } as any);
          } else {
            return { error: { status: "CUSTOM_ERROR", error: "Invalid upload arguments provided: missing uri or FormData" } };
          }

          if (Platform.OS === "android") {
            console.log("[fileApi][ANDROID] Dispatching POST /file/upload. FormData parts:", (formData as any)?._parts || "FormData");
          }

          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/file/upload`, {
            method: "POST",
            headers,
            body: formData,
          });
          const data = await response.json();

          if (Platform.OS === "android") {
            console.log(`[fileApi][ANDROID] Response HTTP ${response.status}:`, data);
          }

          if (!response.ok) {
            return { error: { status: response.status, data } };
          }
          return { data };
        } catch (error: any) {
          if (Platform.OS === "android") {
            console.error("[fileApi][ANDROID] Network exception during upload:", error?.message || error);
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
