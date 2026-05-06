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
        console.log("🔐 Unwrapping private key for user:", user.username);
        console.log("Salt from backend:", user.pbkdf2_salt);
        console.log("Wrapped key from backend:", user.wrapped_private_key);

        const saltBuffer = EncodingService.base64ToArrayBuffer(
          user.pbkdf2_salt,
        );

        console.log("Parsed salt buffer length:", saltBuffer.byteLength);

        const wrappedKeyBuffer = EncodingService.base64ToArrayBuffer(
          user.wrapped_private_key,
        );

        console.log("Wrapped key buffer length:", wrappedKeyBuffer.byteLength);

        const wrappingKey = await KeyWrappingService.deriveWrappingKey(
          password,
          saltBuffer,
        );

        console.log("Wrapping key derived successfully");

        storedPrivateKey = await KeyWrappingService.unwrapPrivateKey(
          wrappedKeyBuffer,
          wrappingKey,
        );

        console.log("Private key unwrapped successfully");

        await savePrivateKey(user.id, storedPrivateKey);
      } catch (err) {
        console.error("Crypto init failed", err);

        setPrivateKey(null);
        setUser(null);
        setAccessToken(null);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        throw err;
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
