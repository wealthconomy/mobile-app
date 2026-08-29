import { LibraryMaterial } from "../../types/library";
import { ApiResponse, baseApi, PaginatedResponse } from "./baseApi";

export const libraryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLibraryMaterials: builder.query<ApiResponse<PaginatedResponse<LibraryMaterial[]>>, { publishToApp?: boolean; publishToWeb?: boolean } | void>({
      query: (params) => ({
        url: "/client/library",
        params: params || {},
      }),
      providesTags: ["Library"],
    }),

    recordDownload: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/client/library/${id}/download`,
        method: "POST",
      }),
      invalidatesTags: ["Library"],
    }),

    addLibraryComment: builder.mutation<ApiResponse<void>, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/client/library/${id}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: ["Library"],
    }),
  }),
});

export const {
  useGetLibraryMaterialsQuery,
  useRecordDownloadMutation,
  useAddLibraryCommentMutation,
} = libraryApi;
