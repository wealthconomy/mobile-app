export interface WealthGoal {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  saved: string;
  progress: number;
  daysLeft: number;
  endDate: string;
  hasUpdate?: boolean;
  isCompleted?: boolean;
  automationFrequency: "Daily" | "Weekly" | "Monthly" | "Manual" | "One-time";
  source: string;
}

// In-memory storage to bypass AsyncStorage native module issues during UI building
let memoryGoals: WealthGoal[] = [];

export const goalService = {
  /**
   * Save a new goal to memory.
   */
  saveGoal: async (goal: WealthGoal): Promise<void> => {
    try {
      memoryGoals = [goal, ...memoryGoals];
    } catch (error) {
      console.error("Error saving goal:", error);
      throw error;
    }
  },

  /**
   * Retrieve all goals from memory.
   */
  getGoals: async (): Promise<WealthGoal[]> => {
    try {
      return memoryGoals;
    } catch (error) {
      console.error("Error getting goals:", error);
      return [];
    }
  },

  /**
   * Update an existing goal in memory.
   */
  updateGoal: async (
    id: string,
    updates: Partial<WealthGoal>,
  ): Promise<void> => {
    try {
      memoryGoals = memoryGoals.map((g) =>
        g.id === id ? { ...g, ...updates } : g,
      );
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  },

  /**
   * Clear all goals from memory.
   */
  clearGoals: async (): Promise<void> => {
    memoryGoals = [];
  },
};
