import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import Input from "../components/Input";
import Button from "../components/Button";
import { CryptoService } from "../crypto/e2ee/keyManagement";
import { EncodingService } from "../crypto/utils/encoding";
import { KeyWrappingService } from "../crypto/utils/keyWrapping";

const Signup = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
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
        pbkdf2_salt: salt.toString(),
      };

      await register(payload);

      // Skip auto-login for now due to crypto issues
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      alert(
        `Signup failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6"
      >
        <h1 className="text-xl font-semibold">Create Account</h1>

        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Input
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button disabled={loading} className="w-full">
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </form>
    </div>
  );
};

export default Signup;
