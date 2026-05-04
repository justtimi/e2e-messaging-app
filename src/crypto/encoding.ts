/* arrayBufferToBase64()
base64ToArrayBuffer()
textToArrayBuffer()
arrayBufferToText() */

export const textToArrayBuffer = (text: string): Uint8Array<ArrayBuffer> => {
  return new TextEncoder().encode(text);
};

export const arrayBufferToText = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);

  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);

  const bytes = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
};