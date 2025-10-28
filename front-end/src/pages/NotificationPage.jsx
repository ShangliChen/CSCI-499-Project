import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllNotifications = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/assessments/notifications");
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Error fetching all notifications:", err);
      }
    };
    fetchAllNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">All Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications yet.</p>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-6 max-w-3xl">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => navigate(`/counselor/user/${n.student?._id}`)}
              className="p-3 border-b last:border-none cursor-pointer hover:bg-gray-50 transition"
            >
              <div className="font-semibold text-gray-800">
                {n.student?.name || "Unknown Student"}
              </div>
              <div className="text-gray-600 text-sm">{n.message}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(n.date).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
