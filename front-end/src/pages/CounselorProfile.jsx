import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CounselorProfile = () => {
  const { id } = useParams();
  const [counselor, setCounselor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState([]);
  const [newTime, setNewTime] = useState("");
  const [message, setMessage] = useState("");
  const baseURL = "http://localhost:5000";

  // ✅ Fetch counselor profile
  useEffect(() => {
    const fetchCounselorProfile = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/counselor/profile/${id}`);
        setCounselor(res.data.data);
      } catch (error) {
        console.error("Failed to fetch counselor profile:", error);
      }
    };
    fetchCounselorProfile();
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
            <div className="w-16 h-16 bg-gray-300 rounded-full" />
            <div>
              <h3 className="text-base font-medium">{counselor.name}</h3>
              <p className="text-sm text-gray-500">Counselor</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">License: {counselor.license}</p>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
            Edit Profile
          </button>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Account Details</h2>
          <p><strong>Email:</strong> {counselor.email}</p>
          <p><strong>Password:</strong> ••••••••</p>
          <p><strong>License Number:</strong> {counselor.license}</p>
          <p><strong>Specializations:</strong> CBT, ACT, Trauma</p>
          <div className="mt-4 flex gap-2">
            <button className="bg-blue-500 text-white text-sm px-3 py-1 rounded hover:bg-blue-600">
              Update Info
            </button>
            <button className="bg-white border border-blue-500 text-blue-500 text-sm px-3 py-1 rounded hover:bg-blue-100">
              Change Password
            </button>
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Sessions</h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Dec 15, 2024 - 10:00 AM</p>
                <p>Jamie Chen</p>
              </div>
              <button className="bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200">
                View Session
              </button>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Dec 15, 2024 - 11:30 AM</p>
                <p>Jamie Davis</p>
              </div>
              <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                Join Session
              </button>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Set Your Availability</h2>

          <div className="grid grid-cols-7 gap-1 mb-4">
           {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={`${d}-${i}`} className="text-center text-xs text-gray-500">
              {d}
            </div>
          ))}

            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={`h-6 rounded ${
                  i === 5 || i === 6 ? "bg-blue-200" : i === 12 ? "bg-orange-300" : "bg-gray-100"
                }`}
              ></div>
            ))}
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-sm text-blue-600 hover:underline"
          >
            {isEditing ? "Cancel" : "Edit Schedule"}
          </button>

          {isEditing && (
            <div className="mt-4 border-t pt-4 transition-all duration-300 ease-in-out">
              <h3 className="text-md font-semibold mb-3">Add Availability</h3>

              {/* Date Picker */}
              <label className="text-sm text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full border rounded-lg p-2 mb-3 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
              />

              {/* Time Slot Picker */}
              <label className="text-sm text-gray-700">Add Time Slot:</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="border rounded-lg p-2 flex-1 focus:ring-2 focus:ring-blue-400 outline-none transition-all"
                />
                <button
                  onClick={addTimeSlot}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all text-sm"
                >
                  Add
                </button>
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

        {/* Client Load */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Client Load</h2>
          <div className="flex items-end gap-4 h-32">
            <div className="w-6 bg-blue-600 h-24 rounded"></div>
            <div className="w-6 bg-blue-300 h-20 rounded"></div>
            <div className="text-sm text-gray-500">
              Active Clients: 18<br />Waiting List: 3
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✔️ Add New Client</li>
            <li>✔️ Review Session Notes</li>
            <li>✔️ Access Billing</li>
          </ul>
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
