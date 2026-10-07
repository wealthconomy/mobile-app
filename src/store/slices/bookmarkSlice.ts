import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Blog } from "../../types/blog";

const STORAGE_KEY = "@wealthconomy_bookmarked_blogs";

interface BookmarkState {
  bookmarkedBlogs: Blog[];
  bookmarkedIds: string[];
  isHydrated: boolean;
}

const initialState: BookmarkState = {
  bookmarkedBlogs: [],
  bookmarkedIds: [],
  isHydrated: false,
};

export const hydrateBookmarks = createAsyncThunk(
  "bookmark/hydrateBookmarks",
  async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const blogs: Blog[] = JSON.parse(stored);
        if (Array.isArray(blogs)) {
          return blogs;
        }
      }
    } catch (err) {
      console.error("Failed to hydrate bookmarks from AsyncStorage:", err);
    }
    return [];
  }
);

const persistBookmarks = (blogs: Blog[]) => {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(blogs)).catch((err) =>
    console.error("Failed to persist bookmarks to AsyncStorage:", err)
  );
};

export const bookmarkSlice = createSlice({
  name: "bookmark",
  initialState,
  reducers: {
    setBookmarks: (state, action: PayloadAction<Blog[]>) => {
      state.bookmarkedBlogs = action.payload;
      state.bookmarkedIds = action.payload.map((b) => b.id);
      persistBookmarks(state.bookmarkedBlogs);
    },
    toggleBookmarkLocal: (state, action: PayloadAction<Blog>) => {
      const blog = action.payload;
      const index = state.bookmarkedIds.indexOf(blog.id);
      if (index > -1) {
        // Remove
        state.bookmarkedBlogs.splice(index, 1);
        state.bookmarkedIds.splice(index, 1);
      } else {
        // Add
        const newBlog: Blog = {
          ...blog,
          isBookmarked: true,
        };
        state.bookmarkedBlogs.unshift(newBlog);
        state.bookmarkedIds.unshift(blog.id);
      }
      persistBookmarks(state.bookmarkedBlogs);
    },
    removeBookmarkLocal: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.bookmarkedBlogs = state.bookmarkedBlogs.filter((b) => b.id !== id);
      state.bookmarkedIds = state.bookmarkedIds.filter((bId) => bId !== id);
      persistBookmarks(state.bookmarkedBlogs);
    },
    mergeServerBookmarks: (state, action: PayloadAction<Blog[]>) => {
      const serverBlogs = action.payload;
      const existingIds = new Set(state.bookmarkedIds);
      let changed = false;

      serverBlogs.forEach((sBlog) => {
        if (!existingIds.has(sBlog.id)) {
          existingIds.add(sBlog.id);
          state.bookmarkedBlogs.push({
            ...sBlog,
            isBookmarked: true,
          });
          state.bookmarkedIds.push(sBlog.id);
          changed = true;
        }
      });

      if (changed) {
        persistBookmarks(state.bookmarkedBlogs);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateBookmarks.fulfilled, (state, action) => {
      if (action.payload && action.payload.length > 0) {
        // If we loaded stored blogs, merge with any existing state
        const loadedBlogs = action.payload;
        const currentIds = new Set(state.bookmarkedIds);
        
        loadedBlogs.forEach((b) => {
          if (!currentIds.has(b.id)) {
            state.bookmarkedBlogs.push(b);
            state.bookmarkedIds.push(b.id);
            currentIds.add(b.id);
          }
        });
      }
      state.isHydrated = true;
    });
  },
});

export const {
  setBookmarks,
  toggleBookmarkLocal,
  removeBookmarkLocal,
  mergeServerBookmarks,
} = bookmarkSlice.actions;

export default bookmarkSlice.reducer;
