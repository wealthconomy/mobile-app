export type GroupFrequency = "DAILY" | "WEEKLY" | "MONTHLY";
export type GroupAccessType = "PUBLIC" | "PRIVATE";
export type GroupMemberFilter = "ALL" | "OVERDUE" | "PENDING" | "PAID" | "INACTIVE" | "PAST" | "BLACKLIST";

export interface WealthGroupModel {
  id: string;
  name: string;
  category: string;
  description?: string;
  coverImage?: string;
  targetAmount: number | string;
  frequency: GroupFrequency;
  memberInterest?: boolean;
  startDate: string;
  endDate: string;
  membersLimit: number;
  accessType: GroupAccessType;
  penaltySetting?: string;
  allowEarlyExit?: boolean;
  allowEmergencyWithdrawal?: boolean;
  currentBalance?: string | number;
  totalSavings?: string | number;
  dailyWealthGrowth?: string | number;
  membersCount?: number;
  activeMembersCount?: number;
  creatorId?: string;
  isAdmin?: boolean;
  isMember?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateGroupRequest {
  name: string;
  category: string;
  description?: string;
  coverImage?: string;
  targetAmount: number;
  frequency: GroupFrequency;
  memberInterest: boolean;
  startDate: string;
  endDate: string;
  membersLimit: number;
  accessType: GroupAccessType;
  penaltySetting?: string;
  allowEarlyExit?: boolean;
  allowEmergencyWithdrawal?: boolean;
}

export interface UpdateGroupSettingsRequest {
  name?: string;
  category?: string;
  description?: string;
  coverImage?: string;
  targetAmount?: number;
  frequency?: GroupFrequency;
  memberInterest?: boolean;
  startDate?: string;
  endDate?: string;
  membersLimit?: number;
  accessType?: GroupAccessType;
  penaltySetting?: string;
  allowEarlyExit?: boolean;
  allowEmergencyWithdrawal?: boolean;
  nudgeFrequency?: string;
  reminderInterval?: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: "CREATOR" | "ADMIN" | "MEMBER" | "OWNER" | string;
  status:
    | "ACTIVE"
    | "PENDING"
    | "BLACKLISTED"
    | "BLACKLIST"
    | "EXITED"
    | "BANNED"
    | "PAID"
    | "UNPAID"
    | "OVERDUE"
    | "INACTIVE"
    | "PAST"
    | string;
  joinedAt: string;
  totalContributed?: string | number;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    email?: string;
    avatar?: string;
    profilePicture?: string;
  };
}

export interface GroupJoinRequest {
  id: string;
  groupId: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    email?: string;
  };
}

export interface GroupMemberStats {
  userId: string;
  totalContributed?: string | number;
  wealthGrowth?: string | number;
  growthPerWeek?: string | number;
  weeksProgress?: string;
  status?: string;
  joinedAt?: string;
  leftAt?: string | null;
}

export interface GroupChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
  };
}

export interface ContributeGroupRequest {
  amount: number;
}

export interface WithdrawGroupRequest {
  amount: number;
  reason?: string;
}
