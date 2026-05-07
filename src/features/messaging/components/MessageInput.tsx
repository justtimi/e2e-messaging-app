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
      className="flex shrink-0 gap-2 border-t border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-950 sm:px-4"
      onSubmit={handleSend}
    >
      <Input
        placeholder="Type a message…"
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        aria-label="Enter a new message"
        className="min-w-0 flex-1"
      />
      <Button
        type="submit"
        disabled={disabled || !text.trim()}
        className="shrink-0"
      >
        Send
      </Button>
    </form>
  );
};

export default MessageInput;
