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
    <div className="min-h-screen bg-[#F5F5F7] px-4 py-8">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            WhisperBox Messenger
          </h1>
          <p className="text-sm text-gray-500">
            Secure, encrypted conversations
          </p>
        </div>

        <main className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 space-y-1">
              <h2 className="text-sm font-semibold text-gray-900">Contacts</h2>
              <p className="text-xs text-gray-500">Select a user to chat</p>
            </div>
            <UserList
              users={users}
              selectedUserId={selectedUser?.id}
              onSelect={selectUser}
            />
          </aside>

          <section className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <ChatWindow
              selectedUser={selectedUser}
              conversation={conversation}
              isLoading={isLoading}
              currentUserId="u1"
            />
            <MessageInput onSend={sendMessage} disabled={!selectedUser} />
          </section>
        </main>
      </div>
    </div>
  );
};

export default Chat;
