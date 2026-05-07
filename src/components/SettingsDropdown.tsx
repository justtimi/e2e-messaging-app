import { useEffect, useRef, useState } from "react";
import { useAuthContext } from "../auth/AuthContext";
import { useToast } from "./Toast";

type SettingsDropdownProps = {
  userName: string;
  publicKey?: string;
};

const SettingsDropdown = ({ userName, publicKey }: SettingsDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeView, setActiveView] = useState<"menu" | "profile">("menu");
  const [isDarkMode, setIsDarkMode] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuthContext();
  const { addToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveView("menu");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleThemeChange = (enabled: boolean) => {
    setIsDarkMode(enabled);
    localStorage.setItem("theme", enabled ? "dark" : "light");
    document.documentElement.classList.toggle("dark", enabled);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
      setActiveView("menu");
      addToast("success", "Logged out successfully");
    } catch (error) {
      console.error("Logout failed:", error);
      addToast("error", "Failed to logout");
    }
  };

  const handleCopyPublicKey = () => {
    if (!publicKey) {
      addToast("error", "Public key not available");
      return;
    }

    navigator.clipboard.writeText(publicKey);
    addToast("success", "Public key copied to clipboard!");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-200 dark:hover:bg-gray-800"
        aria-label="Settings menu"
        aria-expanded={isOpen}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white dark:bg-gray-200 dark:text-gray-950">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden max-w-36 truncate sm:block">{userName}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-800 dark:bg-gray-950">
          {activeView === "menu" ? (
            <>
              <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-800">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Signed in
                </p>
              </div>

              <button
                onClick={() => setActiveView("profile")}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900 dark:focus:bg-gray-900"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Profile settings
              </button>

              <button
                onClick={handleCopyPublicKey}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900 dark:focus:bg-gray-900"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Copy my public key
              </button>

              <label
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  Dark mode
                </span>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={(event) => handleThemeChange(event.target.checked)}
                  className="h-4 w-4 accent-gray-900 dark:accent-gray-200"
                  aria-label="Toggle dark mode"
                />
              </label>
            </>
          ) : (
            <div>
              <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setActiveView("menu")}
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-100"
                  aria-label="Back to menu"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Profile settings
                </p>
              </div>

              <div className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white dark:bg-gray-200 dark:text-gray-950">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Signed in
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900">
                  <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                    Public key
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-600 dark:text-gray-300">
                    {publicKey ?? "Not available"}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyPublicKey}
                    className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900"
                  >
                    Copy public key
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;
