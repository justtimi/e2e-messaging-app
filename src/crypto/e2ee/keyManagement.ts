const exportPublicKey = async (keyPair: CryptoKeyPair) => {
  return await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
};

const exportPrivateKey = async (keyPair: CryptoKeyPair) => {
  return await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
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

const importPublicKey = async (keyBuffer: ArrayBuffer) => {
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
const importPrivateKey = async (keyBuffer: ArrayBuffer) => {
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
