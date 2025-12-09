import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";

const CounselorDashboard = () => {
  const [userName, setUserName] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [counselorCapacity, setCounselorCapacity] = useState(0);
  const [assignedCount, setAssignedCount] = useState(0);
  const [newCapacity, setNewCapacity] = useState("");
  const [dailyChecklist, setDailyChecklist] = useState({
    notifications: false,
    appointments: false,
    forum: false,
  });
  const navigate = useNavigate();

  // Format date & time nicely (e.g., Tuesday, Feb 12 at 2:30 PM)
  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString("en-US", {
      weekday: "long",   // Monday, Tuesday...
      month: "short",    // Jan, Feb, Mar...
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,      // AM/PM
    });
  };
    
  // Handler for toggling a checklist item
  const toggleChecklistItem = (item) => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (!userData || !userData.userId) return;

    const key = `dailyChecklist_${userData.userId}`;

    setDailyChecklist((prev) => {
      const updated = { ...prev, [item]: !prev[item] };
      const today = new Date().toISOString().split("T")[0];
      localStorage.setItem(
        key,
        JSON.stringify({ date: today, checklist: updated })
      );
      return updated;
    });
  };



  // Fetch user and notifications
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));

    if (!userData || userData.role !== "counselor") {
      navigate("/login/counselor");
    } else {
      setUserName(userData.name || "Counselor");

      // ✅ Fetch counselor profile to get latest profile picture
      axios
        .get(`${API_BASE_URL}/api/counselor/profile/${userData.userId}`)
        .then((res) => {
          if (res.data?.success && res.data.data?.profilePicture) {
            setProfilePicture(res.data.data.profilePicture);
          }
        })
        .catch((err) =>
          console.error("Error fetching counselor profile for dashboard:", err)
        );

      // ✅ Fetch notifications
      axios
        .get(`${API_BASE_URL}/api/assessments/notifications/recent`)
        .then((res) => {
          console.log("Notifications from backend:", res.data);
          const data = res.data.map((n) => ({ ...n, read: n.read || false }));
          setNotifications(data);
        })
        .catch((err) => console.error("Error fetching notifications:", err));

      // ✅ Fetch counselor's appointments
      axios
        .get(`${API_BASE_URL}/api/bookings/counselor/${userData.userId}`)
        .then((res) => {
          if (res.data.success) {
            // 🔥 Filter out canceled appointments
            const activeAppointments = res.data.data.filter(
              (a) => a.status !== "canceled"
            );
            setAppointments(activeAppointments);
          }
        })

        .catch((err) =>
          console.error("Error fetching counselor appointments:", err)
        );
        
        
        const fetchAssignedStudents = async () => {
          try {
            const counselorId = userData.userId;
            const res = await fetch(
              `http://localhost:5000/api/counselor-requests/assigned/${counselorId}`
            );
            const data = await res.json();
            setAssignedStudents(data.students || []);
          } catch (err) {
            console.error("Error fetching assigned students:", err);
          }
        };
        fetchAssignedStudents();
        
        
        
    }
  }, [navigate]);
    
    
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.userId) return;

      const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      const key = `dailyChecklist_${userData.userId}`;
      const savedData = JSON.parse(localStorage.getItem(key)) || {};

      if (savedData.date === today && savedData.checklist) {
        setDailyChecklist(savedData.checklist);
      } else {
        const resetChecklist = {
          notifications: false,
          appointments: false,
          forum: false,
        };
        setDailyChecklist(resetChecklist);
        localStorage.setItem(key, JSON.stringify({ date: today, checklist: resetChecklist }));
      }
    }, []);
    
    useEffect(() => {
      const fetchCapacity = async () => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData || !userData.userId) return;

        try {
          const res = await axios.get(
            `${baseURL}/api/counselor-requests/capacity/${userData.userId}`
          );
          if (res.data.success) {
            setCounselorCapacity(res.data.capacity);
            setAssignedCount(res.data.assignedCount);
            setNewCapacity(res.data.capacity); // default input value
          }
        } catch (err) {
          console.error("Error fetching counselor capacity:", err);
        }
      };

      fetchCapacity();
    }, [assignedStudents]); // update if assignedStudents changes



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
        await axios.post(`${API_BASE_URL}/api/assessments/notifications/${notifId}/read`);

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

  // Derive upcoming (future) appointments from all non-canceled ones
  const upcomingAppointments = (() => {
    if (!Array.isArray(appointments)) return [];
    const now = new Date();
    return appointments
      .map((a) => ({
        ...a,
        dateTime: new Date(`${a.date}T${a.time}`),
      }))
      .filter(
        (a) =>
          a.status === "confirmed" &&
          a.dateTime instanceof Date &&
          !Number.isNaN(a.dateTime.getTime()) &&
          a.dateTime >= now
      )
      .sort((a, b) => a.dateTime - b.dateTime);
  })();

  // Derive "My Students" from all non-canceled appointments (most recent first)
  const myStudents = (() => {
    if (!Array.isArray(appointments)) return [];

    const byStudent = new Map();

    appointments.forEach((a) => {
      const student = a.student;
      if (!student || !student._id || !a.date || !a.time) return;

      const dateTime = new Date(`${a.date}T${a.time}`);
      if (Number.isNaN(dateTime.getTime())) return;

      const key = String(student._id);
      const existing = byStudent.get(key);

      if (!existing || dateTime > existing.lastDateTime) {
        byStudent.set(key, {
          studentId: student._id,
          name: student.name || "Student",
          email: student.email || "",
          lastDateTime: dateTime,
        });
      }
    });

    return Array.from(byStudent.values())
      .sort((a, b) => b.lastDateTime - a.lastDateTime)
      .slice(0, 5);
  })();
    
    
  // Handler for updating capacity
    const handleUpdateCapacity = async () => {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (!userData || !userData.userId) return;

      const capacityNum = parseInt(newCapacity);
      if (isNaN(capacityNum) || capacityNum < 1) {
        alert("Capacity must be a number greater than or equal to 1.");
        return;
      }

      if (capacityNum < assignedCount) {
        alert(
          `Cannot set capacity below the number of assigned students (${assignedCount}).`
        );
        return;
      }

      try {
        const res = await axios.put(
          `${baseURL}/api/counselor-requests/counselor/${userData.userId}/capacity`,
          { capacity: capacityNum }
        );
        if (res.data.success) {
          setCounselorCapacity(capacityNum);
          alert(`Capacity updated to ${capacityNum}`); // optional notification
        }
      } catch (err) {
        console.error("Error updating capacity:", err);
        alert("Failed to update capacity. Try again later.");
      }
    };

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      {/* Welcome */}
      <section className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {profilePicture && (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                <img
                  src={`${API_BASE_URL}${profilePicture}`}
                  alt="Counselor"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome, {userName}!
            </h2>
            <button
              onClick={goToProfile}
              className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium text-gray-800 transition"
              title="Go to Profile"
            >
              Go to Profile
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
        {/* ✅ Upcoming Appointments */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3 className="text-lg font-semibold mb-4">Upcoming Appointments</h3>

          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-600">No upcoming appointments.</p>
          ) : (
            <>
          {upcomingAppointments.slice(0, 3).map((a) => (
            <div key={a._id} className="border-b border-gray-200 py-2">
              <p className="font-medium text-gray-800">
                {a.student?.name || "Student"}
              </p>
              <p className="text-sm text-gray-600">
                🗓️ {formatDateTime(a.date, a.time)} –{" "}
                {a.endTime || "1 hour session"}
              </p>
              <p className="text-sm text-gray-700">
                Email: {a.student?.email || "N/A"}
              </p>
              <p className="text-sm text-gray-700">
                Note: {a.note || "No note provided"}
              </p>
              {a.student?.dob && (
                <p className="text-sm text-gray-700">
                  Age: {new Date().getFullYear() - new Date(a.student.dob).getFullYear()} yrs
                </p>
              )}
              <p className="text-sm text-gray-500 capitalize">
                Type: {a.meetingType}
              </p>
            </div>
          ))}


            {appointments.length > 0 && (
              <button
                onClick={() => navigate("/counselor/view-all-appointments")}
                className="mt-4 w-full bg-[#2e8b57] text-white py-2 rounded hover:bg-[#267349]"
              >
                View All Appointments
              </button>
            )}
            </>
          )}
        </div>


     {/* Students from Recent Appointments— now in 2nd box */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4">Students from Recent Appointments</h3>
            {myStudents.length === 0 ? (
              <p className="text-sm text-gray-500">
                Students you meet with will appear here.
              </p>
            ) : (
              <ul className="space-y-4">
                {myStudents.map((s) => (
                  <li
                    key={s.studentId}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                        {(s.name && s.name.charAt(0).toUpperCase()) || "S"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {s.name}
                        </div>
                        {s.email && (
                          <div className="text-xs text-gray-500">
                            {s.email}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => navigate(`/counselor/user/${s.studentId}`)}
                      className="text-[#2e8b57] text-sm font-medium hover:underline"
                    >
                      View Details
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={() => navigate("/counselor/view-all-appointments")}
              className="text-sm text-[#2e8b57] hover:underline"
            >
              View All Appointments
            </button>
          </div>
        </div>

        {/* My Students — 3rd Box with assigned students */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-4">My Students</h3>

            {assignedStudents.length === 0 ? (
              <p className="text-sm text-gray-500">No assigned students found.</p>
            ) : (
              <ul className="space-y-3">
                {assignedStudents.slice(0, 3).map((s) => (
                  <li
                    key={s._id}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium text-gray-700">
                      {(s.name && s.name.charAt(0).toUpperCase()) || "S"}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {s.name}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 text-right">
            <button
              onClick={() => navigate("/counselor/assessments")}
              className="text-sm text-[#2e8b57] hover:underline"
            >
              View All Students
            </button>
          </div>
        </div>

{/* Update Counselor Capacity */}
<div className="bg-white p-6 rounded-xl shadow-md col-span-1">
  <h3 className="text-lg font-semibold mb-4">Update My Capacity</h3>
  <p className="text-sm text-gray-600 mb-2">
    Current capacity: <strong>{counselorCapacity}</strong>
  </p>
  <p className="text-sm text-gray-600 mb-4">
    Assigned students: <strong>{assignedCount}</strong>
  </p>

  {/* Capacity Progress Bar */}
  <div className="mt-4">
    <p className="text-sm text-gray-600 mb-1">
      Capacity Usage: {assignedCount}/{counselorCapacity}
    </p>

    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-[#2e8b57] h-3 rounded-full transition-all duration-300"
        style={{ width: `${(assignedCount / counselorCapacity) * 100}%` }}
      ></div>
    </div>
  </div>

  <div className="flex items-center space-x-2 mt-4">
    <input
      type="number"
      min={assignedCount || 1}
      value={newCapacity}
      onChange={(e) => setNewCapacity(e.target.value)}
      className="border border-gray-300 rounded px-2 py-1 w-24"
    />
    <button
      onClick={handleUpdateCapacity}
      className="bg-[#2e8b57] text-white px-3 py-1 rounded hover:bg-[#267349]"
    >
      Update
    </button>
  </div>

  {assignedCount > 0 && (
    <p className="text-xs text-gray-500 mt-2">
      Capacity cannot be lower than assigned students.
    </p>
  )}
</div>

          
          
          
        {/*Daily Checklist */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3
            className={`text-lg font-semibold mb-4 ${
              Object.values(dailyChecklist).every(Boolean) ? "text-gray-800" : "text-[#ff7f7f]"
            }`}
          >
            Daily Checklist
          </h3>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dailyChecklist.notifications}
                onChange={() => toggleChecklistItem("notifications")}
              />
              <label
                className="cursor-pointer hover:text-green-700"
                onClick={() => navigate("/counselor/notifications")}
              >
                Check Notifications (Severe Cases)
              </label>
            </li>

            <li className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dailyChecklist.appointments}
                onChange={() => toggleChecklistItem("appointments")}
              />
              <label
                className="cursor-pointer hover:text-green-700"
                onClick={() => navigate("/counselor/view-all-appointments")}
              >
                Review Appointments
              </label>
            </li>

            <li className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={dailyChecklist.forum}
                onChange={() => toggleChecklistItem("forum")}
              />
              <label
                className="cursor-pointer hover:text-green-700"
                onClick={() => navigate("/forum")}
              >
                Check Forum Posts
              </label>
            </li>
          </ul>
        </div>
          
        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-md col-span-1">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <ul className="space-y-2 text-gray-700">
            <li
              className="cursor-pointer hover:text-[#2e8b57]"
              onClick={() => navigate("/counselor/assessments")}
            >
              ✔ Monthly Mental Health Checking
            </li>
            <li
              className="cursor-pointer hover:text-[#2e8b57]"
              onClick={() => navigate("/forum")}
            >
              ✔ Safe Student Forums
            </li>
          </ul>
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
