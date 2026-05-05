type MessageBubbleProps = {
  text: string;
  isOwn: boolean;
  time: string;
};

const MessageBubble = ({ text, isOwn, time }: MessageBubbleProps) => {
  return (
    <div
      className={[
        "max-w-[70%] rounded-lg px-3 py-2",
        isOwn
          ? "self-end bg-gray-900 text-white"
          : "self-start bg-gray-100 text-gray-900",
      ].join(" ")}
    >
      <p className="text-sm leading-5">{text}</p>
      <span
        className={[
          "mt-1 block text-xs",
          isOwn ? "text-gray-400" : "text-gray-500",
        ].join(" ")}
      >
        {time}
      </span>
    </div>
  );
};

export default MessageBubble;
