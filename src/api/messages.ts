const BASE_URL = "https://whisperbox.koyeb.app";

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  ciphertext: string;
  iv: string;
  encrypted_key: string;
  encrypted_key_for_self: string;
  created_at: string;
};

export const sendMessage = async (
  payload: {
    receiver_id: string;
    ciphertext: string;
    iv: string;
    encrypted_key: string;
    encrypted_key_for_self: string;
  },
  token: string,
) => {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to send message");

  return res.json();
};

export const getConversations = async (token: string) => {
  const res = await fetch(`${BASE_URL}/conversations`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch conversations");

  return res.json();
};

export const getConversationMessages = async (
  userId: string,
  token: string,
  before?: string,
) => {
  const url = new URL(
    `${BASE_URL}/conversations/${userId}/messages`,
  );

  if (before) url.searchParams.append("before", before);

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch messages");

  return res.json();
};
