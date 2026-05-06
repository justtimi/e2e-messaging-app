import { useMemo, useState, useEffect } from "react";
import { useAuthContext } from "../../../auth/AuthContext";
import { getUsers } from "../../../api/auth";
import { MessageService } from "../services/messagingService";
import { CryptoService } from "../../../crypto/e2ee/keyManagement";
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
  const { user: currentUser, accessToken, privateKey } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      if (!accessToken || !currentUser) return;

      try {
        setIsLoading(true);
        const authUsers = await getUsers(accessToken);
        setAuthUsers(authUsers);

        const chatUsers = authUsers
          .filter((user) => user.id !== currentUser.id)
          .map((user) => convertAuthUserToChatUser(user));

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

  const users = useMemo(() => {
    return authUsers
      .filter((user) => user.id !== currentUser?.id)
      .map((user) => convertAuthUserToChatUser(user));
  }, [authUsers, currentUser]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [users, searchQuery]);

  const selectedUser = useMemo(
    () => filteredUsers.find((user) => user.id === selectedUserId) ?? null,
    [filteredUsers, selectedUserId],
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

  const loadMessages = async () => {
    if (!accessToken || !currentUser || !privateKey) return;
    setIsLoading(true);

    try {
      const decryptedMessages = await MessageService.loadAndDecryptMessages(
        currentUser.id,
        accessToken,
        privateKey,
      );

      setMessages(
        decryptedMessages.map((msg) => ({
          id: msg.id,
          senderId: msg.sender_id,
          receiverId: msg.receiver_id,
          text: msg.text,
          createdAt: msg.created_at,
        })),
      );
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [accessToken, currentUser, privateKey]);

  const sendMessage = async (text: string) => {
    if (!selectedUser || !currentUser || !accessToken || !privateKey) return;

    const recipientAuth = authUsers.find((user) => user.id === selectedUser.id);
    if (!recipientAuth) return;

    try {
      const senderPublicKey = await CryptoService.importPublicKey(
        currentUser.public_key,
      );
      const receiverPublicKey = await CryptoService.importPublicKey(
        recipientAuth.public_key,
      );

      await MessageService.send({
        text,
        receiverPublicKey,
        senderPublicKey,
        receiverId: selectedUser.id,
        token: accessToken,
      });

      const newMessage: ChatMessage = {
        id: `m${Date.now()}`,
        senderId: currentUser.id,
        receiverId: selectedUser.id,
        text,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    users: filteredUsers,
    selectedUser,
    conversation,
    isLoading,
    selectUser,
    sendMessage,
    searchQuery,
    setSearchQuery,
    loadMessages,
  };
};
