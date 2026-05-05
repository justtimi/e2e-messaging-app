import type { ChatUser } from "../../types/types";

type UserListProps = {
  users: ChatUser[];
  selectedUserId?: string;
  onSelect: (id: string) => void;
};

const UserList = ({ users, selectedUserId, onSelect }: UserListProps) => {
  return (
    <div className="space-y-0">
      {users.map((user) => (
        <button
          key={user.id}
          type="button"
          onClick={() => onSelect(user.id)}
          className={[
            "flex w-full items-start gap-3 border-b px-3 py-2 text-left transition-all duration-200 ease-out hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100",
            user.id === selectedUserId
              ? "border-b-gray-300 bg-gray-50"
              : "border-b-gray-200 bg-white",
          ].join(" ")}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-gray-200 text-sm font-semibold text-white"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="block truncate text-sm font-medium text-gray-900">
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
            <p className="mt-1 truncate text-xs text-gray-500">
              {user.lastMessage}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default UserList;
