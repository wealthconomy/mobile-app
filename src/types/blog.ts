export interface Author {
  id: string;
  name: string;
  image: string;
}

export type Category =
  | "WealthFlex"
  | "WealthFix"
  | "WealthGoal"
  | "WealthAuto"
  | "WealthFam";

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
  views: number;
}
