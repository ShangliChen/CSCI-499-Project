import { Navigate } from "react-router-dom";

export default function AdminProtectedRoute({ children }) {
  const secret = localStorage.getItem("adminSecret");

  if (!secret) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}
