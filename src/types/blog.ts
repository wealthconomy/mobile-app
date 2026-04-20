export interface Author {
  id: string;
  name: string;
  image: string;
}

export type Category =
  | "WealthFlex"
  | "WealthFix"
  | "WealthGoal"
  | "WealthFlow"
  | "WealthFam";

export interface BlogComment {
  id: string;
  author: Author;
  text: string;
  timePosted: string;
}

export interface Blog {
  id: string;
  title: string;
  description: string;
  content: string;
  image: string;
  author: Author;
  category: Category;
  timePosted: string;
  readingDuration: string;
  isBookmarked: boolean;
  isLiked: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  bookmarkCount: number;
  views: number;
  comments: BlogComment[];
}
