import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import Input from "../components/Input";
import Button from "../components/Button";
import { CryptoService } from "../crypto/e2ee/keyManagement";
import { EncodingService } from "../crypto/utils/encoding";
import { KeyWrappingService } from "../crypto/utils/keyWrapping";
import { useToast } from "../components/Toast";

const Signup = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1. generate RSA keypair
      const keyPair = await CryptoService.generateKeyPair();

      const publicKey = await CryptoService.exportPublicKey(keyPair);

      // 2. generate salt for PBKDF2
      const salt = crypto.getRandomValues(new Uint8Array(16));

      // 3. derive wrapping key from password and salt
      const wrappingKey = await KeyWrappingService.deriveWrappingKey(
        password,
        salt.buffer,
      );

      // 4. wrap private key with AES-KW
      const wrappedPrivateKey = await KeyWrappingService.wrapPrivateKey(
        keyPair.privateKey,
        wrappingKey,
      );

      const payload = {
        username,
        display_name: displayName,
        password,
        public_key: publicKey,
        wrapped_private_key:
          EncodingService.arrayBufferToBase64(wrappedPrivateKey),
        pbkdf2_salt: EncodingService.arrayBufferToBase64(salt.buffer),
      };

      await register(payload);

      addToast("success", "Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      addToast(
        "error",
        `Signup failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Join WhisperBox for secure messaging
          </p>
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-label="Username"
            aria-describedby={errors.username ? "username-error" : undefined}
          />
          {errors.username && (
            <p id="username-error" className="text-sm text-red-600">
              {errors.username}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            aria-label="Display Name"
            aria-describedby={
              errors.displayName ? "displayName-error" : undefined
            }
          />
          {errors.displayName && (
            <p id="displayName-error" className="text-sm text-red-600">
              {errors.displayName}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-label="Password"
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <Button disabled={loading} className="w-full">
          {loading ? "Creating Account..." : "Sign Up"}
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
};

export default Signup;
