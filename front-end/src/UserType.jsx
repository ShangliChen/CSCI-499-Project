import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserType() {
  const [user, setUser] = useState("");
  const navigate = useNavigate();

  const handleAction = (action) => {
    if (!user) {
      alert("Please select a user type!");
      return;
    }
    navigate(`/${action}/${user}`);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col items-center justify-center text-center px-4">
      {/* Main Content */}
      <main className="flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-10">Who are you?</h1>

        {/* User Type Cards */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div
            onClick={() => setUser("student")}
            className={`cursor-pointer bg-white rounded-xl p-6 w-64 shadow-md hover:shadow-xl transition ${
              user === "student" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <img src="/images/student.png" alt="Student" className="w-20 h-20 mx-auto mb-2" />
            <p className="text-lg font-semibold text-gray-700">Student</p>
          </div>

          <div
            onClick={() => setUser("counselor")}
            className={`cursor-pointer bg-white rounded-xl p-6 w-64 shadow-md hover:shadow-xl transition ${
              user === "counselor" ? "ring-2 ring-blue-500" : ""
            }`}
          >
            <img src="/images/counselor.png" alt="Counselor" className="w-20 h-20 mx-auto mb-2" />
            <p className="text-lg font-semibold text-gray-700">Counselor</p>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={() => handleAction("login")}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition mb-4"
        >
          Login
        </button>

          {/* Sign up link */}
        <p className="text-gray-600 text-sm">
          Don't have an account?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleAction("signup");
            }}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign up now
          </a>
        </p>
        
      </main>
    </div>
  );
}

export default UserType;
