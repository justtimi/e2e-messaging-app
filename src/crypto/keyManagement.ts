/* generateKeyPair()
importPublicKey()
*/


export const generateKeyPair = async () => {
  return await window.crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveBits", "deriveKey"],
  );
};

export const importPublicKey = async (publicKeyJwk: JsonWebKey) => {
  const publicKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    [],
  );
  return publicKey;
};

export const deriveKeys = async (
  publicKeyJwk: JsonWebKey,
  privateKey: CryptoKey,
) => {
  const publicKey = await importPublicKey(publicKeyJwk);

  return await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"],
  );
};
