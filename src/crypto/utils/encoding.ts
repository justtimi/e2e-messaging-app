const textToArrayBuffer = (text: string): Uint8Array<ArrayBuffer> => {
  return new TextEncoder().encode(text);
};

const arrayBufferToText = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return new Uint8Array(bytes).buffer;
};

export const EncodingService = {
  base64ToArrayBuffer,
  arrayBufferToBase64,
  arrayBufferToText,
  textToArrayBuffer,
};
