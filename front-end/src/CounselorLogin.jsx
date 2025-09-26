import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CounselorLogin() {
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/CSCI-499-Project/back-end/login_counselor.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ school_id: schoolId, password }),
        }
      );

      const data = await response.json();
      console.log("Response from PHP:", data);

      if (data.success) {
        setMessage("Login successful 🎉 Redirecting...");
        setTimeout(() => navigate("/"), 1500); // redirect to homepage/dashboard
      } else {
        setMessage(data.message || "Login failed ❌");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Counselor Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="School ID"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
        >
          Login
        </button>
      </form>
      {message && <p className="mt-3 text-red-500">{message}</p>}
    </div>
  );
}

export default CounselorLogin;
