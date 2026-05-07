import type { ChatUser } from "../../types/types";

type UserListProps = {
  users: ChatUser[];
  selectedUserId?: string;
  emptyMessage?: string;
  onSelect: (id: string) => void;
};

const UserList = ({
  users,
  selectedUserId,
  emptyMessage = "No users available yet. Try refreshing or creating a new chat.",
  onSelect,
}: UserListProps) => {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onSelect(user.id)}
          className={[
            "flex w-full items-start gap-3 border-b px-3 py-2 text-left transition-all duration-200 ease-out hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:hover:bg-gray-900 dark:focus:ring-gray-800",
            user.id === selectedUserId
              ? "border-b-gray-300 bg-gray-50 dark:border-b-gray-700 dark:bg-gray-900"
              : "border-b-gray-200 bg-white dark:border-b-gray-800 dark:bg-gray-950",
          ].join(" ")}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 text-sm font-semibold text-white dark:border-gray-700"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="block truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                {user.name}
              </span>
              <span
                className={
                  user.status === "online"
                    ? "h-2 w-2 rounded-full bg-green-500"
                    : "h-2 w-2 rounded-full bg-gray-300"
                }
              />
            </div>
            <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
              {user.lastMessage}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default UserList;
