import { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentLogin() {
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/login/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: schoolId, password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('user', JSON.stringify({ role: data.role, userId: data.userId }));
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

      {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
    </form>
  </div>
);

}

export default StudentLogin;
