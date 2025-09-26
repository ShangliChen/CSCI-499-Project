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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold mb-6">Select User Type</h2>

        <div className="flex flex-col space-y-4 mb-6 text-left">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="userType"
              value="student"
              onChange={(e) => setUser(e.target.value)}
              className="accent-blue-500"
            />
            <span>Student</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="userType"
              value="counselor"
              onChange={(e) => setUser(e.target.value)}
              className="accent-blue-500"
            />
            <span>Counselor</span>
          </label>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleAction("login")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => handleAction("signup")}
            className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserType;
