import { Navigate } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, authLoading } = useAuthContext();

  if (authLoading) {
    return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;