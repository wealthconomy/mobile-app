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
    views: 1200,
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
    views: 850,
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
    views: 2300,
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
    views: 450,
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
    views: 600,
  },
    {
    id: "6",
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
    views: 1200,
  },
  {
    id: "7",
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
    views: 850,
  },
  {
    id: "8",
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
    views: 2300,
  },
  {
    id: "9",
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
    views: 450,
  },
  {
    id: "10",
    title: "Saving for the Future",
    description: "Small steps today lead to big gains.",
    content: "Content for savings blog...",
    image: "https://picsum.photos/seed/5/800/600",
    author: MOCK_AUTHORS.sarah,
    category: "WealthAuto",
    timePosted: "3 days ago",
    readingDuration: "3 mins reading",
    isBookmarked: false,
    views: 600,
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
      return blog.isBookmarked;
    }
    return false;
  },
};
