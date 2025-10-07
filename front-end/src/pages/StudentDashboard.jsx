import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [userName, setUserName] = useState("");
  const [studentId, setStudentId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored?.userId) {
      setStudentId(stored.userId);

      const fetchUser = async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/student/profile/${stored.userId}`);
          const data = await res.json();
          if (data.success) {
            setUserName(data.data.name);
          } else {
            console.error("❌ Failed to fetch profile:", data.message);
          }
        } catch (error) {
          console.error("❌ Error fetching profile:", error);
        }
      };

      fetchUser();
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans px-8 py-10">
      {/* Main Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT COLUMN */}
        <div className="space-y-8">
          <h1 className="text-4xl font-bold text-gray-800">
            Welcome, {userName || "Student"}!
          </h1>
            <button
              onClick={() => navigate(`/student/profile/${studentId}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              View Profile
            </button>
          <p className="text-lg text-gray-600">
            Your space for mental-wellbeing and growth
          </p>

          {/* 4 Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Monthly Check-in */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
              <h2 className="text-lg font-semibold mb-3">Monthly Check-in</h2>
              <button className="px-4 py-2 bg-[#BDFCC9] text-white rounded-md hover:bg-green-700">
                Start Now
              </button>
            </div>

            {/* Mood Progress */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
              <h2 className="text-lg font-semibold mb-3">Your Progress</h2>
              <img
                src="/images/mood-chart.png"
                alt="Mood over time"
                className="rounded"
              />
              <p className="text-sm text-gray-500 mt-2">Mood over time</p>
            </div>

            {/* Upcoming Session - Forum */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
              <h2 className="text-lg font-semibold mb-2">Upcoming Session</h2>
              <p className="text-gray-600">Safe student forums</p>
            </div>

            {/* Upcoming Session - Date */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
              <h2 className="text-lg font-semibold mb-2">Upcoming Session</h2>
              <p className="text-gray-600">Dec 15, 2024 at 10 AM</p>
              <div className="mt-4 space-x-2">
                <button className="px-3 py-1 bg-[#BDFCC9] text-white rounded hover:bg-green-700">
                  Browse
                </button>
                <button className="px-3 py-1 bg-[#BDFCC9] text-white rounded hover:bg-green-700">
                  Browse
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md flex flex-col items-center">
            {/* Illustration Inside Box */}
            <img
              src="../images/student_dashboard.png"
              alt="Group discussion illustration"
              className="max-w-full rounded-xl mb-6"
            />

            {/* Quick Resources Inside Same Box */}
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-4">Quick Resources</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-[#BDFCC9] mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Find a Counselor
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-[#BDFCC9] mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Explore coping techniques
                </li>
                <li className="flex items-center">
                  <svg
                    className="w-5 h-5 text-[#BDFCC9] mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Read articles
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex justify-between items-center px-4 py-6 text-sm text-gray-500 border-t mt-12">
        <span>© 2025 MindConnect</span>
        <div className="space-x-4">
          <a href="#" className="hover:underline">Contact</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
