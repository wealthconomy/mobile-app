import { Blog, Category } from "../types/blog";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const MOCK_AUTHORS = {
  ayo: {
    id: "1",
    name: "Ayo Ogunseinde",
    image: "https://i.pravatar.cc/150?u=ayo",
  },
  sarah: {
    id: "2",
    name: "Sarah Jenkins",
    image: "https://i.pravatar.cc/150?u=sarah",
  },
};

const MOCK_BLOGS: Blog[] = [
  {
    id: "1",
    title: "Emergency Funds 101",
    description: "Why your Wealth Flex account is your best friend.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque.\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque.",
    image: "https://picsum.photos/seed/1/800/600",
    author: MOCK_AUTHORS.ayo,
    category: "WealthFlex",
    timePosted: "7 hours ago",
    readingDuration: "4 mins reading",
    isBookmarked: false,
    isLiked: false,
    likesCount: 124,
    commentsCount: 124,
    sharesCount: 347,
    bookmarkCount: 6,
    views: 1200,
    comments: [
      {
        id: "101",
        author: MOCK_AUTHORS.ayo,
        text: "This is so helpful! I definitely need to start an emergency fund.",
        timePosted: "2 hours ago",
      },
      {
        id: "102",
        author: MOCK_AUTHORS.sarah,
        text: "Great advice. WealthFlex is really convenient.",
        timePosted: "1 hour ago",
      },
    ],
  },
  {
    id: "2",
    title: "Automation Secrets",
    description: "How to build wealth while you sleep.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque.",
    image: "https://picsum.photos/seed/2/800/600",
    author: MOCK_AUTHORS.ayo,
    category: "WealthFam",
    timePosted: "7 hours ago",
    readingDuration: "4 mins reading",
    isBookmarked: true,
    isLiked: true,
    likesCount: 85,
    commentsCount: 42,
    sharesCount: 120,
    bookmarkCount: 6,
    views: 850,
    comments: [],
  },
  {
    id: "3",
    title: "Investment Basics",
    description: "Start growing your wealth today.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque.",
    image: "https://picsum.photos/seed/3/800/600",
    author: MOCK_AUTHORS.sarah,
    category: "WealthGoal",
    timePosted: "1 day ago",
    readingDuration: "6 mins reading",
    isBookmarked: false,
    isLiked: false,
    likesCount: 230,
    commentsCount: 15,
    sharesCount: 56,
    bookmarkCount: 6,
    views: 2300,
    comments: [],
  },
  {
    id: "4",
    title: "Financial Planning",
    description: "Getting it right from the start.",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut duis lorem facilisi enim, quis a neque.",
    image: "https://picsum.photos/seed/4/800/600",
    author: MOCK_AUTHORS.ayo,
    category: "WealthFix",
    timePosted: "2 days ago",
    readingDuration: "5 mins reading",
    isBookmarked: false,
    isLiked: false,
    likesCount: 45,
    commentsCount: 8,
    sharesCount: 12,
    bookmarkCount: 6,
    views: 450,
    comments: [],
  },
  {
    id: "5",
    title: "Saving for the Future",
    description: "Small steps today lead to big gains.",
    content: "Content for savings blog...",
    image: "https://picsum.photos/seed/5/800/600",
    author: MOCK_AUTHORS.sarah,
    category: "WealthAuto",
    timePosted: "3 days ago",
    readingDuration: "3 mins reading",
    isBookmarked: false,
    isLiked: true,
    likesCount: 78,
    commentsCount: 20,
    sharesCount: 34,
    bookmarkCount: 6,
    views: 600,
    comments: [],
  },
];

export const blogService = {
  getBlogs: async (filter?: string, category?: Category): Promise<Blog[]> => {
    await delay(1000); // Simulate network lag
    let blogs = [...MOCK_BLOGS];

    if (filter === "Popular") {
      blogs.sort((a, b) => b.views - a.views);
    } else if (filter === "Trending") {
      // Small randomized re-order for Trending
      blogs = blogs.slice().reverse();
    }

    if (category) {
      blogs = blogs.filter((b) => b.category === category);
    }

    return blogs;
  },

  getBlogById: async (id: string): Promise<Blog | undefined> => {
    await delay(500);
    return MOCK_BLOGS.find((b) => b.id === id);
  },

  getBookmarkedBlogs: async (): Promise<Blog[]> => {
    await delay(800);
    return MOCK_BLOGS.filter((b) => b.isBookmarked);
  },

  toggleBookmark: async (id: string): Promise<boolean> => {
    const blog = MOCK_BLOGS.find((b) => b.id === id);
    if (blog) {
      blog.isBookmarked = !blog.isBookmarked;
      blog.bookmarkCount += blog.isBookmarked ? 1 : -1;
      return blog.isBookmarked;
    }
    return false;
  },

  toggleLike: async (id: string): Promise<boolean> => {
    const blog = MOCK_BLOGS.find((b) => b.id === id);
    if (blog) {
      blog.isLiked = !blog.isLiked;
      blog.likesCount += blog.isLiked ? 1 : -1;
      return blog.isLiked;
    }
    return false;
  },

  addComment: async (id: string, text: string): Promise<boolean> => {
    const blog = MOCK_BLOGS.find((b) => b.id === id);
    if (blog) {
      const newComment = {
        id: Math.random().toString(36).substr(2, 9),
        author: MOCK_AUTHORS.ayo, // Simulation: assume current user is Ayo
        text,
        timePosted: "Just now",
      };
      blog.comments = [newComment, ...blog.comments];
      blog.commentsCount = blog.comments.length;
      return true;
    }
    return false;
  },
};
