import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import Input from "../components/Input";
import Button from "../components/Button";
import { useToast } from "../components/Toast";

const Login = () => {
  const { login, authLoading } = useAuthContext();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      newErrors.username = "Username is required";
    } else if (normalizedUsername.length > 32) {
      newErrors.username = "Username must be 32 characters or fewer";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length > 128) {
      newErrors.password = "Password must be 128 characters or fewer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await login(username, password);
      addToast("success", "Welcome back!");
      navigate("/chat");
    } catch (err) {
      console.error("Login failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setErrors({ general: errorMessage });
      addToast("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-950"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your WhisperBox account
          </p>
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Username"
            maxLength={32}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-label="Username"
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username && (
            <p id="username-error" className="text-sm text-red-600 dark:text-red-400">
              {errors.username}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Password"
            type="password"
            maxLength={128}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-red-600 dark:text-red-400">
              {errors.password}
            </p>
          )}
        </div>

        {errors.general && (
          <div className="rounded-md bg-red-50 p-3 dark:bg-red-950/40">
            <p className="text-sm text-red-800 dark:text-red-300">{errors.general}</p>
          </div>
        )}

        <Button disabled={loading || authLoading} className="w-full">
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-gray-900 underline hover:text-gray-700 dark:text-gray-100 dark:hover:text-gray-300"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
