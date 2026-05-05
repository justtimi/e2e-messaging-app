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
