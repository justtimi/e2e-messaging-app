/* generateAESKey()
encryptMessage()
decryptMessage()
encryptAESKey()
decryptAESKey() */

import { textToArrayBuffer, arrayBufferToBase64, base64ToArrayBuffer, arrayBufferToText } from "./encoding";

export const encryptMessage = async (text: string, derivedKey: CryptoKey) => {
  const encodedText = textToArrayBuffer(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    derivedKey,
    encodedText,
  );
  

  const base64Ciphertext = arrayBufferToBase64(encryptedData);

  return JSON.stringify({
    iv: Array.from(iv),
    ciphertext: base64Ciphertext,
  });
};

export const decryptMessage = async (
  messageJSON: string,
  derivedKey: CryptoKey,
) => {
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
    const encryptedArray = base64ToArrayBuffer(message.ciphertext);
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      derivedKey,
      encryptedArray,
    );
    return arrayBufferToText(decryptedData);
  } catch (error) {
    console.error("Decryption failed", error);
    throw error;
  }
};

export const generateAESKey = async (derivedKey: CryptoKey) => {
  return derivedKey;
};

export const encryptAESKey = async (key: CryptoKey) => {
  return key;
};

export const decryptAESKey = async (key: CryptoKey) => {
  return key;
};
