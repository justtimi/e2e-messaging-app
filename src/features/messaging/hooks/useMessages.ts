import { useMemo, useState, useEffect } from "react";
import { useAuthContext } from "../../../auth/AuthContext";
import { getUsers } from "../../../api/auth";
import type { ChatMessage, ChatUser } from "../../../types/types";
import type { AuthUser } from "../../../api/auth";

const initialMessages: ChatMessage[] = [];

const getAvatarColor = (username: string): string => {
  const colors = [
    "#5B8DEF",
    "#F47C7C",
    "#6FCF97",
    "#F2C94C",
    "#9B51E0",
    "#56CCF2",
  ];
  const index =
    username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    colors.length;
  return colors[index];
};

const convertAuthUserToChatUser = (authUser: AuthUser): ChatUser => {
  return {
    id: authUser.id,
    name: authUser.display_name || authUser.username,
    status: "online" as const, // For now, assume all users are online
    lastMessage: "Start a conversation",
    avatarColor: getAvatarColor(authUser.username),
  };
};

export const useMessages = () => {
  const { user: currentUser, accessToken } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken || !currentUser) return;

      try {
        setIsLoading(true);
        const authUsers = await getUsers(accessToken);

        // Filter out current user and convert to ChatUser format
        const chatUsers = authUsers
          .filter((user) => user.id !== currentUser.id)
          .map((user) => convertAuthUserToChatUser(user));

        setUsers(chatUsers);

        // Select first user if available
        if (chatUsers.length > 0 && !selectedUserId) {
          setSelectedUserId(chatUsers[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [accessToken, currentUser]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const conversation = useMemo(
    () =>
      messages
        .filter(
          (message) =>
            (message.senderId === selectedUserId &&
              message.receiverId === currentUser?.id) ||
            (message.senderId === currentUser?.id &&
              message.receiverId === selectedUserId),
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [messages, selectedUserId, currentUser?.id],
  );

  const selectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const sendMessage = (text: string) => {
    if (!selectedUser || !currentUser) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);
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
