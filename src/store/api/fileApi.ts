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
            const mimeType = arg.type || (match ? `image/${match[1]}` : "image/jpeg");
            formData.append("file", { uri: arg.uri, name: filename, type: mimeType } as any);
          } else {
            return { error: { status: "CUSTOM_ERROR", error: "Invalid upload arguments provided: missing uri or FormData" } };
          }

          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/file/upload`, {
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
      async onQueryStarted(arg, { queryFulfilled }) {
        const summary = arg?.uri ? `File URI: ${arg.uri} (${arg.name || "auto"})` : `FormData (${arg?._parts?.length || "parts"})`;
        console.log("\n================ [FILE UPLOAD DEBUG - API REQUEST] ================");
        console.log("URL: POST /file/upload");
        console.log("Payload:", summary);
        console.log("===================================================================\n");
        try {
          const { data } = await queryFulfilled;
          console.log("\n✅ [FILE UPLOAD DEBUG - API RESPONSE] POST /file/upload");
          console.log("Response:", JSON.stringify(data, null, 2));
          console.log("===================================================================\n");
        } catch (error) {
          console.log("\n❌ [FILE UPLOAD DEBUG - API ERROR] POST /file/upload");
          console.log("Error Response:", JSON.stringify(error, null, 2));
          console.log("===================================================================\n");
        }
      },
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
