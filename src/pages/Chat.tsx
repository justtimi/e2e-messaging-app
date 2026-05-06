import ChatWindow from "../features/messaging/components/ChatWindow";
import MessageInput from "../features/messaging/components/MessageInput";
import UserList from "../features/users/UserList";
import Input from "../components/Input";
import { useMessages } from "../features/messaging/hooks/useMessages";
import { useAuthContext } from "../auth/AuthContext";
import SettingsDropdown from "../components/SettingsDropdown";
import MobileMenuButton from "../components/MobileMenuButton";
import { useState } from "react";

const Chat = () => {
  const { user: currentUser } = useAuthContext();
  const {
    users,
    selectedUser,
    conversation,
    isLoading,
    selectUser,
    sendMessage,
    searchQuery,
    setSearchQuery,
  } = useMessages();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <div className="flex h-screen">
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <aside
          className={`w-80 border-r border-gray-200 bg-white lg:block ${isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50" : "hidden"}`}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-4">
            <div className="space-y-2">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                WhisperBox Messenger
              </h1>
              <p className="text-sm text-gray-500">
                Secure, encrypted conversations
              </p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
              aria-label="Close menu"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-4">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Contacts
                </h2>
                <p className="text-xs text-gray-500">Select a user to chat</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchOpen((open) => !open)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                {isSearchOpen ? "Hide search" : "New chat"}
              </button>
            </div>
            {isSearchOpen && (
              <div className="mb-4">
                <Input
                  placeholder="Search users to chat"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="w-full"
                  aria-label="Search users"
                />
              </div>
            )}
            <UserList
              users={users}
              selectedUserId={selectedUser?.id}
              onSelect={(userId) => {
                selectUser(userId);
                setIsMobileMenuOpen(false); // Close mobile menu after selection
              }}
            />
          </div>
        </aside>

        <section className="flex-1 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
              <MobileMenuButton
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                isOpen={isMobileMenuOpen}
              />
              <h1 className="text-lg font-semibold text-gray-900 lg:hidden">
                WhisperBox
              </h1>
            </div>
            <SettingsDropdown
              userName={
                currentUser?.display_name || currentUser?.username || "User"
              }
            />
          </div>

          <ChatWindow
            selectedUser={selectedUser}
            conversation={conversation}
            isLoading={isLoading}
            currentUserId={currentUser?.id || ""}
          />
          <MessageInput onSend={sendMessage} disabled={!selectedUser} />
        </section>
      </div>
    </div>
  );
};

export default Chat;
