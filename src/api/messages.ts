const BASE_URL = "https://whisperbox.koyeb.app";

export type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  ciphertext: string;
  encrypted_key: string;
  encrypted_key_for_self: string;
  created_at: string;
};

export const sendMessage = async (
  payload: {
    receiver_id: string;
    ciphertext: string;
    encrypted_key: string;
    encrypted_key_for_self: string;
  },
  token: string,
) => {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to send message");

  return res.json();
};

export const getMessages = async (token: string): Promise<Message[]> => {
  const res = await fetch(`${BASE_URL}/messages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 405) {
      console.warn(
        "Message list endpoint does not support GET, falling back to local history.",
      );
      return [];
    }
    throw new Error("Failed to fetch messages");
  }

  return res.json();
};
