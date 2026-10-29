import { io, Socket } from "socket.io-client";
import {
  SocketSendMessagePayload,
  SocketSendMessageAck,
  SocketMarkReadPayload,
  SocketNewMessageEvent,
  SocketUnreadCountUpdateEvent,
  SocketUserStatusChangeEvent,
} from "@/src/types/support";

const getSocketUrl = (): string => {
  const explicitUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
  if (explicitUrl) return explicitUrl;

  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl) {
    return apiUrl.replace(/\/api\/v1\/?$/, "");
  }

  return "https://backend-5kr0.onrender.com";
};

class SocketService {
  private socket: Socket | null = null;
  private currentToken: string | null = null;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private isConnecting: boolean = false;

  /**
   * Connect to the Socket.IO gateway with the user's JWT token
   */
  public connect(token: string): Socket {
    if (this.socket && this.currentToken === token && this.socket.connected) {
      return this.socket;
    }

    if (this.socket) {
      this.disconnect();
    }

    this.currentToken = token;
    this.isConnecting = true;
    const socketUrl = getSocketUrl();

    this.socket = io(socketUrl, {
      auth: { token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1500,
      timeout: 10000,
    });

    this.socket.on("connect", () => {
      this.isConnecting = false;
      this.notifyConnectionState(true);
    });

    this.socket.on("disconnect", () => {
      this.isConnecting = false;
      this.notifyConnectionState(false);
    });

    this.socket.on("connect_error", (error: any) => {
      this.isConnecting = false;
      console.warn(`[SupportSocket] Connection error: ${error?.message || "Connection failed"}`);
      this.notifyConnectionState(false);
    });

    return this.socket;
  }

  /**
   * Disconnect the current socket session
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
    this.isConnecting = false;
    this.notifyConnectionState(false);
  }

  public isConnected(): boolean {
    return Boolean(this.socket?.connected);
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Send a support chat message via Socket.IO
   */
  public sendMessage(
    payload: SocketSendMessagePayload
  ): Promise<SocketSendMessageAck> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        console.warn("[SupportSocket] Cannot emit support:send_message - socket is not connected");
        resolve({ ok: false, error: "Socket is not connected" });
        return;
      }

      // Timeout safety fallback
      const timer = setTimeout(() => {
        console.warn("[SupportSocket] Timeout waiting for support:send_message ack");
        resolve({ ok: false, error: "Message send timeout" });
      }, 7000);

      this.socket.emit(
        "support:send_message",
        payload,
        (response: SocketSendMessageAck) => {
          clearTimeout(timer);
          resolve(response || { ok: true });
        }
      );
    });
  }

  /**
   * Mark messages as read by the client
   */
  public markAsRead(
    chatId: string,
    direction: "client" | "admin" = "client"
  ): Promise<{ ok: boolean }> {
    return new Promise((resolve) => {
      if (!this.socket || !this.socket.connected) {
        resolve({ ok: false });
        return;
      }

      const payload: SocketMarkReadPayload = { chatId, direction };
      this.socket.emit("chat:mark_as_read", payload, (response: { ok: boolean }) => {
        resolve(response || { ok: true });
      });
    });
  }

  /**
   * Listen for incoming new messages in real-time
   */
  public onNewMessage(
    callback: (data: SocketNewMessageEvent) => void
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on("support:new_message", callback);
    return () => {
      this.socket?.off("support:new_message", callback);
    };
  }

  /**
   * Listen for unread count updates
   */
  public onUnreadCountUpdate(
    callback: (data: SocketUnreadCountUpdateEvent) => void
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on("chat:unread_count_update", callback);
    return () => {
      this.socket?.off("chat:unread_count_update", callback);
    };
  }

  /**
   * Listen for support admin online/offline status changes
   */
  public onUserStatusChange(
    callback: (data: SocketUserStatusChangeEvent) => void
  ): () => void {
    if (!this.socket) return () => {};
    this.socket.on("user:status_change", callback);
    return () => {
      this.socket?.off("user:status_change", callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  public onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    callback(this.isConnected());
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  private notifyConnectionState(connected: boolean) {
    this.connectionListeners.forEach((listener) => {
      try {
        listener(connected);
      } catch {
        console.warn("Error in socket connection listener");
      }
    });
  }
}

export const socketService = new SocketService();
