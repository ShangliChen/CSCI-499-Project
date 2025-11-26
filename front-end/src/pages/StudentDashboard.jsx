import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);


const StudentDashboard = () => {
  const [userName, setUserName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [checkInCompleted, setCheckInCompleted] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleAvailability, setRescheduleAvailability] = useState([]);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTimes, setRescheduleTimes] = useState([]);
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [assessments, setAssessments] = useState([]);
  const baseURL = "http://localhost:5000";
    
  // ✅ 1️⃣ New useEffect for Monthly Check-in tracking
  useEffect(() => {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (!storedUser?.userId) return;

      const currentMonthKey = `${storedUser.userId}-${new Date().getFullYear()}-${new Date().getMonth()}`;
      const storedMonth = localStorage.getItem("checkInCompletedMonth");

      if (storedMonth === currentMonthKey) {
        setCheckInCompleted(true);
      } else {
        setCheckInCompleted(false);
      }
    }, []);


  // ✅ Fetch profile + latest booking
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored?.userId) return;

    setStudentId(stored.userId);

    const fetchUser = async () => {
      try {
        const res = await fetch(`${baseURL}/api/student/profile/${stored.userId}`);
        const data = await res.json();
        if (data.success && data.data) {
          setUserName(data.data.name);
          if (data.data.profilePicture) {
            setProfilePicture(data.data.profilePicture);
          }
        }
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


  useEffect(() => {
  if (!studentId) return; // wait until ID is available

  const fetchAssessments = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/assessments/user/${studentId}`);
      const data = await res.json();

      // your API might return an array directly, not wrapped in { success, data }
      const assessmentsData = Array.isArray(data) ? data : data.data;

      if (Array.isArray(assessmentsData)) {
        const sorted = assessmentsData.sort((a, b) => new Date(a.date_taken) - new Date(b.date_taken));
        setAssessments(sorted);
      }
    } catch (err) {
      console.error("Error fetching assessments:", err);
    }
  };

  fetchAssessments();
}, [studentId]);


  // define miniChartData after assessments are fetched
  const miniChartData = {
      labels: assessments.map(a => new Date(a.date_taken).toLocaleDateString()),
      datasets: [
        {
          label: "Mood Index",
          data: assessments.map(a => a.overall_result),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.3,
        },
      ],
    };

  const hasUpcomingBooking = (() => {
    if (!upcomingBooking || !upcomingBooking.date || !upcomingBooking.time) {
      return false;
    }
    const dateTime = new Date(`${upcomingBooking.date}T${upcomingBooking.time}`);
    if (Number.isNaN(dateTime.getTime())) return false;
    return (
      upcomingBooking.status === "confirmed" &&
      dateTime >= new Date()
    );
  })();

  const startReschedule = async () => {
    if (!upcomingBooking || !upcomingBooking.counselor?._id) return;
    setRescheduleMessage("");
    setRescheduleDate("");
    setRescheduleTime("");
    setRescheduleTimes([]);

    try {
      const res = await fetch(
        `${baseURL}/api/counselor/availability/${upcomingBooking.counselor._id}`
      );
      const data = await res.json();
      if (data.success && Array.isArray(data.availability)) {
        const now = new Date();
        const futureAvailability = data.availability.filter((a) => {
          const d = new Date(a.date);
          return !Number.isNaN(d.getTime()) && d >= now;
        });
        setRescheduleAvailability(futureAvailability);
      } else {
        setRescheduleAvailability([]);
      }
    } catch (err) {
      console.error("❌ Error loading availability for reschedule:", err);
      setRescheduleAvailability([]);
      setRescheduleMessage(
        "Unable to load counselor availability. Please try again later."
      );
    }

    setShowReschedule(true);
  };

  const handleRescheduleDateChange = async (value) => {
    setRescheduleDate(value);
    setRescheduleTime("");
    setRescheduleMessage("");

    const entry = rescheduleAvailability.find((a) => a.date === value);
    const daySlots = Array.isArray(entry?.timeSlots) ? entry.timeSlots : [];

    if (!daySlots.length || !upcomingBooking?.counselor?._id) {
      setRescheduleTimes([]);
      return;
    }

    try {
      const res = await fetch(
        `${baseURL}/api/bookings/booked/${upcomingBooking.counselor._id}/${value}`
      );
      const data = await res.json();
      const booked = Array.isArray(data.bookedTimes) ? data.bookedTimes : [];
      const bookedSet = new Set(booked.map((b) => b.time));
      const available = daySlots.filter((t) => !bookedSet.has(t));
      setRescheduleTimes(available);
    } catch (err) {
      console.error("❌ Error loading booked times for reschedule:", err);
      // Fallback: show all counselor slots for that day
      setRescheduleTimes(daySlots);
    }
  };

  const submitReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleMessage("Please choose a new date and time.");
      return;
    }

    try {
      const res = await fetch(
        `${baseURL}/api/bookings/${upcomingBooking._id}/reschedule`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: rescheduleDate,
            time: rescheduleTime,
            meetingType: upcomingBooking.meetingType,
          }),
        }
      );
      const data = await res.json();
      if (data.success) {
        setUpcomingBooking(data.data);
        setShowReschedule(false);
        setRescheduleMessage("");
      } else {
        setRescheduleMessage(
          data.message || "Unable to reschedule. Please choose another slot."
        );
      }
    } catch (err) {
      console.error("❌ Error rescheduling booking:", err);
      setRescheduleMessage(
        "Server error while rescheduling. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans px-8 py-10">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* LEFT SECTION */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/student/profile/${studentId}`)}
              className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
              title="View Profile"
            >
              {profilePicture ? (
                <img
                  src={`${baseURL}${profilePicture}`}
                  alt="Student profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-700 text-sm font-medium">
                  {(userName && userName.charAt(0).toUpperCase()) || "S"}
                </span>
              )}
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-4xl font-bold text-gray-800">
                Welcome, {userName || "Student"}!
              </h1>
              <button
                onClick={() => navigate(`/student/profile/${studentId}`)}
                className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm font-medium text-gray-800 transition"
                title="Go to Profile"
              >
                Go to Profile
              </button>
            </div>
          </div>

          <p className="text-lg text-gray-600">
            Your space for mental-wellbeing and growth
          </p>

          {/* CARD GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Monthly Check-in */}
            <div
              className={`p-6 rounded-xl shadow hover:shadow-md transition ${
                checkInCompleted ? "bg-white" : "bg-red-50 border border-red-200"
              }`}
            >
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                Monthly Check-in
                {!checkInCompleted && (
                  <span className="text-red-500 text-3xl font-bold animate-pulse" title="Pending">
                    ❗
                  </span>
                )}
              </h2>

              {/* Alert message if not completed */}
              {!checkInCompleted && (
                <p className="text-red-600 text-sm font-medium mb-3 flex items-center gap-2">
                  ⚠️ You need to complete this month’s assessment.
                </p>
              )}

              {/* Buttons */}
              {!checkInCompleted ? (
                <button
                  onClick={() => navigate("/resources/assessment-selection")}
                  className="px-4 py-2 bg-[#ff7f7f] text-white rounded-md font-normal hover:bg-[#ff6666] transition"
                >
                  Start Now
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md font-normal cursor-not-allowed"
                >
                  ✅ Completed for this month
                </button>
              )}
            </div>



            {/* Progress Card */}
            <div
              className="bg-white p-6 rounded-xl shadow hover:shadow-md cursor-pointer transition"
              onClick={() => navigate(`/counselor/user/${studentId}`)}
            >
              <h2 className="text-lg font-semibold mb-3">Your Progress</h2>

              {assessments.length > 0 ? (
                <Line
                  data={{
                    labels: assessments.map(a => new Date(a.date_taken).toLocaleDateString()),
                    datasets: [
                      {
                        label: "Mood Index",
                        data: assessments.map(a => a.overall_result),
                        borderColor: "rgb(75, 192, 192)",
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        tension: 0.3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { display: false },
                      y: { display: false },
                    },
                  }}
                  height={100}
                />
              ) : (
                <p className="text-gray-400 text-sm">No progress data yet</p>
              )}

              <p className="text-sm text-gray-500 mt-2">Mood over time</p>
            </div>



            {/* Safe Student Forums */}
            <div
              className="bg-white p-6 rounded-xl shadow hover:shadow-md cursor-pointer transition"
              onClick={() => navigate("/forum")} 
            >
              <h2 className="text-lg font-semibold mb-3">Safe Student Forums</h2>
              <img
                src="/images/forum.png"
                alt="Student forum"
                className="rounded-lg w-full object-cover"
              />
              <p className="text-sm text-gray-500 mt-2">Connect, share, and grow together.</p>
            </div>


            {/* ✅ UPCOMING BOOKING CONDITION */}
            {hasUpcomingBooking ? (
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

                {/* Meeting info shown if counselor provided */}
                {(upcomingBooking.meetingLink || upcomingBooking.meetingLocation || upcomingBooking.meetingDetails) && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-semibold text-gray-800 mb-1">Meeting Details</p>
                    {upcomingBooking.meetingLink && (
                      <p className="text-sm">
                        Link: {" "}
                        <a
                          href={upcomingBooking.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#2e8b57] underline"
                        >
                          Join Session
                        </a>
                      </p>
                    )}
                    {upcomingBooking.meetingLocation && (
                      <p className="text-sm">Location: {upcomingBooking.meetingLocation}</p>
                    )}
                    {upcomingBooking.meetingDetails && (
                      <p className="text-sm">Notes: {upcomingBooking.meetingDetails}</p>
                    )}
                  </div>
                )}

                {/* Status */}
                <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 
                  rounded-full text-sm font-medium">
                  Status: {upcomingBooking.status}
                </span>

              {/* ✅ Buttons on same line */}
              <div className="mt-4 flex gap-3 flex-wrap">
              <button
                onClick={async () => {
                  if (window.confirm("Cancel this appointment?")) {
                    await fetch(`${baseURL}/api/bookings/${upcomingBooking._id}/cancel`, {
                      method: "PUT",
                    });
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-md font-normal hover:bg-red-600 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => navigate("/student/view-all-appointments")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md font-normal hover:bg-gray-300 transition"
              >
                View All
              </button>
              <button
                onClick={startReschedule}
                className="px-4 py-2 bg-[#98FF98] text-black rounded-md font-normal hover:bg-[#7EE794] transition"
              >
                Change Schedule
              </button>
            </div>
            {showReschedule && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                  Choose a new time for this session
                </h3>
                {rescheduleAvailability.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No future availability found for this counselor.
                  </p>
                ) : (
                  <>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Date
                    </label>
                    <select
                      value={rescheduleDate}
                      onChange={(e) =>
                        handleRescheduleDateChange(e.target.value)
                      }
                      className="w-full border border-gray-300 rounded-md p-2 text-sm mb-3"
                    >
                      <option value="">Select a date</option>
                      {rescheduleAvailability.map((a) => (
                        <option key={a.date} value={a.date}>
                          {new Date(a.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>

                    {rescheduleDate && (
                      <>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Time
                        </label>
                        {rescheduleTimes.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mb-3">
                            {rescheduleTimes.map((time) => (
                              <button
                                key={time}
                                type="button"
                                onClick={() => setRescheduleTime(time)}
                                className={`px-3 py-1 rounded-full border text-xs ${
                                  rescheduleTime === time
                                    ? "bg-[#2e8b57] text-white border-[#2e8b57]"
                                    : "bg-[#d4f8d4] text-gray-800 border-gray-300 hover:bg-[#b6e6b6]"
                                }`}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 mb-3">
                            No available time slots for this date.
                          </p>
                        )}
                      </>
                    )}

                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={submitReschedule}
                        className="px-4 py-2 bg-[#2e8b57] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!rescheduleDate || !rescheduleTime}
                      >
                        Confirm New Time
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReschedule(false);
                          setRescheduleMessage("");
                        }}
                        className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md text-sm hover:bg-gray-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
                {rescheduleMessage && (
                  <p className="mt-2 text-xs text-red-600">{rescheduleMessage}</p>
                )}
              </div>
            )}
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
                <li
                  className="cursor-pointer hover:text-gray-900"
                  onClick={() => navigate("/counselors")}
                >
                  ✅ Find a Counselor
                </li>
                <li
                  className="cursor-pointer hover:text-gray-900"
                  onClick={() => navigate("/student/notifications")}
                >
                  ✅ Notifications
                </li>
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
