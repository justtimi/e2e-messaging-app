import MessageBubble from "./MessageBubble";
import Loader from "../../../components/Loader";
import type { ChatMessage, ChatUser } from "../../../types/types";

type ChatWindowProps = {
  selectedUser: ChatUser | null;
  conversation: ChatMessage[];
  isLoading: boolean;
  currentUserId: string;
};

const ChatWindow = ({
  selectedUser,
  conversation,
  isLoading,
  currentUserId,
}: ChatWindowProps) => {
  if (!selectedUser) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto p-6 text-center">
        <div className="max-w-md space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-gray-100 p-4 dark:bg-gray-900">
            <svg
                className="h-8 w-8 text-gray-700 dark:text-gray-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Select a conversation
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Choose a contact from the sidebar to start a secure, end-to-end
              encrypted conversation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-w-0 shrink-0 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <h2 className="truncate font-semibold text-gray-900 dark:text-gray-100">
          {selectedUser.name}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {selectedUser.status === "online" ? "Online" : "Offline"}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <Loader />
        ) : (
          conversation.map((message) => {
            const isOwn = message.senderId === currentUserId;
            return (
              <MessageBubble
                key={message.id}
                text={message.text}
                isOwn={isOwn}
                time={new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
