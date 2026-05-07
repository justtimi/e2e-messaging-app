import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";

const Splash = () => {
  const navigate = useNavigate();
  const { user, authLoading } = useAuthContext();

  useEffect(() => {
    if (authLoading) return;

    const timeoutId = window.setTimeout(() => {
      navigate(user ? "/chat" : "/login", { replace: true });
    }, 600);

    return () => window.clearTimeout(timeoutId);
  }, [authLoading, navigate, user]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F5F5F7] px-4 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-900">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-gray-500 dark:border-gray-800 dark:border-t-gray-300" />
        </div>

        <div className="mt-5 space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            WhisperBox
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {authLoading ? "Checking your session..." : "Opening your inbox..."}
          </p>
        </div>

        <div className="mt-6 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-900">
          <div className="h-1.5 w-2/3 animate-pulse rounded-full bg-gray-500 dark:bg-gray-300" />
        </div>
      </div>
    </div>
  );
};

export default Splash;
