import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthContext } from "../../../auth/AuthContext";
import { getUsers } from "../../../api/auth";
import { sendMessage as sendEncryptedMessage } from "../../../api/messages";
import { getUserPublicKey, searchUsers } from "../../../api/users";
import { MessageService } from "../services/messagingService";
import { CryptoService } from "../../../crypto/e2ee/keyManagement";
import type { ChatMessage, ChatUser } from "../../../types/types";
import type { AuthUser } from "../../../api/auth";
import { EncodingService } from "../../../crypto/utils/encoding";
import {
  decryptReceivedMessage,
  prepareEncryptedMessage,
} from "../../../crypto/e2ee/messageCrypto";
import { WhisperSocket } from "../../../api/client";

type ContactWithKey = ChatUser & {
  public_key: string;
};

type SearchResultUser = ChatUser & {
  public_key?: string;
};

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
    status: "online" as const, 
    lastMessage: "Start a conversation",
    avatarColor: getAvatarColor(authUser.username),
  };
};

export const useMessages = () => {
  const { user: currentUser, accessToken, privateKey } = useAuthContext();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [customContacts, setCustomContacts] = useState<ContactWithKey[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResultUser[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<WhisperSocket | null>(null);

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
  }, [accessToken, currentUser, selectedUserId]);

  useEffect(() => {
    if (!accessToken || !currentUser || !privateKey) return;

    const socket = new WhisperSocket(accessToken, async (incoming) => {
      const isSender = incoming.sender_id === currentUser.id;

      const encryptedKey = isSender
        ? incoming.encrypted_key_for_self
        : incoming.encrypted_key;

      const keyBuffer = EncodingService.base64ToArrayBuffer(encryptedKey);

      const text = await decryptReceivedMessage(
        incoming.ciphertext,
        incoming.iv,
        keyBuffer,
        privateKey,
      );

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === incoming.id);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: incoming.id,
            senderId: incoming.sender_id,
            receiverId: incoming.receiver_id,
            text,
            createdAt: incoming.created_at,
          },
        ];
      });
    });

    socketRef.current = socket;
    socket.connect();

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, currentUser, privateKey]);

  const contactUsers = useMemo<ContactWithKey[]>(() => {
    const authContacts = authUsers
      .filter((user) => user.id !== currentUser?.id)
      .map((user) => ({
        id: user.id,
        name: user.display_name || user.username,
        status: "online" as const,
        lastMessage: "Start a conversation",
        avatarColor: getAvatarColor(user.username),
        public_key: user.public_key,
      }));

    return [...authContacts, ...customContacts];
  }, [authUsers, customContacts, currentUser]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!accessToken || !currentUser || trimmedQuery.length < 2) {
      const timeoutId = window.setTimeout(() => {
        setSearchResults([]);
        setIsSearchingUsers(false);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    let isCurrent = true;

    const timeoutId = window.setTimeout(async () => {
      setIsSearchingUsers(true);

      try {
        const results = await searchUsers(trimmedQuery, accessToken);

        if (!isCurrent) return;

        setSearchResults(
          results
            .filter((user) => user.id !== currentUser.id)
            .map((user) => {
              const existingContact = contactUsers.find(
                (contact) => contact.id === user.id,
              );

              return (
                existingContact ?? {
                  id: user.id,
                  name: user.display_name || user.username,
                  status: "online",
                  lastMessage: "Start a conversation",
                  avatarColor: getAvatarColor(user.username),
                }
              );
            }),
        );
      } catch (error) {
        console.error("Failed to search users:", error);
        if (isCurrent) setSearchResults([]);
      } finally {
        if (isCurrent) setIsSearchingUsers(false);
      }
    }, 300);

    return () => {
      isCurrent = false;
      window.clearTimeout(timeoutId);
    };
  }, [accessToken, contactUsers, currentUser, searchQuery]);

  const filteredUsers = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    if (!trimmedQuery) return contactUsers;

    const localMatches = contactUsers.filter((user) =>
      user.name.toLowerCase().includes(trimmedQuery),
    );
    const localIds = new Set(localMatches.map((user) => user.id));
    const remoteMatches = searchResults.filter(
      (user) => !localIds.has(user.id),
    );

    return [...localMatches, ...remoteMatches];
  }, [contactUsers, searchQuery, searchResults]);

  const selectableUsers = useMemo(
    () => [...contactUsers, ...searchResults],
    [contactUsers, searchResults],
  );

  const selectedUser = useMemo(
    () => selectableUsers.find((user) => user.id === selectedUserId) ?? null,
    [selectableUsers, selectedUserId],
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

  const selectUser = async (userId: string) => {
    const existingContact = contactUsers.find((user) => user.id === userId);
    if (existingContact) {
      setSelectedUserId(userId);
      return;
    }

    const searchedUser = searchResults.find((user) => user.id === userId);
    if (!searchedUser || !accessToken) return;

    try {
      const { public_key } = searchedUser.public_key
        ? { public_key: searchedUser.public_key }
        : await getUserPublicKey(userId, accessToken);

      setCustomContacts((prev) => {
        if (prev.some((item) => item.id === userId)) return prev;

        return [
          ...prev,
          {
            ...searchedUser,
            public_key,
          },
        ];
      });
    } catch (error) {
      console.error("Failed to prepare selected user:", error);
      return;
    }

    setSelectedUserId(userId);
  };

  const addContact = (contact: ContactWithKey) => {
    setCustomContacts((prev) => {
      if (prev.some((item) => item.id === contact.id)) return prev;
      return [...prev, contact];
    });
    setSelectedUserId(contact.id);
  };

  const loadMessages = useCallback(async () => {
    if (!accessToken || !currentUser || !privateKey || !selectedUserId) return;

    try {
      const decryptedMessages = await MessageService.loadAndDecryptMessages(
        selectedUserId,
        accessToken,
        privateKey,
        currentUser.id,
      );

      if (decryptedMessages.length > 0) {
        setMessages(
          decryptedMessages.map((msg) => ({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            text: msg.text,
            createdAt: msg.created_at,
          })),
        );
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, [accessToken, currentUser, privateKey, selectedUserId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadMessages]);

  const sendMessage = async (text: string) => {
    if (!selectedUser || !currentUser || !accessToken || !privateKey) return;

    const recipientKey = selectedUser.public_key;
    if (!recipientKey) {
      console.error("Recipient public key not available");
      return;
    }

    try {
      const senderPublicKey = await CryptoService.importPublicKey(
        currentUser.public_key,
      );
      const receiverPublicKey =
        await CryptoService.importPublicKey(recipientKey);

      const encrypted = await prepareEncryptedMessage(
        text,
        receiverPublicKey,
        senderPublicKey,
      );

      const payload = {
        receiver_id: selectedUser.id,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        encrypted_key: EncodingService.arrayBufferToBase64(
          encrypted.encryptedKey,
        ),
        encrypted_key_for_self: EncodingService.arrayBufferToBase64(
          encrypted.encryptedKeyForSelf,
        ),
      };

      const optimisticId = `m${Date.now()}`;

      setMessages((prev) => [
        ...prev,
        {
          id: optimisticId,
          senderId: currentUser.id,
          receiverId: selectedUser.id,
          text,
          createdAt: new Date().toISOString(),
        },
      ]);

      const savedMessage = await sendEncryptedMessage(payload, accessToken);

      setMessages((prev) =>
        prev.map((message) =>
          message.id === optimisticId
            ? {
                ...message,
                id: savedMessage.id ?? message.id,
                senderId: savedMessage.sender_id ?? message.senderId,
                receiverId: savedMessage.receiver_id ?? message.receiverId,
                createdAt: savedMessage.created_at ?? message.createdAt,
              }
            : message,
        ),
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return {
    users: filteredUsers,
    selectedUser,
    conversation,
    isLoading,
    isSearchingUsers,
    selectUser,
    addContact,
    sendMessage,
    searchQuery,
    setSearchQuery,
    loadMessages,
  };
};
