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
  exportPrivateKey
};
