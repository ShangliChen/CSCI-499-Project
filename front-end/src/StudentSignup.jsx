import { useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentSignup() {
  const [schoolId, setSchoolId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost/CSCI-499-Project/back-end/signup_student.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ school_id: schoolId, email, password }),
        }
      );

      const data = await response.json();
      console.log("Response from PHP:", data);

      if (data.success) {
        setMessage("Signup successful 🎉 Redirecting to login...");
        setTimeout(() => navigate("/login/student"), 1500); // Go to student login
      } else {
        setMessage(data.message || "Signup failed ❌");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Student Sign Up</h2>
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
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />
        <input
          type="password"
          placeholder="Create Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
        >
          Sign Up
        </button>
      </form>
      {message && <p className="mt-3 text-blue-600">{message}</p>}
    </div>
  );
}

export default StudentSignup;
