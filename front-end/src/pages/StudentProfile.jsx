import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const StudentProfile = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState("");

  const baseURL = "http://localhost:5000";

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${baseURL}/api/student/profile/${id}`);
        setStudent(res.data.data);
        setFormData({
          name: res.data.data.name || "",
          email: res.data.data.email || "", // ✅ add this
          phoneNumber: res.data.data.phoneNumber || "",
          bio: res.data.data.bio || "",
          address: res.data.data.address || "",
          dob: res.data.data.dob ? res.data.data.dob.split("T")[0] : "",
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
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

  if (!student) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

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
                    src={`${baseURL}/${student.profilePicture}`}
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

            {/* Counselor Card */}
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e5f4f2] flex items-center justify-center text-4xl">
                👩‍⚕️
              </div>
              <h3 className="font-semibold text-gray-800">Dr. Sarah Lee, PhD</h3>
              <p className="text-sm text-gray-500 mb-4">Clinical Psychologist</p>
              <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-lg">
                Message Counselor
              </button>
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

            {/* App Preferences */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">App Preferences</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex justify-between items-center">
                  <span>Notifications Enabled</span>
                  <span className="bg-gray-300 w-10 h-5 rounded-full flex items-center">
                    <span className="bg-white w-4 h-4 rounded-full ml-1 shadow" />
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Dark Mode</span>
                  <span className="bg-blue-500 w-10 h-5 rounded-full flex items-center justify-end">
                    <span className="bg-white w-4 h-4 rounded-full mr-1 shadow" />
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Session Reminders</span>
                  <span className="bg-blue-500 w-10 h-5 rounded-full flex items-center justify-end">
                    <span className="bg-white w-4 h-4 rounded-full mr-1 shadow" />
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Activity Overview Chart */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Activity Overview</h3>
              <img
                src="/images/chart-placeholder.png"
                alt="Chart"
                className="w-full h-32 object-contain"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">Sessions Attended Over Time</p>
            </div>

            {/* Activity Stats */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li>✓ Total Sessions: 12</li>
                <li>✓ Total Sessions Enabled</li>
                <li>✓ Dark Mode</li>
                <li>✓ Last Session: Dec 10, 2024</li>
                <li>✓ Upcoming: Dec 16, 2024</li>
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
