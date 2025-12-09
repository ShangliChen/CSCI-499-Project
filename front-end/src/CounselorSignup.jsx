import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "./config";

function CounselorSignup() {
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [license, setLicense] = useState("");
  const [message, setMessage] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/security-questions`);
        const data = await res.json();
        if (Array.isArray(data.questions)) setQuestions(data.questions);
      } catch (e) {
        setQuestions([
          "What was the name of your first pet?",
          "What is your mother’s maiden name?",
          "What was the name of your elementary school?",
          "In what city were you born?",
          "What is your favorite teacher’s name?",
          "What is the title of your favorite book?",
        ]);
      }
    };
    load();
  }, []);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/signup/counselor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, school_id: schoolId, email, password, license, securityQuestion, securityAnswer }),
      });
      const data = await res.json();
      if (data.success) {
        navigate(`/counselor-docs?userId=${data.userId}`);
      } else {
        setMessage(data.message || "Signup failed!");
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
        <h2 className="text-xl font-bold mb-6 text-center">Counselor Signup</h2>

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="School ID"
          value={schoolId}
          onChange={(e) => setSchoolId(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="License Number"
          value={license}
          onChange={(e) => setLicense(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <label className="block text-sm font-medium mb-1">Security Question</label>
        <select
          value={securityQuestion}
          onChange={(e) => setSecurityQuestion(e.target.value)}
          className="w-full mb-4 p-2 border rounded bg-white"
          required
        >
          <option value="" disabled>Select a question</option>
          {questions.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Security Answer"
          value={securityAnswer}
          onChange={(e) => setSecurityAnswer(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
          required
        />

        <button type="submit" className="bg-[#98FF98] text-black w-full py-2 rounded-lg hover:bg-[#87e687] transition">
          Sign Up
        </button>

        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </form>
    </div>
  );
}

export default CounselorSignup;
