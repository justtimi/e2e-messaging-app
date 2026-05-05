import ChatWindow from "../features/messaging/components/ChatWindow";
import MessageInput from "../features/messaging/components/MessageInput";
import UserList from "../features/users/UserList";
import { useMessages } from "../features/messaging/hooks/useMessages";

const Chat = () => {
  const {
    users,
    selectedUser,
    conversation,
    isLoading,
    selectUser,
    sendMessage,
  } = useMessages();

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="flex h-screen">
        <aside className="w-80 border-r border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                WhisperBox Messenger
              </h1>
              <p className="text-sm text-gray-500">
                Secure, encrypted conversations
              </p>
            </div>
          </div>
          <div className="p-4">
            <div className="mb-4 space-y-1">
              <h2 className="text-sm font-semibold text-gray-900">Contacts</h2>
              <p className="text-xs text-gray-500">Select a user to chat</p>
            </div>
            <UserList
              users={users}
              selectedUserId={selectedUser?.id}
              onSelect={selectUser}
            />
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-white">
          <ChatWindow
            selectedUser={selectedUser}
            conversation={conversation}
            isLoading={isLoading}
            currentUserId="u1"
          />
          <MessageInput onSend={sendMessage} disabled={!selectedUser} />
        </section>
      </div>
    </div>
  );
};

export default Chat;
