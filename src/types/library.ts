export interface LibraryComment {
  id: string;
  userId: string;
  userName: string;
  userImage?: string;
  content?: string;
  text?: string;
  timePosted?: string;
  timeAgo?: string;
}

export interface LibraryMaterial {
  id: string;
  contentType: "document" | "video"; // Distinguishes PDF/doc from YouTube videos
  title: string;
  description: string;
  image: string;
  author: string;
  authorAvatar?: string;
  timePosted?: string;
  timeAgo?: string;
  readingDuration?: string; // For videos this will be the video duration e.g. "12 min watch"
  // Document-specific fields (optional for video type)
  documentUrl?: string;
  fileType?: "PDF" | "DOC" | "XLS" | "EPUB";
  fileSize?: string;
  isDownloadable: boolean;
  // Video-specific fields (optional for document type)
  youtubeUrl?: string;
  likesCount: number;
  downloadsCount?: number;
  commentsCount: number;
  comments?: LibraryComment[];
}
