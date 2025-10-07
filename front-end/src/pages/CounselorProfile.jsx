import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const CounselorProfile = () => {
  const { id } = useParams();
  const [counselor, setCounselor] = useState(null);
  const baseURL = "http://localhost:5000";

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

  if (!counselor) {
    return (
      <div className="text-center mt-20 text-gray-500 text-lg">Loading...</div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f8fc] p-8">
      

      {/* Grid Dashboard Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full" />
            <div>
              <h3 className="text-base font-medium">{counselor.name}</h3>
              <p className="text-sm text-gray-500">Student Member</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700">Dr. Sarah Lee, PhD</p>
            <p className="text-sm text-gray-500">Clinical Psychologist</p>
          </div>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">
            Edit Profile
          </button>
        </div>

        {/* Account Details Card */}
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

        {/* Upcoming Sessions Card */}
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

        {/* Availability Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Set Your Availability</h2>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
              <div key={d} className="text-center text-xs text-gray-500">{d}</div>
            ))}
            {/* Simple calendar boxes for mock display */}
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className={`h-6 rounded ${i === 5 || i === 6 ? "bg-blue-200" : i === 12 ? "bg-orange-300" : "bg-gray-100"}`}
              ></div>
            ))}
          </div>
          <button className="text-sm text-blue-600 hover:underline">Edit Schedule</button>
        </div>

        {/* Client Load Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Client Load</h2>
          <div className="flex items-end gap-4 h-32">
            <div className="w-6 bg-blue-600 h-24 rounded"></div>
            <div className="w-6 bg-blue-300 h-20 rounded"></div>
            <div className="text-sm text-gray-500">Active Clients: 18<br />Waiting List: 3</div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✔️ Add New Client</li>
            <li>✔️ Review Session Notes</li>
            <li>✔️ Access Billing</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-10 text-sm text-gray-400">
        © 2025 MindConnect &nbsp;|&nbsp; <a href="#" className="hover:underline">Privacy Policy</a>
      </div>
    </div>
  );
};

export default CounselorProfile;
