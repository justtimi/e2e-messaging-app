export type AuthUser = {
  id: string;
  username: string;
  display_name: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
  created_at: string;
};

type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
};

const BASE_URL = "https://whisperbox.koyeb.app";

export const login = async (payload: {
  username: string;
  password: string;
}): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Login failed: ${res.status} ${res.statusText} - ${errorText}`,
    );
  }

  return res.json();
};
export const register = async (payload: {
  username: string;
  display_name: string;
  password: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
}): Promise<AuthResponse> => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend error:", errorText);
    throw new Error(errorText || "Registration failed");
  }

  return res.json();
};

export const getUsers = async (token: string): Promise<AuthUser[]> => {
  const res = await fetch(`${BASE_URL}/auth/users`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 404) {
      console.warn(
        "User listing endpoint not available. Falling back to manual contact management.",
      );
      return [];
    }
    throw new Error("Failed to fetch users");
  }

  return res.json();
};

export const getMe = async (token: string): Promise<AuthUser> => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user");
  }

  return res.json();
};
export const refreshToken = async (refresh_token: string) => {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    throw new Error("Token refresh failed");
  }

  return res.json();
};
export const logout = async (token: string, refresh_token: string) => {
  const res = await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh_token }),
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  return res.json();
};
