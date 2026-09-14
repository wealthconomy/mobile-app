import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./useRedux";
import {
  hydrateBookmarks,
  toggleBookmarkLocal,
  removeBookmarkLocal,
  mergeServerBookmarks,
} from "../store/slices/bookmarkSlice";
import { useToggleBookmarkMutation } from "../store/api/blogApi";
import { Blog } from "../types/blog";

export function useBookmarks() {
  const dispatch = useAppDispatch();
  const { bookmarkedBlogs, bookmarkedIds, isHydrated } = useAppSelector(
    (state) => state.bookmark
  );

  const [toggleBookmarkApi] = useToggleBookmarkMutation();

  useEffect(() => {
    if (!isHydrated) {
      dispatch(hydrateBookmarks());
    }
  }, [dispatch, isHydrated]);

  const isBookmarked = useCallback(
    (id: string) => {
      if (!id) return false;
      return bookmarkedIds.includes(id);
    },
    [bookmarkedIds]
  );

  const toggleBookmark = useCallback(
    (blog: Blog) => {
      if (!blog || !blog.id) return;
      // Optimistic update local & async storage
      dispatch(toggleBookmarkLocal(blog));
      // Fire backend API
      toggleBookmarkApi(blog.id).catch((err) => {
        console.warn("Backend toggle bookmark sync warning:", err);
      });
    },
    [dispatch, toggleBookmarkApi]
  );

  const removeBookmark = useCallback(
    (id: string) => {
      if (!id) return;
      dispatch(removeBookmarkLocal(id));
      toggleBookmarkApi(id).catch((err) => {
        console.warn("Backend remove bookmark sync warning:", err);
      });
    },
    [dispatch, toggleBookmarkApi]
  );

  const syncServerBookmarks = useCallback(
    (serverBlogs: Blog[]) => {
      if (!serverBlogs || !Array.isArray(serverBlogs) || serverBlogs.length === 0) return;
      dispatch(mergeServerBookmarks(serverBlogs));
    },
    [dispatch]
  );

  return {
    bookmarkedBlogs,
    bookmarkedIds,
    isBookmarked,
    toggleBookmark,
    removeBookmark,
    syncServerBookmarks,
    isHydrated,
  };
}
