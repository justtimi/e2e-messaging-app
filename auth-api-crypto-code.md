# Auth, API, and Crypto Source Code

## src/auth/AuthContext.tsx

```tsx
import { createContext, useContext, useEffect, useState } from "react";
import { getMe, login as loginApi } from "../api/auth";
import { getPrivateKey, savePrivateKey } from "../db/keyStore";
import { KeyWrappingService } from "../crypto/utils/keyWrapping";
import { EncodingService } from "../crypto/utils/encoding";

type AuthUser = {
  id: string;
  username: string;
  display_name: string;
  public_key: string;
  wrapped_private_key: string;
  pbkdf2_salt: string;
};

type AuthContextType = {
  user: AuthUser | null;
  accessToken: string | null;
  cryptoReady: boolean;
  privateKey: CryptoKey | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  authLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const cryptoReady = !!privateKey;

  // 🧠 STEP 1: restore session on refresh
  const initializeAuth = async () => {
    setAuthLoading(true);
    const token = localStorage.getItem("access_token");

    if (!token) {
      setAuthLoading(false);
      return;
    }
    try {
      const me = await getMe(token);

      setUser(me);
      setAccessToken(token);

      const storedKey = await getPrivateKey(me.id);
      setPrivateKey(storedKey ?? null);
    } catch (err) {
      console.error("Auth init failed", err);
      logout();
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    const res = await loginApi({ username, password });

    const { user, access_token, refresh_token } = res;

    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    setUser(user);
    setAccessToken(access_token);

    // 🔐 check stored private key
    let storedPrivateKey = await getPrivateKey(user.id);

    if (!storedPrivateKey) {
      try {
        const saltBuffer = EncodingService.base64ToArrayBuffer(
          user.pbkdf2_salt,
        );

        const wrappedKeyBuffer = EncodingService.base64ToArrayBuffer(
          user.wrapped_private_key,
        );

        const wrappingKey = await KeyWrappingService.deriveWrappingKey(
          password,
          saltBuffer,
        );

        storedPrivateKey = await KeyWrappingService.unwrapPrivateKey(
          wrappedKeyBuffer,
          wrappingKey,
        );

        await savePrivateKey(user.id, storedPrivateKey);
      } catch (err) {
        console.error("Crypto init failed", err);

        setPrivateKey(null);
        setUser(null);
        setAccessToken(null);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        return;
      }
    }

    setPrivateKey(storedPrivateKey);
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    setUser(null);
    setAccessToken(null);
    setPrivateKey(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        cryptoReady,
        privateKey,
        login,
        authLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
};
```

## src/auth/ProtectedRoute.tsx

```tsx
const ProtectedRoute = () => {
  return <div>ProtectedRoute</div>;
};

export default ProtectedRoute;
```

## src/auth/useAuth.ts

```ts
// empty file
```

## src/api/auth.ts

```ts
import { savePrivateKey, getPrivateKey } from "../db/keyStore";
import { KeyWrappingService } from "../crypto/utils/keyWrapping";
import { EncodingService } from "../crypto/utils/encoding";

type AuthUser = {
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Login failed");
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Registration failed");
  }

  return res.json();
};

export const getMe = async (token: string): Promise<AuthUser> => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    method: "GET",
    headers: {
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
```

## src/api/client.ts

```ts
// empty file
```

## src/api/messages.ts

```ts
// empty file
```

## src/api/users.ts

```ts
// empty file
```

## src/crypto/e2ee/encryption.ts

```ts
import { EncodingService } from "../utils/encoding";

const encryptMessage = async (text: string, derivedKey: CryptoKey) => {
  const encodedText = EncodingService.textToArrayBuffer(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    derivedKey,
    encodedText,
  );

  const base64Ciphertext = EncodingService.arrayBufferToBase64(encryptedData);

  return JSON.stringify({
    iv: Array.from(iv),
    ciphertext: base64Ciphertext,
  });
};

const decryptMessage = async (messageJSON: string, derivedKey: CryptoKey) => {
  try {
    const message = JSON.parse(messageJSON);
    if (
      !message ||
      typeof message !== "object" ||
      !Array.isArray(message.iv) ||
      typeof message.ciphertext !== "string"
    ) {
      throw new Error("Invalid encrypted payload");
    }
    const iv = new Uint8Array(message.iv);
    const encryptedArray = EncodingService.base64ToArrayBuffer(
      message.ciphertext,
    );
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      derivedKey,
      encryptedArray,
    );
    return EncodingService.arrayBufferToText(decryptedData);
  } catch (error) {
    console.error("Decryption failed", error);
    throw error;
  }
};

const generateAESKey = async () => {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );
};

const encryptAESKey = async (aesKey: CryptoKey, publicKey: CryptoKey) => {
  const raw = await crypto.subtle.exportKey("raw", aesKey);

  return await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, raw);
};

const decryptAESKey = async (
  encryptedKey: ArrayBuffer,
  privateKey: CryptoKey,
) => {
  const raw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKey,
  );

  return await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
};

export const EncryptionService = {
  encryptMessage,
  decryptMessage,
  generateAESKey,
  encryptAESKey,
  decryptAESKey,
};
```

## src/crypto/e2ee/keyManagement.ts

