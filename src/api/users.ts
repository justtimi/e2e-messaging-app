import { API_BASE_URL } from "./config";

export type PublicKeyResponse = {
  public_key: string;
};

export type SearchUser = {
  id: string;
  username: string;
  display_name: string;
};

export const searchUsers = async (
  query: string,
  token: string,
): Promise<SearchUser[]> => {
  const res = await fetch(
    `${API_BASE_URL}/users/search?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!res.ok) throw new Error("Failed to search users");

  return res.json();
};

export const getUserPublicKey = async (
  userId: string,
  token: string,
): Promise<PublicKeyResponse> => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/public-key`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch public key");

  return res.json();
};
