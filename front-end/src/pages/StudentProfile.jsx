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
import { 
  ChevronDown, 
  ChevronUp, 
  Settings, 
  User, 
  Lock, 
  Bell, 
  BarChart3, 
  Calendar,
  Activity,
  ArrowLeft
} from "lucide-react";

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
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    account: true,
    security: false,
    preferences: false,
    activity: true,
    counselor: true
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
    
    
    // Compute min and max dates
    const today = new Date();
    const maxDOB = new Date();
    maxDOB.setFullYear(today.getFullYear() - 5); // Student must be at least 5
    const minDOB = new Date();
    minDOB.setFullYear(today.getFullYear() - 100); // Student max 100 years old

    // Function to validate DOB
    const [dobWarning, setDobWarning] = useState("");

    const handleDobChange = (e) => {
      const value = e.target.value;
      setFormData(prev => ({ ...prev, dob: value }));

      const selectedDate = new Date(value);
      if (selectedDate > maxDOB) {
        setDobWarning("Date of birth cannot be less than 5 years ago.");
      } else if (selectedDate < minDOB) {
        setDobWarning("Date of birth cannot be more than 100 years ago.");
      } else {
        setDobWarning("");
      }
    };



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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${baseURL}/api/student/profile/${id}`, formData);
      setMessage(res.data.message);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error updating profile");
      setTimeout(() => setMessage(""), 3000);
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
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error uploading picture");
      setTimeout(() => setMessage(""), 3000);
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
      setTimeout(() => setMessage(""), 3000);
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setMessage("❌ New password must be at least 6 characters.");
      setTimeout(() => setMessage(""), 3000);
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
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(res.data.message || "❌ Failed to update password.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      const serverMessage =
        error.response?.data?.message ||
        "❌ Server error while changing password.";
      setMessage(serverMessage);
      setTimeout(() => setMessage(""), 3000);
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
      {/* Header with Back Button */}
      <div className="max-w-screen-2xl mx-auto mb-6">
        <button
          onClick={() => navigate("/dashboard/student")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Profile Card - Expandable */}
          <div className="bg-white rounded-xl shadow">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('profile')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Profile</h3>
              </div>
              {expandedSections.profile ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {expandedSections.profile && (
              <div className="px-6 pb-6">
                <div className="text-center">
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
                </div>

                <form onSubmit={handleUpload} className="mt-4">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Update Profile Picture
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProfilePic(e.target.files[0])}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition-colors"
                  >
                    Upload Photo
                  </button>
                </form>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate("/student/view-all-appointments")}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 rounded-lg transition-colors"
                    >
                      View All Appointments
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                  onChange={handleDobChange}
                  className="border border-gray-300 p-2 rounded-md"
                  min={minDOB.toISOString().split("T")[0]}
                  max={maxDOB.toISOString().split("T")[0]}
                />
                {dobWarning && (
                  <p className="text-red-600 text-sm mt-1">{dobWarning}</p>
                )}

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
          </div>

          {/* Counselor Card - Expandable */}
          <div className="bg-white rounded-xl shadow">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('counselor')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <User size={20} className="text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Counselor</h3>
              </div>
              {expandedSections.counselor ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {expandedSections.counselor && (
              <div className="px-6 pb-6 text-center">
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
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
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
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Find a Counselor
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CENTER COLUMN */}
        <div className="space-y-6">
          {/* Account Details - Expandable */}
          <div className="bg-white rounded-xl shadow">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('account')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Settings size={20} className="text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Account Details</h3>
              </div>
              {expandedSections.account ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {expandedSections.account && (
              <div className="px-6 pb-6">
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                      rows="3"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-md font-medium transition-colors"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Security - Expandable */}
          <div className="bg-white rounded-xl shadow">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('security')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Lock size={20} className="text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Security</h3>
              </div>
              {expandedSections.security ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {expandedSections.security && (
              <div className="px-6 pb-6">
                <div className="mb-6">
                  <button
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                    className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <span className="font-medium text-gray-700">Change Password</span>
                    <ChevronDown size={18} className={`transform transition-transform ${showPasswordForm ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showPasswordForm && (
                    <form onSubmit={handleChangePassword} className="mt-4 space-y-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full border border-gray-300 p-2 rounded-md text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordForm.newPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full border border-gray-300 p-2 rounded-md text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordForm.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className="w-full border border-gray-300 p-2 rounded-md text-sm"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md text-sm"
                      >
                        Save New Password
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* App Preferences - Expandable */}
          <div className="bg-white rounded-xl shadow">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('preferences')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Bell size={20} className="text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">App Preferences</h3>
              </div>
              {expandedSections.preferences ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {expandedSections.preferences && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell size={18} className="text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-700">Notifications</p>
                        <p className="text-sm text-gray-500">Get notified about sessions and updates</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePreferenceToggle("notifications")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.notifications ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-700">Session Reminders</p>
                        <p className="text-sm text-gray-500">Remind before counseling sessions</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handlePreferenceToggle("sessionReminders")}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.sessionReminders ? 'bg-blue-500' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences.sessionReminders ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          {/* Activity Overview - Expandable */}
          <div className="bg-white rounded-xl shadow">
            <div 
              className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleSection('activity')}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <BarChart3 size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Activity Overview</h3>
              </div>
              {expandedSections.activity ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            {expandedSections.activity && (
              <div className="px-6 pb-6">
                {/* Chart Section */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Mood Trend</h4>
                  {assessments.length > 0 ? (
                    <div className="h-48">
                      <Line
                        data={miniChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { 
                              display: true,
                              ticks: { font: { size: 10 } }
                            },
                            y: { 
                              display: true,
                              ticks: { font: { size: 10 } }
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">
                        No assessment data available yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats Section */}
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity size={16} className="text-blue-600" />
                      <h5 className="font-medium text-blue-800">Activity Stats</h5>
                    </div>
                    <ul className="text-sm text-gray-700 space-y-2">
                      <li className="flex justify-between">
                        <span>Total Sessions</span>
                        <span className="font-medium">{totalSessions}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Upcoming Session</span>
                        <span className="font-medium">
                          {nextBooking
                            ? `${nextBooking.dateTime.toLocaleDateString()}`
                            : "None"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Last Session</span>
                        <span className="font-medium">
                          {lastBooking
                            ? `${lastBooking.dateTime.toLocaleDateString()}`
                            : "None"}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span>Latest Assessment</span>
                        <span className="font-medium">
                          {latestAssessment
                            ? `Score: ${latestAssessment.overall_result}`
                            : "N/A"}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg animate-fadeIn">
          {message}
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
