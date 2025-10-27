import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentDashboard = () => {
  const [userName, setUserName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [upcomingBooking, setUpcomingBooking] = useState(null);

  const navigate = useNavigate();
  const baseURL = "http://localhost:5000";

  // ✅ Fetch profile + latest booking
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored?.userId) return;

    setStudentId(stored.userId);

    const fetchUser = async () => {
      try {
        const res = await fetch(`${baseURL}/api/student/profile/${stored.userId}`);
        const data = await res.json();
        if (data.success) setUserName(data.data.name);
      } catch (error) {
        console.error("❌ Error fetching profile:", error);
      }
    };

    const fetchLatestBooking = async () => {
      try {
        const res = await fetch(`${baseURL}/api/bookings/student/${stored.userId}`);
        const data = await res.json();

        if (!data.success || !Array.isArray(data.data)) {
          return setUpcomingBooking(null);
        }

        const now = new Date();

        const futureBookings = data.data
          .filter(b => b.status === "confirmed" && new Date(`${b.date}T${b.time}`) >= now)
          .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`));

        setUpcomingBooking(futureBookings[0] || null);
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
      }
    };

    fetchUser();
    fetchLatestBooking();
  }, [studentId]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans px-8 py-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT SECTION */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {userName || "Student"}!
            </h1>
            <button
              onClick={() => navigate(`/student/profile/${studentId}`)}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
              title="View Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-700" fill="none"
                viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M5.121 17.804A9.953 9.953 0 0112 15c2.21 0 4.244.716 5.879 1.921M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </button>
          </div>

          <p className="text-lg text-gray-600">
            Your space for mental-wellbeing and growth
          </p>

          {/* CARD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Monthly Check-in */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
              <h2 className="text-lg font-semibold mb-3">Monthly Check-in</h2>
              <button
                onClick={() => navigate("/resources/assessment-selection")}
                className="px-4 py-2 bg-[#98FF98] text-black rounded-md font-normal hover:bg-[#7EE794]"
              >
                Start Now
              </button>
            </div>

            {/* Progress */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
              <h2 className="text-lg font-semibold mb-3">Your Progress</h2>
              <img src="/images/mood-chart.png" className="rounded" alt="Mood chart" />
              <p className="text-sm text-gray-500 mt-2">Mood over time</p>
            </div>

            {/* Placeholder content */}
            <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
              <h2 className="text-lg font-semibold mb-2">Upcoming Session</h2>
              <p className="text-gray-600">Safe student forums</p>
            </div>

            {/* ✅ UPCOMING BOOKING CONDITION */}
            {upcomingBooking ? (
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
                <h2 className="text-lg font-semibold mb-2">Upcoming Counseling Session</h2>

                <p className="text-gray-700 font-medium">
                  With: {upcomingBooking?.counselor?.name}
                </p>
                <p className="text-gray-600">
                  Date: {new Date(upcomingBooking.date).toLocaleDateString()} &nbsp; 
                  Time: {upcomingBooking.time}
                </p>
                <p className="text-gray-700">
                  Preferred Type: {upcomingBooking.meetingType?.toUpperCase()}
                </p>

                {/* Status */}
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 
                  rounded-full text-sm font-medium">
                  Status: {upcomingBooking.status}
                </span>

                {/* ✅ Cancel */}
                <button
                  onClick={async () => {
                    if (window.confirm("Cancel this appointment?")) {
                      await fetch(`${baseURL}/api/bookings/${upcomingBooking._id}/cancel`, {
                      method: "PUT",
                      });
                      window.location.reload(); // ✅ Refresh to update UI immediately
                    }
                  }}
                  className="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                >
                  Cancel Appointment
                </button>

                {/* ✅ View All */}
                <button
                  onClick={() => navigate("/student/view-all-appointments")}
                  className="mt-3 ml-2 px-3 py-1 bg-[#98FF98] text-black rounded-md 
                    font-normal hover:bg-[#7EE794]"
                >
                  View All
                </button>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md">
                <h2 className="text-lg font-semibold mb-2">No Upcoming Counseling Session</h2>
                <p className="text-gray-600">Book a session to get started.</p>

                <button
                  onClick={() => navigate("/resources/booking")}
                  className="mt-4 px-4 py-2 bg-[#98FF98] text-black rounded-md font-normal hover:bg-[#7EE794]"
                >
                  Book Now
                </button>

                <button
                  onClick={() => navigate("/student/view-all-appointments")}
                  className="mt-4 ml-2 px-4 py-2 bg-[#98FF98] text-black rounded-md font-normal hover:bg-[#7EE794]"
                >
                  View All
                </button>
              </div>
            )}

          </div>
        </div>

        {/* RIGHT SECTION */}
        <div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-md flex flex-col items-center">
            <img
              src="../images/student_dashboard.png"
              className="max-w-full rounded-xl mb-6"
              alt="Student dashboard art"
            />
            <div className="w-full">
              <h2 className="text-lg font-semibold mb-4">Quick Resources</h2>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Find a Counselor</li>
                <li>✅ Coping Techniques</li>
                <li>✅ Read Articles</li>
              </ul>
            </div>
          </div>
        </div>

      </section>

      <footer className="flex justify-between items-center px-4 py-6 text-sm text-gray-500 border-t mt-12">
        <span>© 2025 MindConnect</span>
        <div className="space-x-4">
          <a href="#">Contact</a>
          <a href="#">Privacy Policy</a>
        </div>
      </footer>
    </div>
  );
};

export default StudentDashboard;
