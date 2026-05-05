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
      <div className="flex flex-1 items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Select a contact to start
          </h2>
          <p className="text-sm text-gray-500">
            Messages are encrypted end-to-end
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="border-b border-gray-200 px-4 py-3">
        <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
        <p className="text-xs text-gray-500">
          {selectedUser.status === "online" ? "Online" : "Offline"}
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
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
