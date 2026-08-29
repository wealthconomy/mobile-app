export interface BlogComment {
  id: string;
  userId?: string;
  userName?: string;
  userImage?: string;
  content?: string;
  text?: string;
  timePosted?: string;
  timeAgo?: string;
}

export type Category = string;

export interface Blog {
  id: string;
  title: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  authorAvatar: string;
  content: string;
  category: Category;
  categoryColor: string;
  image: string;
  status: string;
  timeAgo: string;
  bookmarks: number;
  views: number;
  publishToApp: boolean;
  publishToWeb: boolean;
  createdAt: string;
  updatedAt: string;

  // Optional fields (populated in detailed views or not supported by API yet)
  likesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
  readingDuration?: string;
  description?: string;
  comments?: BlogComment[];
}
