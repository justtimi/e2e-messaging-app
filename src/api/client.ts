type MessageSendPayload = {
  type: "message.send";
  payload: {
    receiver_id: string;
    ciphertext: string;
    iv: string;
    encrypted_key: string;
    encrypted_key_for_self: string;
  };
};

type IncomingMessage = {
  id: string;
  sender_id: string;
  receiver_id: string;
  ciphertext: string;
  iv: string;
  encrypted_key: string;
  encrypted_key_for_self: string;
  created_at: string;
};

type MessageReceivePayload = {
  type: "message.receive";
  payload: IncomingMessage;
};

export class WhisperSocket {
  private socket: WebSocket | null = null;
  private token: string;
  private onMessage: (data: IncomingMessage) => void;
  private onClose?: () => void;

  constructor(
    token: string,
    onMessage: (data: IncomingMessage) => void,
    onClose?: () => void,
  ) {
    this.token = token;
    this.onMessage = onMessage;
    this.onClose = onClose;
  }

  connect() {
    this.socket = new WebSocket(
      `wss://whisperbox.koyeb.app/ws?token=${this.token}`,
    );

    this.socket.onopen = () => {
      console.log("WhisperSocket connected");
    };

    this.socket.onmessage = (event) => {
  try {
    const data:MessageReceivePayload = JSON.parse(event.data);

    if (data?.type === "message.receive") {
      this.onMessage(data.payload);
    }
  } catch (err) {
    console.error("Invalid WS message:", err);
  }
};

    this.socket.onclose = () => {
      console.log("WhisperSocket closed");
      this.onClose?.();
    };

    this.socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  }

  sendMessage(payload: MessageSendPayload["payload"]) {
  if (!this.socket) {
    return false;
  }

  if (this.socket.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket not ready. Message not sent.");
    return false;
  }

  this.socket.send(
    JSON.stringify({
      type: "message.send",
      payload,
    }),
  );

  return true;
}

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}
