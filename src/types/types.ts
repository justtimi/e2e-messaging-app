export type ChatUser = {
  id: string;
  name: string;
  status: "online" | "offline";
  lastMessage: string;
  avatarColor: string;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
};
