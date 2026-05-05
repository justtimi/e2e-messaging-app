import { useState, type FormEvent } from "react";
import Button from "../../../components/Button";
import Input from "../../../components/Input";

type MessageInputProps = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

const MessageInput = ({ onSend, disabled = false }: MessageInputProps) => {
  const [text, setText] = useState("");

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <form
      className="flex gap-2 border-t border-gray-200 px-4 py-3"
      onSubmit={handleSend}
    >
      <Input
        placeholder="Type a message…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        aria-label="Enter a new message"
        className="flex-1"
      />
      <Button type="submit" disabled={disabled || !text.trim()}>
        Send
      </Button>
    </form>
  );
};

export default MessageInput;
