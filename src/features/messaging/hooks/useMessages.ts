import { useMemo, useState } from "react";
import type { ChatMessage, ChatUser } from "../../../types/types";

const CURRENT_USER_ID = "u1";

const initialUsers: ChatUser[] = [
  {
    id: "u2",
    name: "Mia Thompson",
    status: "online",
    lastMessage: "I sent the new encryption keys.",
    avatarColor: "#5B8DEF",
  },
  {
    id: "u3",
    name: "Noah Patel",
    status: "offline",
    lastMessage: "We can review the notebook after lunch.",
    avatarColor: "#F47C7C",
  },
  {
    id: "u4",
    name: "Ava Carter",
    status: "online",
    lastMessage: "I updated the group chat design.",
    avatarColor: "#6FCF97",
  },
];

const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    senderId: "u2",
    receiverId: CURRENT_USER_ID,
    text: "Hi there! I just finished the new key exchange flow.",
    createdAt: "2026-05-05T09:20:00.000Z",
  },
  {
    id: "m2",
    senderId: CURRENT_USER_ID,
    receiverId: "u2",
    text: "Perfect, I will test it now and share feedback.",
    createdAt: "2026-05-05T09:22:00.000Z",
  },
  {
    id: "m3",
    senderId: "u3",
    receiverId: CURRENT_USER_ID,
    text: "Can we sync on the private group feature later?",
    createdAt: "2026-05-04T16:40:00.000Z",
  },
  {
    id: "m4",
    senderId: CURRENT_USER_ID,
    receiverId: "u4",
    text: "Your layout ideas look great. I like the muted gradients.",
    createdAt: "2026-05-05T08:15:00.000Z",
  },
];

export const useMessages = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedUserId, setSelectedUserId] = useState<string>(
    initialUsers[0].id,
  );
  const [isLoading] = useState(false);

  const selectedUser = useMemo(
    () => initialUsers.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId],
  );

  const users = useMemo(
    () =>
      initialUsers.map((user) => {
        const conversation = messages.filter(
          (message) =>
            (message.senderId === user.id &&
              message.receiverId === CURRENT_USER_ID) ||
            (message.senderId === CURRENT_USER_ID &&
              message.receiverId === user.id),
        );

        const lastMessage = conversation.length
          ? conversation[conversation.length - 1].text
          : user.lastMessage;

        return {
          ...user,
          lastMessage,
        };
      }),
    [messages],
  );

  const conversation = useMemo(
    () =>
      messages
        .filter(
          (message) =>
            (message.senderId === CURRENT_USER_ID &&
              message.receiverId === selectedUserId) ||
            (message.senderId === selectedUserId &&
              message.receiverId === CURRENT_USER_ID),
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [messages, selectedUserId],
  );

  const selectUser = (id: string) => {
    setSelectedUserId(id);
  };

  const sendMessage = (text: string) => {
    if (!selectedUserId || !text.trim()) return;

    const nextMessage: ChatMessage = {
      id: "m-" + Date.now(),
      senderId: CURRENT_USER_ID,
      receiverId: selectedUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, nextMessage]);
  };

  return {
    users,
    selectedUser,
    conversation,
    isLoading,
    selectUser,
    sendMessage,
  };
};
