import { useEffect, useState } from "react";

function StudentSignup() {
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:5000/security-questions");
        const data = await res.json();
        if (Array.isArray(data.questions)) setQuestions(data.questions);
      } catch (e) {
        // Fallback list if backend unavailable
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    const studentData = { name, school_id: schoolId, email, password, dob, phoneNumber, securityQuestion, securityAnswer };
    console.log("Sending data:", studentData);

    try {
      const res = await fetch("http://localhost:5000/signup/student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(studentData),
      });

      console.log("Received response:", res);
      const data = await res.json();
      console.log("Response data:", data);

      setMessage(data.message || "Signup successful!");
    } catch (error) {
      console.error("Signup fetch error:", error);
      setMessage("Something went wrong!");
    }
  };

  return (
    <div
    className="min-h-screen flex items-center justify-center bg-cover bg-center"
    style={{ backgroundImage: "url('/images/background.jpg')" }}
  >
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Student Signup</h2>

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
          type="date"
          placeholder="Date of Birth"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <input
          type="tel"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
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

export default StudentSignup;
