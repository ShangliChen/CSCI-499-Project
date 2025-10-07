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
    <div className="min-h-screen bg-[#f5f5f0] py-12 px-4 flex justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Profile Section */}
        <div className="flex flex-col items-center text-center md:col-span-1">
          <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden shadow-md mb-4">
            {student.profilePicture ? (
              <img
                src={`${baseURL}/${student.profilePicture}`}
                alt="Profile"
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-800">{formData.name}</h2>
          <p className="text-gray-500 text-sm">{formData.email || "Student Email"}</p>

          {/* Upload Photo */}
          <form onSubmit={handleUpload} className="mt-4 w-full">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfilePic(e.target.files[0])}
              className="text-sm mb-2 w-full"
            />
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm"
            >
              Upload Photo
            </button>
          </form>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              value={formData.name}
              placeholder="Full Name"
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg"
            />
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              placeholder="Phone Number"
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg"
            />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg"
            />
            <input
              type="text"
              name="address"
              value={formData.address}
              placeholder="Address"
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg"
            />
            <textarea
              name="bio"
              value={formData.bio}
              placeholder="Short Bio"
              onChange={handleChange}
              className="border border-gray-300 p-2 rounded-lg col-span-1 md:col-span-2"
              rows="3"
            />
            <button
              type="submit"
              className="col-span-1 md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              Save Changes
            </button>
          </form>

          {message && (
            <p className="mt-4 text-green-600 text-sm text-center">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
