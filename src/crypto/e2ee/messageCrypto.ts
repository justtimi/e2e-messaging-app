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
  ciphertext: string,
  iv: string,
  encryptedKey: ArrayBuffer,
  receiverPrivateKey: CryptoKey,
) => {
  const aesKey = await EncryptionService.decryptAESKey(
    encryptedKey,
    receiverPrivateKey,
  );

  return await EncryptionService.decryptMessage(
    JSON.stringify({ ciphertext, iv }),
    aesKey,
  );
};
