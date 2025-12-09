import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";

function StudentLogin() {
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [recoveryQuestion, setRecoveryQuestion] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/login/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: schoolId, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({
          role: data.role,
          userId: data.userId,
          name: data.name // 👈 Save name from backend
        }));
        setMessage(data.message || "Login successful!");
        navigate("/dashboard/student");
      } else {
        setMessage(data.message || "Login failed!");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong!");
    }
  };

  const handleForgotInit = async () => {
    setMessage("");
    setRecoveryQuestion("");
    if (!schoolId) {
      setMessage("Please enter your School ID first.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: schoolId })
      });
      const data = await res.json();
      if (data.success) {
        setRecoveryQuestion(data.securityQuestion);
      } else {
        setMessage(data.message || "Failed to retrieve security question.");
      }
    } catch (err) {
      setMessage("Failed to retrieve security question.");
    }
  };

  const handleForgotReset = async () => {
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: schoolId, answer: recoveryAnswer, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password reset successful. You can now log in.");
        setShowForgot(false);
        setRecoveryQuestion("");
        setRecoveryAnswer("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.message || "Password reset failed.");
      }
    } catch (err) {
      setMessage("Password reset failed.");
    }
  };

return (
  <div
    className="min-h-screen flex items-center justify-center bg-cover bg-center"
    style={{ backgroundImage: "url('/images/background.jpg')" }}
  >
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
      <h2 className="text-xl font-bold mb-6 text-center">Student Login</h2>

      <input
        type="text"
        placeholder="School ID"
        value={schoolId}
        onChange={(e) => setSchoolId(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        type="submit"
        className="bg-[#98D7C2] text-white w-full py-2 rounded-lg hover:bg-green-700 transition"
      >
        Login
      </button>

      <button
        type="button"
        onClick={() => setShowForgot((s) => !s)}
        className="w-full text-sm text-[#098] mt-3 underline"
      >
        {showForgot ? "Close Forgot Password" : "Forgot password?"}
      </button>

      {showForgot && (
        <div className="mt-4 border-t pt-4">
          <p className="text-sm mb-2">Enter your School ID to retrieve your security question.</p>
          {!recoveryQuestion ? (
            <button type="button" onClick={handleForgotInit} className="w-full bg-gray-100 py-2 rounded hover:bg-gray-200">Get Security Question</button>
          ) : (
            <div>
              <p className="text-sm font-medium mb-2">Question: {recoveryQuestion}</p>
              <input
                type="text"
                placeholder="Your Answer"
                value={recoveryAnswer}
                onChange={(e) => setRecoveryAnswer(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              />
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mb-3 p-2 border rounded"
              />
              <button type="button" onClick={handleForgotReset} className="w-full bg-[#98D7C2] text-white py-2 rounded">Reset Password</button>
            </div>
          )}
        </div>
      )}

      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </form>
  </div>
);

}

export default StudentLogin;
