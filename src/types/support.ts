export type ChatStage = "queue" | "active" | "resolved";

export interface SupportMessage {
  id: string;
  chatId: string;
  senderName: string;
  text: string;
  time: string; // ISO 8601 string or timestamp
  createdAt?: string;
  created_at?: string;
  timestamp?: string | number;
  isMe: boolean;
  isRead?: boolean;
  readAt?: string | null;
  senderRole?: string;
  sender?: string;
  role?: string;
  isAdmin?: boolean;
  attachmentUrl?: string | null;
  fileType?: "image" | "pdf" | "document" | string | null;
  fileName?: string | null;
  isFailed?: boolean;
}

export interface SupportChat {
  id: string;
  userId: string | Record<string, unknown>;
  userName: string;
  userRole?: string | Record<string, unknown>;
  avatarUrl?: string | null | Record<string, unknown>;
  status: "online" | "offline" | string;
  stage: ChatStage | string;
  isAdmin: boolean;
  lastMessage?: string | null | Record<string, unknown>;
  lastMessageTime?: string | null | Record<string, unknown>;
  adminUnreadCount?: number;
  clientUnreadCount?: number;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
}

export interface SendMessagePayload {
  text?: string;
  attachmentUrl?: string;
  fileType?: "image" | "pdf" | "document" | string;
  fileName?: string;
}

export interface SocketSendMessagePayload {
  chatId: string;
  text?: string;
  attachmentUrl?: string;
  fileType?: "image" | "pdf" | "document" | string;
  fileName?: string;
}

export interface SocketSendMessageAck {
  ok: boolean;
  messageId?: string;
  error?: string;
}

export interface SocketMarkReadPayload {
  chatId: string;
  direction: "admin" | "client";
}

export interface SocketNewMessageEvent {
  message: SupportMessage;
  chatId: string;
}

export interface SocketUnreadCountUpdateEvent {
  totalInternalUnread: number;
  totalSupportUnread: number;
}

export interface SocketUserStatusChangeEvent {
  adminId?: string;
  userId?: string;
  name?: string;
  status: "online" | "offline";
}
