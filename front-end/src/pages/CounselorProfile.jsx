import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CounselorProfile = () => {
  const { id } = useParams();
  const [counselor, setCounselor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    license: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTime, setNewTime] = useState("");
  const [message, setMessage] = useState("");
  const [availability, setAvailability] = useState([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedAvailDate, setSelectedAvailDate] = useState("");
  const baseURL = "http://localhost:5000";

  // Preset half‑hour time slots from 9:00–17:00
  const presetSlots = [
    "09:00", "09:30",
    "10:00", "10:30",
    "11:00", "11:30",
    "12:00", "12:30",
    "13:00", "13:30",
    "14:00", "14:30",
    "15:00", "15:30",
    "16:00", "16:30",
    "17:00",
  ];

  // Generate calendar grid for a given month
  const generateCalendar = (monthDate) => {
    const currentMonth = monthDate.getMonth();
    const currentYear = monthDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const cells = [];

    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }

    const totalCells = 42;
    const nextMonthDays = totalCells - cells.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  };

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const fetchAvailability = async () => {
    try {
      const res = await axios.get(
        `${baseURL}/api/counselor/availability/${id}`
      );
      if (res.data?.success && Array.isArray(res.data.availability)) {
        setAvailability(res.data.availability);
      } else {
        setAvailability([]);
      }
    } catch (error) {
      console.error("Failed to fetch counselor availability:", error);
      setAvailability([]);
    }
  };

  // ✅ Fetch counselor profile + availability
  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/counselor/profile/${id}`);
        const data = res.data.data;
        setCounselor(data);
        setProfileForm({
          name: data.name || "",
          email: data.email || "",
          license: data.license || "",
        });
      } catch (error) {
        console.error("Failed to fetch counselor profile:", error);
      }
    };

    fetchCounselorProfile();
    fetchAvailability();
  }, [id]);

  // ✅ Save availability
  const saveAvailability = async () => {
  if (!selectedDate || timeSlots.length === 0) {
    alert("Please select a date and at least one time slot.");
    return;
  }

  try {
    const res = await axios.post(`${baseURL}/api/counselor/availability`, {
      counselorId: id,
      date: selectedDate,
      timeSlots, // ✅ send plain array of strings
    });

    if (res.data.success) {
      setMessage("✅ Availability saved successfully!");
      setIsEditing(false);
      setSelectedDate("");
      setTimeSlots([]);
      setNewTime("");
      // Refresh calendar availability
      fetchAvailability();
    } else {
      setMessage("❌ Failed to save availability.");
    }
  } catch (error) {
    console.error("Error saving availability:", error);
    setMessage("❌ Error saving schedule. Please try again.");
  }
};


  // ✅ Add or remove time slots
  const addTimeSlot = () => {
    if (newTime && !timeSlots.includes(newTime)) {
      setTimeSlots([...timeSlots, newTime]);
      setNewTime("");
    }
  };
  const removeTimeSlot = (time) => {
    setTimeSlots(timeSlots.filter((t) => t !== time));
  };

  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadProfilePic = async (e) => {
    e.preventDefault();
    if (!profilePic) return;

    const data = new FormData();
    data.append("profilePicture", profilePic);

    try {
      const res = await axios.post(
        `${baseURL}/api/counselor/upload-profile-pic/${id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setMessage(res.data.message);
      if (res.data.imagePath) {
        setCounselor((prev) => ({
          ...prev,
          profilePicture: res.data.imagePath,
        }));
      }
    } catch (error) {
      console.error("Error uploading counselor profile picture:", error);
      setMessage("❌ Error uploading profile picture.");
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`${baseURL}/api/counselor/profile/${id}`, {
        name: profileForm.name,
        email: profileForm.email,
        license: profileForm.license,
      });

      if (res.data.success) {
        setCounselor(res.data.data);
        setMessage("✅ Profile updated successfully!");
        setIsEditingProfile(false);
      } else {
        setMessage(res.data.message || "❌ Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("❌ Server error while updating profile.");
    }
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
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

  if (!counselor) {
    return <div className="text-center mt-20 text-gray-500 text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
              {counselor.profilePicture ? (
                <img
                  src={`${baseURL}${counselor.profilePicture}`}
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-base font-medium">{counselor.name}</h3>
              <p className="text-sm text-gray-500">Counselor</p>
              <form
                onSubmit={handleUploadProfilePic}
                className="mt-3 flex flex-col gap-2"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-700"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded bg-blue-500 text-white text-xs hover:bg-blue-600"
                >
                  Upload Photo
                </button>
              </form>
            </div>
          </div>
          {!isEditingProfile ? (
            <>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700">
                  License: {counselor.license || "Not set"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Email: {counselor.email}
                </p>
              </div>
              <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                onClick={() => setIsEditingProfile(true)}
              >
                Edit Profile
              </button>
            </>
          ) : (
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileInputChange}
                  className="mt-1 w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileInputChange}
                  className="mt-1 w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  License Number
                </label>
                <input
                  type="text"
                  name="license"
                  value={profileForm.license}
                  onChange={handleProfileInputChange}
                  className="mt-1 w-full border rounded px-2 py-1 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                >
                  Save Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      name: counselor.name || "",
                      email: counselor.email || "",
                      license: counselor.license || "",
                    });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>

          <p><strong>Email:</strong> {counselor.email}</p>
          <p>
            <strong>Specializations:</strong>{" "}
            {counselor.specialization?.length
              ? counselor.specialization.join(", ")
              : "Not set"}
          </p>
          <p>
            <strong>Preferred Session Types:</strong>{" "}
            {counselor.sessionType?.length
              ? counselor.sessionType.join(", ")
              : "Not set"}
          </p>
          <p>
            <strong>Target Student Groups:</strong>{" "}
            {counselor.targetStudent?.length
              ? counselor.targetStudent.join(", ")
              : "Not set"}
          </p>

          <div className="mt-4 flex gap-2">
            <button
              className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600"
              onClick={() => {
                const editSection = document.getElementById("edit-info-section");
                editSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Update Info
            </button>

            <button
              className="bg-white border border-blue-500 text-blue-500 text-sm px-3 py-1 rounded hover:bg-blue-100"
              onClick={() => setShowPasswordForm((prev) => !prev)}
            >
              Change Password
            </button>
          </div>

          {showPasswordForm && (
            <form
              onSubmit={handleChangePassword}
              className="mt-4 border-t pt-4 space-y-3"
            >
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordInputChange}
                  className="mt-1 w-full border rounded px-2 py-1 text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="mt-1 w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-2 bg-green-500 text-white text-sm px-4 py-2 rounded hover:bg-green-600"
              >
                Save New Password
              </button>
            </form>
          )}
        </div>


        {/* Availability */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Availability</h2>

          {/* Calendar overview */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                  )
                }
                className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
              >
                Prev
              </button>
              <div className="text-sm font-medium text-gray-800">
                {calendarMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                type="button"
                onClick={() =>
                  setCalendarMonth(
                    (prev) =>
                      new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                  )
                }
                className="px-2 py-1 text-xs rounded border bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs text-gray-500 mb-1">
              {weekDays.map((d) => (
                <div key={d} className="text-center">
                  {d}
                </div>
              ))}
            </div>

            {(() => {
              const calendar = generateCalendar(calendarMonth);
              const availabilitySet = new Set(
                availability.map((a) => a.date)
              );
              return (
                <div className="grid grid-cols-7 gap-1 text-xs">
                  {calendar.map((day, idx) => {
                    const dateStr = day.date.toISOString().split("T")[0];
                    const hasAvailability = availabilitySet.has(dateStr);
                    const isSelected = selectedAvailDate === dateStr;
                    const baseClasses = "h-7 flex items-center justify-center rounded";

                    let classes = "bg-white text-gray-400";
                    if (!day.isCurrentMonth) {
                      classes = "bg-gray-50 text-gray-300";
                    }
                    if (day.isCurrentMonth && hasAvailability) {
                      classes = "bg-green-100 text-green-800 border border-green-400";
                    }
                    if (isSelected) {
                      classes =
                        "bg-green-600 text-white border border-green-700";
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvailDate(dateStr)}
                        className={`${baseClasses} ${classes}`}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
          </div>

          {/* Selected date slots */}
          <div className="mb-4 text-xs text-gray-700">
            {selectedAvailDate ? (
              (() => {
                const entry = availability.find(
                  (a) => a.date === selectedAvailDate
                );
                if (!entry || !entry.timeSlots.length) {
                  return (
                    <p>
                      No time slots saved for{" "}
                      <span className="font-semibold">
                        {selectedAvailDate}
                      </span>
                      .
                    </p>
                  );
                }
                return (
                  <div>
                    <p className="mb-1">
                      Availability on{" "}
                      <span className="font-semibold">
                        {selectedAvailDate}
                      </span>
                      :
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.timeSlots.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-gray-500">
                Select a highlighted day to see saved time slots.
              </p>
            )}
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditing ? "Cancel" : "Add / Edit Availability"}
          </button>

          {isEditing && (
            <div className="mt-4 border-t pt-4 transition-all duration-300 ease-in-out">
              <h3 className="text-md font-semibold mb-3">Add Availability</h3>

              {/* Date Picker */}
              <label className="text-sm text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  // Reset slots when switching to a new date for clarity
                  setTimeSlots([]);
                }}
                className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />

              {/* Easier time slot picker */}
              <label className="text-sm text-gray-700">Choose Available Times:</label>

              <div className="flex flex-wrap items-center gap-2 my-2 text-xs">
                <span className="text-gray-500 mr-2">Quick select:</span>
                <button
                  type="button"
                  onClick={() => {
                    // Morning: 9:00–12:00
                    const morning = presetSlots.filter((t) => {
                      const hour = parseInt(t.split(":")[0], 10);
                      return hour >= 9 && hour < 12;
                    });
                    setTimeSlots(morning);
                  }}
                  className="px-3 py-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50"
                  disabled={!selectedDate}
                >
                  Morning (9–12)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Afternoon: 13:00–17:00
                    const afternoon = presetSlots.filter((t) => {
                      const hour = parseInt(t.split(":")[0], 10);
                      return hour >= 13 && hour <= 17;
                    });
                    setTimeSlots(afternoon);
                  }}
                  className="px-3 py-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50"
                  disabled={!selectedDate}
                >
                  Afternoon (1–5)
                </button>
                <button
                  type="button"
                  onClick={() => setTimeSlots([])}
                  className="px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50"
                  disabled={!selectedDate}
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
                {presetSlots.map((slot) => {
                  const isSelected = timeSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => {
                        if (!selectedDate) return;
                        if (isSelected) {
                          setTimeSlots((prev) => prev.filter((t) => t !== slot));
                        } else {
                          setTimeSlots((prev) => [...prev, slot]);
                        }
                      }}
                      disabled={!selectedDate}
                      className={`text-xs px-2 py-2 rounded border transition-all ${
                        !selectedDate
                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                          : isSelected
                          ? "bg-green-100 text-green-700 border-green-500"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>

              {/* Time Slot List with Smooth Scroll */}
              {timeSlots.length > 0 && (
                <div className="mb-3 max-h-32 overflow-y-auto smooth-scroll border rounded-lg p-3 bg-gray-50 shadow-inner">
                  <p className="font-medium text-gray-700 mb-2">Selected Time Slots:</p>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((t) => (
                      <span
                        key={t}
                        className="bg-green-100 text-green-700 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 hover:bg-green-200 transition-all"
                      >
                        {t}
                        <button
                          onClick={() => removeTimeSlot(t)}
                          className="text-red-500 hover:text-red-700 transition-all"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={saveAvailability}
                className="w-full bg-[#2e8b57] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#267349] transition-all mt-2"
              >
                Save Availability
              </button>
            </div>
          )}
        </div>

      </div>
          
      {/* Edit Info Section */}
        <div
          id="edit-info-section"
          className="mt-12 bg-white rounded-xl shadow p-8 w-full mx-auto"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-800 text-center">
            Update Counselor Information
          </h2>

          {/* Multi-select dropdowns */}
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Specializations */}
            <div className="flex-1 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
              <label className="block text-sm font-medium text-gray-700 mb-6">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "CBT",
                  "Substance Abuse Counseling",
                  "Mental Health Counseling",
                  "School counseling",
                  "Career Counseling",
                  "Family Therapy",
                  "Child Counseling",
                  "Educational counseling",
                  "Depression counseling",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      const selected = counselor.specialization || [];
                      setCounselor({
                        ...counselor,
                        specialization: selected.includes(option)
                          ? selected.filter((x) => x !== option)
                          : [...selected, option],
                      });
                    }}
                    className={`px-3 py-1 rounded-full border text-sm transition-all ${
                      counselor.specialization?.includes(option)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Type */}
            <div className="flex-1 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
              <label className="block text-sm font-medium text-gray-700 mb-6">
                Preferred Session Type
              </label>
              <div className="flex flex-wrap gap-2">
                {["Online", "In-person", "Hybrid", "Group Sessions"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const selected = counselor.sessionType || [];
                        setCounselor({
                          ...counselor,
                          sessionType: selected.includes(option)
                            ? selected.filter((x) => x !== option)
                            : [...selected, option],
                        });
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-all ${
                        counselor.sessionType?.includes(option)
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Target Student */}
            <div className="flex-1 border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all">
              <label className="block text-sm font-medium text-gray-700 mb-6">
                Target Student Group
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  "Child",
                  "Teenagers",
                  "College Students",
                  "Working Professionals",
                  "Parents",
                ].map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      const selected = counselor.targetStudent || [];
                      setCounselor({
                        ...counselor,
                        targetStudent: selected.includes(option)
                          ? selected.filter((x) => x !== option)
                          : [...selected, option],
                      });
                    }}
                    className={`px-3 py-1 rounded-full border text-sm transition-all ${
                      counselor.targetStudent?.includes(option)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-10 text-center">
            <button
              onClick={async () => {
                try {
                  const res = await axios.put(
                    `${baseURL}/api/counselor/profile/${id}`,
                    {
                      specialization: counselor.specialization,
                      sessionType: counselor.sessionType,
                      targetStudent: counselor.targetStudent,
                    }
                  );

                  if (res.data.success) {
                    setCounselor(res.data.data);
                    setMessage("✅ Information updated successfully!");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  } else {
                    setMessage("❌ Failed to update information.");
                  }
                } catch (error) {
                  console.error("Error updating info:", error);
                  setMessage("❌ Server error while updating info.");
                }
              }}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>


      {message && (
        <div className="text-center mt-6 text-green-700 font-medium">{message}</div>
      )}

      <div className="text-center mt-10 text-sm text-gray-400">
        © 2025 MindConnect &nbsp;|&nbsp;
        <a href="#" className="hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
};

export default CounselorProfile;
