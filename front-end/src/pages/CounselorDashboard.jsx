import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CounselorDashboard = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || userData.role !== "counselor") {
        navigate("/login/counselor"); // Redirect if not counselor
      } else {
        setUserName(userData.name || "Counselor"); // Set name if valid user
      }
    }, []);


  // Handle Profile navigation
  const goToProfile = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      navigate(`/counselor/profile/${parsed.userId}`); // route with userId
    } else {
      navigate("/counselor/login");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login/counselor");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      {/* ✅ Top Navbar */}
      <nav className="flex justify-between items-center mb-8 bg-white shadow-md p-4 rounded-xl">
        <h1 className="text-2xl font-bold text-gray-800">MindConnect</h1>
        <div className="space-x-4">
          <button
            onClick={goToProfile}
            className="px-4 py-2 bg-[#98D7C2] text-white rounded-lg hover:bg-green-700 transition"
          >
            Profile
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Logout
          </button>
            <button
  onClick={() => navigate("/counselor/assessments")}
  className="px-4 py-2 bg-[#BDFCC9] text-gray-800 rounded-lg hover:bg-green-200 transition"
>
  View Assessments
</button>
        </div>
      </nav>

      {/* Welcome Message */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">
          Welcome, {userName}!
        </h2>
        <p className="text-gray-500">
          Your space to support students and track progress
        </p>
      </section>

      {/* Main Dashboard Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Sessions */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3 className="text-lg font-semibold mb-2">Upcoming Sessions</h3>
          <p className="text-gray-600 mb-4">Alex – Today, Tomorrow, 10 AM</p>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-[#BDFCC9] text-white rounded hover:bg-green-700">
              Start Session
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100">
              Login
            </button>
          </div>
        </div>

        {/* Student Progress */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3 className="text-lg font-semibold mb-4">Student Progress</h3>
          <div className="w-full h-32 bg-blue-100 rounded flex items-center justify-center text-[#BDFCC9] font-semibold">
            Graph Placeholder
          </div>
          <p className="text-center mt-2 text-sm text-gray-500">
            Overall student wellbeing
          </p>
        </div>

        {/* My Students */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3 className="text-lg font-semibold mb-4">My Students</h3>
          <ul className="space-y-4">
            {["Alex", "Jordan", "Maya"].map((name, i) => (
              <li key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full" />
                  <span>{name}</span>
                </div>
                <div>
                  {name === "Maya" ? (
                    <button className="text-[#BDFCC9] hover:underline">
                      Message
                    </button>
                  ) : (
                    <button className="text-[#BDFCC9] hover:underline">
                      View Profile
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✔ Monthly mental health checking</li>
            <li>✔ Safe student forums</li>
          </ul>
        </div>

        {/* Quick Actions Extended */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-2">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked readOnly />
              <label>Schedule New Session</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked readOnly />
              <label>Review Check-ins</label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" checked readOnly />
              <label>Access Resources</label>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-10 text-sm text-gray-400 flex justify-between items-center">
        <span>© 2025 MindConnect</span>
        <div className="space-x-4">
          <a href="#" className="hover:text-gray-600">
            Contact
          </a>
          <a href="#" className="hover:text-gray-600">
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default CounselorDashboard;
