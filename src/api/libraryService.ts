import { LibraryMaterial } from "../types/library";

const MOCK_LIBRARY_MATERIALS: LibraryMaterial[] = [
  {
    id: "1",
    contentType: "document",
    title: "The Ultimate Guide",
    description: "A comprehensive guide on managing personal finances and building long-term flexibility.",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80",
    author: {
      name: "John Doe",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    timePosted: "2 days ago",
    readingDuration: "45 min read",
    documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "PDF",
    fileSize: "2.4 MB",
    isDownloadable: true,
    likesCount: 124,
    downloadsCount: 856,
    commentsCount: 12,
    comments: [
      {
        id: "c1",
        userId: "u1",
        userName: "Sarah Jenkins",
        userImage: "https://randomuser.me/api/portraits/women/12.jpg",
        text: "This guide was incredibly helpful for structuring my portfolio! Highly recommended for beginners.",
        timePosted: "2 hours ago",
      },
      {
        id: "c2",
        userId: "u2",
        userName: "Michael Chen",
        userImage: "https://randomuser.me/api/portraits/men/22.jpg",
        text: "I read through the first 3 chapters. The concepts are solid but I wish there were more practical examples.",
        timePosted: "5 hours ago",
      },
      {
        id: "c3",
        userId: "u3",
        userName: "Amanda Ross",
        userImage: "https://randomuser.me/api/portraits/women/33.jpg",
        text: "Can someone explain the section on tax efficiency? I got a bit lost there.",
        timePosted: "1 day ago",
      },
    ],
  },
  {
    id: "2",
    contentType: "document",
    title: "Financial Literacy",
    description: "Learn the fundamentals of financial literacy to make smarter money decisions every day.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80",
    author: {
      name: "Jane Smith",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    timePosted: "1 week ago",
    readingDuration: "30 min read",
    documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "PDF",
    fileSize: "1.8 MB",
    isDownloadable: false,
    likesCount: 89,
    commentsCount: 5,
  },
  {
    id: "3",
    contentType: "document",
    title: "Making it BIG",
    description: "Actionable strategies for setting and achieving massive financial goals.",
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?auto=format&fit=crop&w=400&q=80",
    author: {
      name: "Alice Johnson",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    timePosted: "3 days ago",
    readingDuration: "1 hr read",
    documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "PDF",
    fileSize: "3.2 MB",
    isDownloadable: true,
    likesCount: 256,
    downloadsCount: 1240,
    commentsCount: 45,
  },
  {
    id: "4",
    contentType: "document",
    title: "Building Generational Wealth",
    description: "How to structure your investments and assets to benefit your family for generations to come.",
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=400&q=80",
    author: {
      name: "Michael Brown",
      image: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    timePosted: "5 days ago",
    readingDuration: "25 min read",
    documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "PDF",
    fileSize: "1.5 MB",
    isDownloadable: false,
    likesCount: 42,
    commentsCount: 3,
  },
  {
    id: "5",
    contentType: "document",
    title: "Mastering Stock",
    description: "Advanced techniques and fundamental analysis for navigating the stock market effectively.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80",
    author: { name: "Admin", image: "" },
    timePosted: "2 weeks ago",
    readingDuration: "45 min read",
    documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "PDF",
    fileSize: "4.1 MB",
    isDownloadable: true,
    likesCount: 512,
    downloadsCount: 3251,
    commentsCount: 88,
  },
  {
    id: "6",
    contentType: "document",
    title: "Real Estate for Beginners",
    description: "A beginner-friendly introduction to purchasing and managing profitable real estate properties.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80",
    author: { name: "Admin", image: "" },
    timePosted: "1 month ago",
    readingDuration: "1.5 hr read",
    documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    fileType: "PDF",
    fileSize: "5.5 MB",
    isDownloadable: false,
    likesCount: 18,
    commentsCount: 0,
  },
  // --- VIDEO ENTRIES ---
  {
    id: "7",
    contentType: "video",
    title: "How Money Works – Full Documentary",
    description: "A detailed breakdown of how the global financial system works, from central banks to everyday spending.",
    image: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&w=400&q=80",
    author: { name: "Admin", image: "" },
    timePosted: "3 days ago",
    readingDuration: "26 min watch",
    isDownloadable: false,
    youtubeUrl: "https://www.youtube.com/watch?v=PHe0bXAIuk0",
    likesCount: 874,
    commentsCount: 63,
  },
  {
    id: "8",
    contentType: "video",
    title: "Investing Basics – Warren Buffett Explains",
    description: "Warren Buffett simplifies investing for everyday people. A must-watch for anyone starting their wealth journey.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80",
    author: { name: "Admin", image: "" },
    timePosted: "1 week ago",
    readingDuration: "18 min watch",
    isDownloadable: false,
    youtubeUrl: "https://www.youtube.com/watch?v=oRcIKpLDl0M",
    likesCount: 1204,
    commentsCount: 97,
  },
];

export const libraryService = {
  getMaterials: async (
    tab?: string,
  ): Promise<LibraryMaterial[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    let results = [...MOCK_LIBRARY_MATERIALS];

    if (tab === "Popular") {
      // Return a subset to simulate different tabs
      results = results.slice(0, 2);
    } else if (tab === "Trending") {
      results = results.slice(1, 3);
    }

    return results;
  },

  getMaterialById: async (id: string): Promise<LibraryMaterial | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate delay
    return MOCK_LIBRARY_MATERIALS.find((m) => m.id === id);
  },
};
