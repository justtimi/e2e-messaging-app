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
    iv: EncodingService.arrayBufferToBase64(iv.slice().buffer),
    ciphertext: base64Ciphertext,
  });
};

const decryptMessage = async (messageJSON: string, derivedKey: CryptoKey) => {
  try {
    const message = JSON.parse(messageJSON);
    if (
      !message ||
      typeof message !== "object" ||
      typeof message.iv !== "string" ||
      typeof message.ciphertext !== "string"
    ) {
      throw new Error("Invalid encrypted payload");
    }
    const iv = EncodingService.base64ToArrayBuffer(message.iv);
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
