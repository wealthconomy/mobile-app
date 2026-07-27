import { Blog } from "../../types/blog";
import { ApiResponse, baseApi } from "./baseApi";

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlogs: builder.query<ApiResponse<Blog[]>, { publishToApp?: boolean; publishToWeb?: boolean } | void>({
      query: (params) => ({
        url: "/client/blogs",
        params: params || {},
      }),
      providesTags: ["Blog"],
    }),

    getBookmarkedBlogs: builder.query<ApiResponse<Blog[]>, void>({
      query: () => ({
        url: "/client/blogs/bookmarks",
      }),
      providesTags: ["Blog"],
    }),

    getBlogById: builder.query<ApiResponse<Blog>, string>({
      query: (id) => ({
        url: `/client/blogs/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Blog", id }],
    }),

    toggleLike: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/client/blogs/${id}/like`,
        method: "POST",
      }),
    }),

    toggleBookmark: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/client/blogs/${id}/bookmark`,
        method: "POST",
      }),
    }),

    addComment: builder.mutation<ApiResponse<void>, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: `/client/blogs/${id}/comments`,
        method: "POST",
        body: { content },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Blog", id }, "Blog"],
    }),
  }),
});

export const {
  useGetBlogsQuery,
  useGetBookmarkedBlogsQuery,
  useGetBlogByIdQuery,
  useToggleLikeMutation,
  useToggleBookmarkMutation,
  useAddCommentMutation,
} = blogApi;
