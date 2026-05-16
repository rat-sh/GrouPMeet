export interface User {
  _id: string;
  name?: string; // Legacy
  displayName?: string;
  username?: string;
  email: string;
  avatar: string;
  phoneNumber?: string;
  allowPhoneDiscovery?: boolean;
}

export interface MessageSender {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: MessageSender | string;
  text?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChatLastMessage {
  _id: string;
  text?: string;
  sender: string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  participant?: MessageSender; // Optional for groups
  lastMessage: ChatLastMessage | null;
  lastMessageAt: string;
  createdAt: string;
  isGroup?: boolean;
  name?: string;
  avatar?: string;
  admins?: string[];
  participants?: string[];
  mode?: "personal" | "education" | "professional";
}