```ts
import { EncodingService } from "../utils/encoding";

const exportPublicKey = async (keyPair: CryptoKeyPair) => {
  const raw = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
  return EncodingService.arrayBufferToBase64(raw);
};

const exportPrivateKey = async (keyPair: CryptoKeyPair) => {
  const raw = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  return EncodingService.arrayBufferToBase64(raw);
};

const generateKeyPair = async () => {
  return await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
};

const importPublicKey = async (base64Key: string) => {
  const keyBuffer = EncodingService.base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    "spki",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"],
  );
};
const importPrivateKey = async (base64Key: string) => {
  const keyBuffer = EncodingService.base64ToArrayBuffer(base64Key);
  return await window.crypto.subtle.importKey(
    "pkcs8",
    keyBuffer,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"],
  );
};

export const CryptoService = {
  generateKeyPair,
  importPublicKey,
  importPrivateKey,
  exportPublicKey,
  exportPrivateKey,
};
```

## src/crypto/e2ee/messageCrypto.ts

```ts
import { EncryptionService } from "./encryption";

export const prepareEncryptedMessage = async (
  text: string,
  recipientPublicKey: CryptoKey,
  senderPublicKey: CryptoKey,
) => {
  const aesKey = await EncryptionService.generateAESKey();
  const encryptedMessage = await EncryptionService.encryptMessage(text, aesKey);
  const encryptedKey = await EncryptionService.encryptAESKey(
    aesKey,
    recipientPublicKey,
  );

  const encryptedKeyForSelf = await EncryptionService.encryptAESKey(
    aesKey,
    senderPublicKey,
  );

  const parsedMessage = JSON.parse(encryptedMessage);

  return {
    ...parsedMessage,
    encryptedKey,
    encryptedKeyForSelf,
  };
};

export const decryptReceivedMessage = async (
  messageJSON: string,
  encryptedKey: ArrayBuffer,
  receiverPrivateKey: CryptoKey,
) => {
  const aesKey = await EncryptionService.decryptAESKey(
    encryptedKey,
    receiverPrivateKey,
  );

  return await EncryptionService.decryptMessage(messageJSON, aesKey);
};
```

## src/crypto/utils/constants.ts

```ts
export const AES_IV_LENGTH = 12;
export const ECDH_CURVE = "P-256";
export const AES_ALGORITHM = "AES-GCM";
```

## src/crypto/utils/encoding.ts

```ts
const textToArrayBuffer = (text: string): Uint8Array<ArrayBuffer> => {
  return new TextEncoder().encode(text);
};

const arrayBufferToText = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Uint8Array(bytes).buffer;
};

export const EncodingService = {
  base64ToArrayBuffer,
  arrayBufferToBase64,
  arrayBufferToText,
  textToArrayBuffer,
};
```

## src/crypto/utils/keyWrapping.ts

```ts
const deriveWrappingKey = async (password: string, salt: ArrayBuffer) => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-KW", length: 256 },
    false,
    ["unwrapKey"],
  );
};

const unwrapPrivateKey = async (
  wrappedKey: ArrayBuffer,
  wrappingKey: CryptoKey,
) => {
  return await crypto.subtle.unwrapKey(
    "pkcs8",
    wrappedKey,
    wrappingKey,
    { name: "AES-KW" },
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"],
  );
};

export const KeyWrappingService = {
  deriveWrappingKey,
  unwrapPrivateKey,
};
```
import {
  prepareEncryptedMessage,
  decryptReceivedMessage,
} from "../../../crypto/e2ee/messageCrypto";
import { sendMessage, getMessages } from "../../../api/messages";
import { EncodingService } from "../../../crypto/utils/encoding";

type MessageDTO = {
  id: string;
  sender_id: string;
  receiver_id: string;
  ciphertext: string;
  encrypted_key: string;
  encrypted_key_for_self: string;
  created_at: string;
};

export const MessageService = {
  async send({
    text,
    receiverPublicKey,
    senderPublicKey,
    receiverId,
    token,
  }: {
    text: string;
    receiverPublicKey: CryptoKey;
    senderPublicKey: CryptoKey;
    receiverId: string;
    token: string;
  }) {
    const encrypted = await prepareEncryptedMessage(
      text,
      receiverPublicKey,
      senderPublicKey,
    );

    return sendMessage(
      {
        receiver_id: receiverId,
        ciphertext: encrypted.ciphertext,
        encrypted_key: EncodingService.arrayBufferToBase64(
          encrypted.encryptedKey,
        ),
        encrypted_key_for_self: EncodingService.arrayBufferToBase64(
          encrypted.encryptedKeyForSelf,
        ),
      },
      token,
    );
  },

  async loadAndDecryptMessages(
    userId: string,
    token: string,
    privateKey: CryptoKey,
  ): Promise<(MessageDTO & { text: string })[]> {
    const messages = await getMessages(token);

    const decrypted = await Promise.all(
      messages.map(async (msg) => {
        const isSender = msg.sender_id === userId;
        const encryptedKeyBuffer = EncodingService.base64ToArrayBuffer(
          isSender ? msg.encrypted_key_for_self : msg.encrypted_key,
        );

        const text = await decryptReceivedMessage(
          msg.ciphertext,
          encryptedKeyBuffer,
          privateKey,
        );

        return {
          ...msg,
          text,
        };
      }),
    );

    return decrypted;
  },
};
