import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CounselorDashboard = () => {
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  // Fetch user and notifications
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData || userData.role !== "counselor") {
      navigate("/login/counselor");
    } else {
      setUserName(userData.name || "Counselor");

      // Fetch notifications
      axios
        .get("http://localhost:5000/api/assessments/notifications/recent")
        .then((res) => {
          console.log("Notifications from backend:", res.data); // <--- add this
          const data = res.data.map((n) => ({ ...n, read: n.read || false }));
          setNotifications(data);
        })
        .catch((err) => console.error("Error fetching notifications:", err));
    }
  }, [navigate]);

  // Handle Profile navigation
  const goToProfile = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      navigate(`/counselor/profile/${parsed.userId}`);
    } else {
      navigate("/counselor/login");
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login/counselor");
  };

  // Handle notification click (mark read & navigate)
  const handleNotificationClick = async (notifId, studentId) => {
      try {
        // Mark as read on backend
        await axios.post(`http://localhost:5000/api/assessments/notifications/${notifId}/read`);

        // Update local state immediately
        setNotifications((prev) =>
          prev.map((n) => (n._id === notifId ? { ...n, read: true } : n))
        );

        // Navigate to student
        navigate(`/counselor/user/${studentId}`);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
        alert("Failed to mark notification as read. Try again later.");
      }
    };


  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      {/* Welcome */}
      <section className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome, {userName}!
            </h2>
            <button
              onClick={goToProfile}
              className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              title="Go to Profile"
            >
              {/* Profile Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5.121 17.804A4 4 0 0112 15a4 4 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          {/* 🔔 Bell Icon */}
          <button
            onClick={() => navigate("/counselor/notifications")}
            className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
            title="All Notifications"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>
        </section>


      {/* 🔔 Notifications */}
      {unreadNotifications.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-lg p-4 my-6">
          <h3 className="text-lg font-semibold text-red-700 mb-3">
            🔔 Alerts from Recent Assessments
          </h3>
          {unreadNotifications.map((n) => (
            <div
              key={n._id}
              onClick={() =>
                n.student?._id &&
                handleNotificationClick(n._id, n.student._id)
              }
              className="p-2 bg-white border border-red-200 rounded mb-2 shadow-sm cursor-pointer hover:bg-red-200 transition"
            >
              <strong className="text-red-700">{n.student?.name}</strong> —{" "}
              <span className="text-gray-700">{n.message}</span>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(n.date).toLocaleString()}
              </p>
            </div>
          ))}

          <div className="mt-4 text-right">
            <button
              onClick={() => navigate("/counselor/notifications")}
              className="text-sm text-[#1D9BF0] hover:underline"
            >
              See all notifications →
            </button>
          </div>
        </div>
      )}

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
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1 flex flex-col justify-between">
          <div>
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
          <div className="mt-6 text-right">
            <button
              onClick={() => navigate("/counselor/assessments")}
              className="text-sm text-[#BDFCC9] hover:underline"
            >
              View All
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <ul className="space-y-2 text-gray-700">
            <li>✔ Monthly mental health checking</li>
            <li>✔ Safe student forums</li>
          </ul>
        </div>

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
