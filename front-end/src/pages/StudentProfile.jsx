import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";
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

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState("");
  const [assessments, setAssessments] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [counselorRequest, setCounselorRequest] = useState(null);
  const [preferences, setPreferences] = useState({
    notifications: true,
    darkMode: false,
    sessionReminders: true,
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const baseURL = API_BASE_URL;

  useEffect(() => {
    const storedPrefs = localStorage.getItem(`studentProfilePrefs_${id}`);
    if (storedPrefs) {
      try {
        setPreferences(JSON.parse(storedPrefs));
      } catch {
        // ignore malformed data
      }
    }

    const fetchAll = async () => {
      try {
        const [
          profileRes,
          assessmentsRes,
          bookingsRes,
          requestRes,
        ] = await Promise.all([
          axios.get(`${baseURL}/api/student/profile/${id}`),
          axios.get(`${baseURL}/api/assessments/user/${id}`),
          axios.get(`${baseURL}/api/bookings/student/${id}`),
          axios.get(`${baseURL}/api/counselor-requests/student/${id}`),
        ]);

        const profileData = profileRes.data.data;
        setStudent(profileData);
        setFormData({
          name: profileData.name || "",
          email: profileData.email || "",
          phoneNumber: profileData.phoneNumber || "",
          bio: profileData.bio || "",
          address: profileData.address || "",
          dob: profileData.dob ? profileData.dob.split("T")[0] : "",
        });

        const assessmentsData = Array.isArray(assessmentsRes.data)
          ? assessmentsRes.data
          : assessmentsRes.data.data || [];
        const sortedAssessments = assessmentsData.sort(
          (a, b) => new Date(a.date_taken) - new Date(b.date_taken)
        );
        setAssessments(sortedAssessments);

        const bookingsData = Array.isArray(bookingsRes.data?.data)
          ? bookingsRes.data.data
          : [];
        setBookings(bookingsData);

        if (requestRes.data?.success) {
          setCounselorRequest(requestRes.data.request || null);
        } else {
          setCounselorRequest(null);
        }
      } catch (err) {
        console.error(err);
        setError("Error loading profile details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${baseURL}/api/student/profile/${id}`, formData);
      setMessage(res.data.message);
    } catch (err) {
      console.error(err);
      setMessage("Error updating profile");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!profilePic) return;
    const data = new FormData();
    data.append("profilePicture", profilePic);
    try {
      const res = await axios.post(`${baseURL}/api/student/upload-profile-pic/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(res.data.message);
      setStudent(prev => ({ ...prev, profilePicture: res.data.imagePath }));
    } catch (err) {
      console.error(err);
      setMessage("Error uploading picture");
    }
  };

  const handlePreferenceToggle = (key) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem(
        `studentProfilePrefs_${id}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage("❌ New password and confirmation do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage("❌ New password must be at least 6 characters.");
      return;
    }
    try {
      const res = await axios.post(
        `${baseURL}/api/users/${id}/change-password`,
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }
      );
      if (res.data.success) {
        setMessage("✅ Password updated successfully.");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      } else {
        setMessage(res.data.message || "❌ Failed to update password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const serverMessage =
        error.response?.data?.message ||
        "❌ Server error while changing password.";
      setMessage(serverMessage);
    }
  };

  const upcomingBookings = bookings
    .filter(b => b.status === "confirmed")
    .map(b => ({
      ...b,
      dateTime: new Date(`${b.date}T${b.time}`),
    }))
    .filter(b => !Number.isNaN(b.dateTime.getTime()) && b.dateTime >= new Date())
    .sort((a, b) => a.dateTime - b.dateTime);

  const nextBooking = upcomingBookings[0] || null;

  const pastBookings = bookings
    .filter(b => b.status === "confirmed")
    .map(b => ({
      ...b,
      dateTime: new Date(`${b.date}T${b.time}`),
    }))
    .filter(b => !Number.isNaN(b.dateTime.getTime()) && b.dateTime < new Date())
    .sort((a, b) => b.dateTime - a.dateTime);

  const lastBooking = pastBookings[0] || null;

  const totalSessions = bookings.filter(b => b.status !== "canceled").length;

  const miniChartData = {
    labels: assessments.map(a =>
      new Date(a.date_taken).toLocaleDateString()
    ),
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

  const latestAssessment = assessments[assessments.length - 1];

  const assignedCounselor =
    counselorRequest?.status === "accepted" ? counselorRequest.counselor : null;
  const hasPendingRequest = counselorRequest?.status === "pending";

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        {error}
      </div>
    );
  }

  if (!student) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Student profile not found.
      </p>
    );
  }

  return (
      <div className="min-h-screen bg-[#f5f5f5] py-10 px-4">
        <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden mx-auto mb-4">
                {student.profilePicture ? (
                  <img
                    src={`${baseURL}${student.profilePicture}`}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                    No Image
                  </div>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-800">{formData.name}</h2>
              <p className="text-sm text-gray-500">{formData.email}</p>

              <form onSubmit={handleUpload} className="mt-4 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files[0])}
                  className="block w-full text-sm text-gray-700 mb-2"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg"
                >
                  Upload Photo
                </button>
              </form>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <h3 className="font-semibold text-gray-800 mb-3">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => navigate("/dashboard/student")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 rounded-lg"
                >
                  Back to Dashboard
                </button>
                <button
                  onClick={() => navigate("/student/view-all-appointments")}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg"
                >
                  View All Appointments
                </button>
              </div>
            </div>

            {/* Counselor Card */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e5f4f2] flex items-center justify-center text-4xl">
                👩‍⚕️
              </div>
              {assignedCounselor ? (
                <>
                  <h3 className="font-semibold text-gray-800">
                    {assignedCounselor.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {Array.isArray(assignedCounselor.specialization) &&
                    assignedCounselor.specialization.length > 0
                      ? assignedCounselor.specialization.join(", ")
                      : "Counselor"}
                  </p>
                  {assignedCounselor.email && (
                    <p className="mt-1 text-xs text-gray-500">
                      {assignedCounselor.email}
                    </p>
                  )}
                </>
              ) : hasPendingRequest ? (
                <>
                  <h3 className="font-semibold text-gray-800">
                    Counselor Request Pending
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Waiting for{" "}
                    <span className="font-medium">
                      {counselorRequest?.counselor?.name || "counselor"}
                    </span>{" "}
                    to accept your request.
                  </p>
                  <button
                    onClick={() => navigate("/counselors")}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg"
                  >
                    View Counselors
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-gray-800">
                    No Counselor Assigned
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Choose a counselor to work with you.
                  </p>
                  <button
                    onClick={() => navigate("/counselors")}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg"
                  >
                    Find a Counselor
                  </button>
                </>
              )}
            </div>
          </div>

          {/* CENTER COLUMN */}
          <div className="space-y-6">
            {/* Account Details */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Account Details</h3>
              <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  placeholder="Full Name"
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md"
                />
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  placeholder="Phone Number"
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md"
                />
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md"
                />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  placeholder="Address"
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md"
                />
                <textarea
                  name="bio"
                  value={formData.bio}
                  placeholder="Short Bio"
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-md"
                  rows="3"
                />
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
                >
                  Save Changes
                </button>
              </form>

              {message && (
                <p className="mt-4 text-sm text-green-600 text-center">{message}</p>
              )}
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Security</h3>
                <button
                  onClick={() => setShowPasswordForm(prev => !prev)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {showPasswordForm ? "Cancel" : "Change Password"}
                </button>
              </div>
              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="space-y-3">
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Current Password"
                    className="border border-gray-300 p-2 rounded-md w-full text-sm"
                  />
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="New Password"
                    className="border border-gray-300 p-2 rounded-md w-full text-sm"
                  />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    placeholder="Confirm New Password"
                    className="border border-gray-300 p-2 rounded-md w-full text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md w-full text-sm"
                  >
                    Save New Password
                  </button>
                </form>
              )}
            </div>

            {/* App Preferences */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">App Preferences</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex justify-between items-center">
                  <span>Notifications Enabled</span>
                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle("notifications")}
                    className={`w-10 h-5 rounded-full flex items-center ${
                      preferences.notifications
                        ? "bg-blue-500 justify-end"
                        : "bg-gray-300 justify-start"
                    }`}
                  >
                    <span className="bg-white w-4 h-4 rounded-full mx-1 shadow" />
                  </button>
                </li>
                <li className="flex justify-between items-center">
                  <span>Session Reminders</span>
                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle("sessionReminders")}
                    className={`w-10 h-5 rounded-full flex items-center ${
                      preferences.sessionReminders
                        ? "bg-blue-500 justify-end"
                        : "bg-gray-300 justify-start"
                    }`}
                  >
                    <span className="bg-white w-4 h-4 rounded-full mx-1 shadow" />
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Activity Overview Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Activity Overview</h3>
              {assessments.length > 0 ? (
                <Line
                  data={miniChartData}
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
                <p className="text-sm text-gray-500 mt-2 text-center">
                  No assessment data yet.
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2 text-center">
                Mood assessments over time
              </p>
            </div>

            {/* Activity Stats */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Total Sessions: {totalSessions}</li>
                <li>
                  ✓ Upcoming Session:{" "}
                  {nextBooking
                    ? `${nextBooking.dateTime.toLocaleDateString()} at ${
                        nextBooking.time
                      }`
                    : "None"}
                </li>
                <li>
                  ✓ Last Session:{" "}
                  {lastBooking
                    ? `${lastBooking.dateTime.toLocaleDateString()} at ${
                        lastBooking.time
                      }`
                    : "No past sessions"}
                </li>
                <li>
                  ✓ Latest Assessment:{" "}
                  {latestAssessment
                    ? `${new Date(
                        latestAssessment.date_taken
                      ).toLocaleDateString()} — Score ${
                        latestAssessment.overall_result
                      } (${latestAssessment.overall_status})`
                    : "Not available"}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-gray-500 w-full">
          <div className="flex justify-between max-w-6xl mx-auto border-t pt-6 px-4">
            <span>© 2025 MindConnect</span>
            <div className="space-x-4">
              <a href="#" className="hover:underline">Contact</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
            </div>
          </div>
        </footer>
      </div>
    );

};

export default StudentProfile;
