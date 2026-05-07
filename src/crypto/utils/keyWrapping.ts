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
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

const wrapPrivateKey = async (
  privateKey: CryptoKey,
  wrappingKey: CryptoKey,
) => {
  const rawPrivateKey = await crypto.subtle.exportKey("pkcs8", privateKey);
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    wrappingKey,
    rawPrivateKey,
  );

  const result = new Uint8Array(iv.length + encrypted.byteLength);
  result.set(iv);
  result.set(new Uint8Array(encrypted), iv.length);

  return result.buffer;
};

const unwrapPrivateKey = async (
  wrappedKey: ArrayBuffer,
  wrappingKey: CryptoKey,
) => {
  console.log("Wrapped key length:", wrappedKey.byteLength);

  const data = new Uint8Array(wrappedKey);
  console.log("Data length:", data.length);

  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);

  console.log("IV length:", iv.length, "Encrypted length:", encrypted.length);
  console.log("IV bytes:", Array.from(iv).slice(0, 4), "...");

  try {
    const rawPrivateKey = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      wrappingKey,
      encrypted,
    );

    console.log(
      "Decryption successful, raw key length:",
      rawPrivateKey.byteLength,
    );

    const importedKey = await crypto.subtle.importKey(
      "pkcs8",
      rawPrivateKey,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"],
    );

    console.log("Key import successful");
    return importedKey;
  } catch (error) {
    console.error("❌ Decryption/import failed:", error);
    throw error;
  }
};

export const KeyWrappingService = {
  deriveWrappingKey,
  wrapPrivateKey,
  unwrapPrivateKey,
};
