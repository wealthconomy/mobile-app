export interface UserActivity {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
