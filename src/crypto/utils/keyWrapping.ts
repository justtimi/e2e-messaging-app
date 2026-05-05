const deriveWrappingKey = async (password: string, salt: ArrayBuffer) => {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
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
    ["unwrapKey"]
  );
};

const unwrapPrivateKey = async (
  wrappedKey: ArrayBuffer,
  wrappingKey: CryptoKey
) => {
  return await crypto.subtle.unwrapKey(
    "pkcs8",
    wrappedKey,
    wrappingKey,
    { name: "AES-KW" },
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
};

export const KeyWrappingService = {
  deriveWrappingKey,
  unwrapPrivateKey,
};