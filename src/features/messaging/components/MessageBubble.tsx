type MessageBubbleProps = {
  text: string;
  isOwn: boolean;
  time: string;
};

const MessageBubble = ({ text, isOwn, time }: MessageBubbleProps) => {
  return (
    <div
      className={[
        "max-w-[82%] rounded-2xl px-4 py-2 sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%]",
        isOwn
          ? "self-end bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-950"
          : "self-start bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100",
      ].join(" ")}
    >
      <p className="break-words text-sm leading-5">{text}</p>
      <span
        className={[
          "mt-1 block text-xs",
          isOwn
            ? "text-gray-400 dark:text-gray-600"
            : "text-gray-500 dark:text-gray-400",
        ].join(" ")}
      >
        {time}
      </span>
    </div>
  );
};

export default MessageBubble;
