import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CounselorViewAllAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const baseURL = "http://localhost:5000";

  useEffect(() => {
    if (!user || user.role !== "counselor") {
      navigate("/login/counselor");
      return;
    }

    const fetchBookings = async () => {
      try {
        const res = await fetch(`${baseURL}/api/bookings/counselor/${user.userId}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const sorted = data.data.sort(
            (a, b) =>
              new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)
          );
          const filtered = sorted.filter((b) => b.status !== "canceled");
            setBookings(filtered);
        } else {
          console.error("❌ Unexpected data format:", data);
        }
      } catch (error) {
        console.error("❌ Error fetching counselor bookings:", error);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] px-8 py-10 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">
        All Student Appointments
      </h1>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          You currently have no upcoming or past appointments.
        </p>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {bookings.map((b) => (
            <div
            key={b._id}
            className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
            <div className="space-y-1">
                <p className="font-semibold text-gray-900 text-lg">
                🧑‍🎓 {b.student?.name || "Unknown Student"}
                </p>
                <p className="text-gray-700 text-sm">
                📧 <span className="font-medium">{b.student?.email || "No email"}</span>
                </p>
                {b.student?.dob && (
                <p className="text-gray-700 text-sm">
                    🎂 Age: {new Date().getFullYear() - new Date(b.student.dob).getFullYear()} years
                </p>
                )}
                <p className="text-gray-700 text-sm">
                🗓️ Date: {new Date(b.date).toLocaleDateString()} &nbsp; | &nbsp; ⏰ Time: {b.time}
                </p>
                <p className="text-gray-700 text-sm capitalize">
                💬 Type: {b.meetingType}
                </p>
                <p className="text-gray-700 text-sm">
                📝 Note: {b.note || "No note provided"}
                </p>
                <p
                className={`text-sm font-semibold ${
                    b.status === "confirmed"
                    ? "text-green-600"
                    : b.status === "canceled"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
                >
                Status: {b.status}
                </p>
            </div>

            <button
                onClick={() => navigate(`/counselor/user/${b.student?._id}`)}
                className="mt-4 sm:mt-0 text-[#2e8b57] font-semibold hover:underline self-end sm:self-auto"
            >
                View Assessment →
            </button>
            </div>

          ))}
        </div>
      )}
    </div>
  );
};

export default CounselorViewAllAppointments;
