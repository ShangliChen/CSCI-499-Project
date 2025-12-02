import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const [requestNotifications, setRequestNotifications] = useState([]);
  const [assessmentNotifications, setAssessmentNotifications] = useState([]);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const counselorId = user && user.role === "counselor" ? user.userId : null;
  const studentId = user && user.role === "student" ? user.userId : null;

  const sortByNewest = (arr, field = "createdAt") => {
    return arr.sort((a, b) => new Date(b[field]) - new Date(a[field]));
  };

  // Fetch notifications
  useEffect(() => {
    const loadAllNotifications = async () => {
      try {
        if (counselorId) {
          // Counselor Requests
          const reqRes = await fetch(
            `http://localhost:5000/api/counselor-requests/${counselorId}`
          );
          const reqData = await reqRes.json();
          if (reqData.success) {
            setRequestNotifications(sortByNewest(reqData.requests, "createdAt"));
          }

          // Assessment Notifications
          const assessRes = await fetch(
            "http://localhost:5000/api/assessments/notifications"
          );
          const assessData = await assessRes.json();
          setAssessmentNotifications(sortByNewest(assessData, "date"));
        } else if (studentId) {
          // Student Notifications
          const res = await fetch(
            `http://localhost:5000/api/assessments/notifications/student/${studentId}`
          );
          const data = await res.json();
          if (data.success && Array.isArray(data.data)) {
            setStudentNotifications(sortByNewest(data.data, "date"));
          } else {
            setStudentNotifications([]);
          }
        }
      } catch (err) {
        console.error("Error loading notifications:", err);
      }
    };

    loadAllNotifications();
  }, [counselorId, studentId]);

  // Handle accept/reject
  const handleRequestAction = async (requestId, action) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/counselor-requests/${requestId}/${action}`,
        { method: "PUT" }
      );
      const data = await res.json();
      if (data.success) {
        // Update the local state
        setRequestNotifications((prev) =>
          prev.map((r) =>
            r._id === requestId ? { ...r, status: action } : r
          )
        );
      }
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
    }
  };

// ==================== COUNSELOR VIEW ====================
if (counselorId) {
  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Notifications
      </h2>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Box: Student Requests */}
        <div className="flex-1 max-w-md bg-[#f0fff0] shadow-md p-4 flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Student Requests</h3>
          {requestNotifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No student requests yet.</p>
          ) : (
            <div className="overflow-y-auto max-h-[500px]">
              {requestNotifications.map((req) => (
                <div
                  key={req._id}
                  onClick={() =>
                    navigate(`/counselor/user/${req.studentId?._id}`)
                  }
                  className="p-3 border-b last:border-none bg-[#f0fff0] mb-3 rounded-lg cursor-pointer hover:bg-[#e0ffe0] transition"
                >
                  <div className="font-semibold text-gray-800 text-sm">
                    {req.studentId?.name}
                  </div>
                  <div className="text-gray-600 text-xs">
                    School ID: {req.studentId?.school_id}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Requested on: {new Date(req.createdAt).toLocaleString()}
                  </div>

                  <div className="mt-3 text-sm">
                    Status: <span className="font-medium">{req.status}</span>
                  </div>

                  {req.status === "pending" && (
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(req._id, "accepted");
                        }}
                        className="px-2 py-1 text-xs bg-[#b3e6b3] text-white rounded hover:bg-green-600"
                      >
                        Accept
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRequestAction(req._id, "rejected");
                        }}
                        className="px-2 py-1 text-xs bg-[#ff7f7f] text-white rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Box: Assessment Notifications */}
        <div className="flex-1 max-w-md bg-[#f0fff0] shadow-md p-4 flex flex-col">
          <h3 className="text-lg font-semibold mb-3">Assessment Notifications</h3>
          {assessmentNotifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No assessment notifications.</p>
          ) : (
            <div className="overflow-y-auto max-h-[500px]">
              {assessmentNotifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => navigate(`/counselor/user/${n.student?._id}`)}
                  className="p-2 border-b last:border-none cursor-pointer hover:bg-[#e0ffe0] transition"
                >
                  <div className="font-semibold text-gray-800 text-sm">
                    {n.student?.name || "Unknown Student"}
                  </div>
                  <div className="text-gray-600 text-xs">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(n.date).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


  // ==================== STUDENT VIEW ====================
  if (studentId) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] p-8">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Notifications
        </h2>

        {studentNotifications.length === 0 ? (
          <p className="text-gray-500 text-sm">
            You have no notifications yet.
          </p>
        ) : (
          <div className="bg-white shadow-md rounded-xl p-6 max-w-3xl">
            {studentNotifications.map((n) => (
              <div
                key={n._id}
                className="p-3 border-b last:border-none hover:bg-gray-50 transition"
              >
                <div className="text-gray-700 text-sm">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {new Date(n.date).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback if no user
  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      <p className="text-gray-600">Please log in to view notifications.</p>
    </div>
  );
};

export default NotificationPage;
