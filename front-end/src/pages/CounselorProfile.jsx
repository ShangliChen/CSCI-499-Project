import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ChevronDown, 
  ChevronUp, 
  User, 
  Settings, 
  Lock, 
  Calendar,
  Clock,
  Star,
  Users,
  Video,
  Target,
  ArrowLeft,
  Check,
  X,
  Upload,
  Save,
  Edit
} from "lucide-react";

const CounselorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  
  // State for expandable sections
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    account: true,
    availability: true,
    editInfo: false,
    security: false
  });

  const baseURL = "http://localhost:5000";

  // Preset half‑hour time slots from 9:00–17:00
  const presetSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00",
  ];

  // Week days for calendar
  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  // Toggle section
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Generate calendar grid
  const generateCalendar = (monthDate) => {
    const currentMonth = monthDate.getMonth();
    const currentYear = monthDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const cells = [];
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      cells.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
      });
    }

    // Next month days
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

  const fetchAvailability = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/counselor/availability/${id}`);
      if (res.data?.success && Array.isArray(res.data.availability)) {
        setAvailability(res.data.availability);
      } else {
        setAvailability([]);
      }
    } catch (error) {
      console.error("Failed to fetch availability:", error);
      setAvailability([]);
    }
  };

  // Fetch counselor profile + availability
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

  // Save availability
  const saveAvailability = async () => {
    if (!selectedDate || timeSlots.length === 0) {
      setMessage("⚠️ Please select a date and at least one time slot.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      const res = await axios.post(`${baseURL}/api/counselor/availability`, {
        counselorId: id,
        date: selectedDate,
        timeSlots,
      });

      if (res.data.success) {
        setMessage("Availability saved successfully!");
        setIsEditing(false);
        setSelectedDate("");
        setTimeSlots([]);
        fetchAvailability();
      } else {
        setMessage(" Failed to save availability.");
      }
    } catch (error) {
      console.error("Error saving availability:", error);
      setMessage("Error saving schedule.");
    }
    setTimeout(() => setMessage(""), 3000);
  };

  // Add or remove time slots
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
      console.error("Error uploading profile picture:", error);
      setMessage("❌ Error uploading profile picture.");
    }
    setTimeout(() => setMessage(""), 3000);
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
    setTimeout(() => setMessage(""), 3000);
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
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
    setTimeout(() => setMessage(""), 3000);
  };

  if (!counselor) {
    return (
      <div className="min-h-screen bg-[#f5f8fc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-4 md:p-8">
      {/* Header with Back Button */}
      <div className="max-w-screen-2xl mx-auto mb-6">
        <button
          onClick={() => navigate("/dashboard/counselor")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
      </div>

      <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PROFILE CARD - Expandable */}
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
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 border-2 border-white shadow">
                    {counselor.profilePicture ? (
                      <img
                        src={`${baseURL}${counselor.profilePicture}`}
                        alt="Profile"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{counselor.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Star size={14} className="text-yellow-500" />
                    Counselor
                  </p>
                  
                  {!isEditingProfile ? (
                    <>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">License:</span> {counselor.license || "Not set"}
                        </p>
                        <p className="text-sm text-gray-600">{counselor.email}</p>
                      </div>
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Edit size={14} />
                        Edit Profile
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="mt-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={profileForm.name}
                          onChange={handleProfileInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={profileForm.email}
                          onChange={handleProfileInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          License Number
                        </label>
                        <input
                          type="text"
                          name="license"
                          value={profileForm.license}
                          onChange={handleProfileInputChange}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        >
                          <Save size={14} />
                          Save
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
                          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {/* Profile Picture Upload */}
              <form onSubmit={handleUploadProfilePic} className="mt-4 pt-4 border-t">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Profile Picture
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload size={16} />
                    Upload
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* ACCOUNT DETAILS - Expandable */}
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
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-white rounded">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Specializations</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {counselor.specialization?.length ? (
                        counselor.specialization.map((spec, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {spec}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-white rounded">
                    <Video size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Session Types</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {counselor.sessionType?.length ? (
                        counselor.sessionType.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            {type}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="p-2 bg-white rounded">
                    <Target size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Target Groups</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {counselor.targetStudent?.length ? (
                        counselor.targetStudent.map((group, idx) => (
                          <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded">
                            {group}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">Not set</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    toggleSection('editInfo');
                    // Smooth scroll to edit section
                    setTimeout(() => {
                      document.getElementById('edit-info-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit size={16} />
                  Update Information
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AVAILABILITY - Expandable */}
        <div className="bg-white rounded-xl shadow">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => toggleSection('availability')}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar size={20} className="text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Availability</h3>
            </div>
            {expandedSections.availability ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          
          {expandedSections.availability && (
            <div className="px-6 pb-6">
              {/* Calendar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
                    )}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronUp size={16} className="rotate-90" />
                  </button>
                  <h4 className="font-semibold text-gray-800">
                    {calendarMonth.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h4>
                  <button
                    onClick={() => setCalendarMonth(
                      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
                    )}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronUp size={16} className="-rotate-90" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {generateCalendar(calendarMonth).map((day, idx) => {
                    const dateStr = day.date.toISOString().split("T")[0];
                    const hasAvailability = availability.some(a => a.date === dateStr);
                    const isSelected = selectedAvailDate === dateStr;
                    
                    let className = "h-10 flex items-center justify-center rounded-lg text-sm ";
                    
                    if (!day.isCurrentMonth) {
                      className += "text-gray-300 ";
                    } else if (isSelected) {
                      className += "bg-green-600 text-white ";
                    } else if (hasAvailability) {
                      className += "bg-green-100 text-green-800 border border-green-300 ";
                    } else {
                      className += "text-gray-700 hover:bg-gray-100 ";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedAvailDate(dateStr)}
                        className={className}
                        disabled={!day.isCurrentMonth}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Date Details */}
              {selectedAvailDate && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">
                    Availability for {selectedAvailDate}
                  </h4>
                  {(() => {
                    const entry = availability.find(a => a.date === selectedAvailDate);
                    if (!entry || !entry.timeSlots?.length) {
                      return (
                        <p className="text-sm text-gray-500">
                          No time slots saved for this date.
                        </p>
                      );
                    }
                    return (
                      <div className="flex flex-wrap gap-2">
                        {entry.timeSlots.map((time) => (
                          <span
                            key={time}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full border border-green-300 flex items-center gap-2"
                          >
                            <Clock size={12} />
                            {time}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Edit Availability Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-800">Manage Availability</h4>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {isEditing ? "Cancel" : "+ Add/Edit"}
                </button>
              </div>

              {/* Edit Availability Form */}
              {isEditing && (
                <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        setSelectedDate(e.target.value);
                        setTimeSlots([]);
                      }}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {selectedDate && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Time Slots
                        </label>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <button
                            onClick={() => {
                              const morning = presetSlots.filter(t => {
                                const hour = parseInt(t.split(":")[0], 10);
                                return hour >= 9 && hour < 12;
                              });
                              setTimeSlots(morning);
                            }}
                            className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                          >
                            Morning (9-12)
                          </button>
                          <button
                            onClick={() => {
                              const afternoon = presetSlots.filter(t => {
                                const hour = parseInt(t.split(":")[0], 10);
                                return hour >= 13 && hour <= 17;
                              });
                              setTimeSlots(afternoon);
                            }}
                            className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                          >
                            Afternoon (1-5)
                          </button>
                          <button
                            onClick={() => setTimeSlots([])}
                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                          >
                            Clear
                          </button>
                        </div>

                        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2">
                          {presetSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                if (timeSlots.includes(slot)) {
                                  removeTimeSlot(slot);
                                } else {
                                  setTimeSlots([...timeSlots, slot]);
                                }
                              }}
                              className={`p-2 text-sm rounded border transition-colors ${
                                timeSlots.includes(slot)
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>

                      {timeSlots.length > 0 && (
                        <div className="p-3 bg-white rounded border">
                          <p className="font-medium text-gray-700 mb-2">Selected Slots:</p>
                          <div className="flex flex-wrap gap-2">
                            {timeSlots.map((time) => (
                              <span
                                key={time}
                                className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                              >
                                {time}
                                <button
                                  onClick={() => removeTimeSlot(time)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X size={12} />
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={saveAvailability}
                        disabled={timeSlots.length === 0}
                        className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Save Availability
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* EDIT INFORMATION SECTION - Expandable */}
      <div className="max-w-screen-2xl mx-auto mt-8 bg-white rounded-xl shadow">
        <div 
          className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => toggleSection('editInfo')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Edit size={20} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Update Counselor Information</h3>
          </div>
          {expandedSections.editInfo ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
        
        {expandedSections.editInfo && (
          <div id="edit-info-section" className="px-6 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Specializations */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Users size={18} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-800">Specializations</h4>
                </div>
                <div className="space-y-2">
                  {[
                    "CBT", "Substance Abuse Counseling", "Mental Health Counseling",
                    "School counseling", "Career Counseling", "Family Therapy",
                    "Child Counseling", "Educational counseling", "Depression counseling"
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const selected = counselor.specialization || [];
                        setCounselor({
                          ...counselor,
                          specialization: selected.includes(option)
                            ? selected.filter(x => x !== option)
                            : [...selected, option],
                        });
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        counselor.specialization?.includes(option)
                          ? "bg-blue-50 border-blue-500 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {counselor.specialization?.includes(option) && (
                          <Check size={16} className="text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Session Type */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Video size={18} className="text-green-600" />
                  <h4 className="font-semibold text-gray-800">Session Types</h4>
                </div>
                <div className="space-y-2">
                  {["Online", "In-person", "Hybrid", "Group Sessions"].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const selected = counselor.sessionType || [];
                        setCounselor({
                          ...counselor,
                          sessionType: selected.includes(option)
                            ? selected.filter(x => x !== option)
                            : [...selected, option],
                        });
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        counselor.sessionType?.includes(option)
                          ? "bg-green-50 border-green-500 text-green-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {counselor.sessionType?.includes(option) && (
                          <Check size={16} className="text-green-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Student Groups */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Target size={18} className="text-orange-600" />
                  <h4 className="font-semibold text-gray-800">Target Groups</h4>
                </div>
                <div className="space-y-2">
                  {[
                    "Child", "Teenagers", "College Students",
                    "Working Professionals", "Parents"
                  ].map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        const selected = counselor.targetStudent || [];
                        setCounselor({
                          ...counselor,
                          targetStudent: selected.includes(option)
                            ? selected.filter(x => x !== option)
                            : [...selected, option],
                        });
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                        counselor.targetStudent?.includes(option)
                          ? "bg-orange-50 border-orange-500 text-orange-700"
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {counselor.targetStudent?.includes(option) && (
                          <Check size={16} className="text-orange-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t text-center">
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
                      setMessage("Information updated successfully!");
                      setTimeout(() => setMessage(""), 3000);
                    } else {
                      setMessage("Failed to update information.");
                      setTimeout(() => setMessage(""), 3000);
                    }
                  } catch (error) {
                    console.error("Error updating info:", error);
                    setMessage("Server error while updating info.");
                    setTimeout(() => setMessage(""), 3000);
                  }
                }}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECURITY SECTION - Expandable */}
      <div className="max-w-screen-2xl mx-auto mt-8 bg-white rounded-xl shadow">
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
            <div className="space-y-4">
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Lock size={18} className="text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-700">Change Password</p>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                </div>
                <ChevronDown size={18} className={`transform transition-transform ${showPasswordForm ? 'rotate-180' : ''}`} />
              </button>

              {showPasswordForm && (
                <form onSubmit={handleChangePassword} className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
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
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Password
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg animate-fadeIn z-50">
          {message}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-gray-500">
        <div className="max-w-6xl mx-auto border-t pt-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <span>© 2025 MindConnect</span>
            <div className="flex gap-4 mt-2 md:mt-0">
              <a href="#" className="hover:underline hover:text-gray-700 transition-colors">
                Contact
              </a>
              <a href="#" className="hover:underline hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:underline hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CounselorProfile;