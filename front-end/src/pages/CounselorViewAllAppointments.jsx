import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const CounselorViewAllAppointments = () => {
  const [bookings, setBookings] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("");
  const [meetingDetails, setMeetingDetails] = useState("");
  const [endTime, setEndTime] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const baseURL = API_BASE_URL;

  // Format date & time nicely (e.g., Wednesday, Feb 12 at 2:30 PM)
  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`);
    return dateObj.toLocaleString("en-US", {
      weekday: "long",   // Monday, Tuesday, ...
      month: "short",    // Jan, Feb, Mar
      day: "numeric",    // 1, 2, 3...
      hour: "numeric",
      minute: "2-digit",
      hour12: true       // AM/PM
    });
  };

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
          const filtered = data.data.filter((b) => b.status !== "canceled");
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

  const openEditor = (b) => {
    setEditingId(b._id);
    setMeetingLink(b.meetingLink || "");
    setMeetingLocation(b.meetingLocation || "");
    setMeetingDetails(b.meetingDetails || "");
    setEndTime(b.endTime || "");
  };

  const cancelEditor = () => {
    setEditingId(null);
    setMeetingLink("");
    setMeetingLocation("");
    setMeetingDetails("");
    setEndTime("");
  };

  const saveMeetingInfo = async (bookingId) => {
    try {
      const res = await fetch(`${baseURL}/api/bookings/${bookingId}/meeting-info`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingLink, meetingLocation, meetingDetails, endTime })
      });
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.map((b) => (b._id === bookingId ? data.data : b)));
        cancelEditor();
      } else {
        alert(data.message || "Failed to save meeting info");
      }
    } catch (err) {
      console.error("❌ Error saving meeting info:", err);
      alert("Server error while saving meeting info");
    }
  };

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
        (() => {
          const now = new Date();

          const upcoming = bookings
            .map((b) => ({
              ...b,
              dateTime: new Date(`${b.date}T${b.time}`),
            }))
            .filter(
              (b) =>
                b.dateTime instanceof Date &&
                !Number.isNaN(b.dateTime.getTime()) &&
                b.dateTime >= now &&
                b.status === "confirmed"
            )
            .sort(
              (a, b) => a.dateTime - b.dateTime // soonest upcoming first
            );

          const past = bookings
            .map((b) => ({
              ...b,
              dateTime: new Date(`${b.date}T${b.time}`),
            }))
            .filter(
              (b) =>
                b.dateTime instanceof Date &&
                !Number.isNaN(b.dateTime.getTime()) &&
                b.dateTime < now
            )
            .sort(
              (a, b) => b.dateTime - a.dateTime // most recent past first
            );

          const renderCard = (b, isUpcoming) => (
            <div
              key={b._id}
              className="bg-white rounded-xl shadow p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center"
            >
              <div className="space-y-1">
                <p className="font-semibold text-gray-900 text-lg">
                  {b.student?.name || "Unknown Student"}
                </p>
                <p className="text-gray-800 text-sm">
                  <span className="font-medium">
                    {b.student?.email || "No email"}
                  </span>
                </p>
                {b.student?.dob && (
                  <p className="text-gray-800 text-sm">
                    Age{" "}
                    {new Date().getFullYear() -
                      new Date(b.student.dob).getFullYear()}{" "}
                    years
                  </p>
                )}
                <p className="text-gray-800 text-sm">
                  {formatDateTime(b.date, b.time)} –{" "}
                  {b.endTime || "1 hour"}
                </p>
                <p className="text-gray-800 text-sm capitalize">
                  Type: {b.meetingType}
                </p>
                <p className="text-gray-800 text-sm">
                  Note: {b.note || "No note provided"}
                </p>
                {/* Meeting info (if any) */}
                {(b.meetingLink ||
                  b.meetingLocation ||
                  b.meetingDetails) && (
                  <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm text-gray-800 font-semibold mb-1">
                      Meeting Details
                    </p>
                    {b.meetingLink && (
                      <p className="text-sm">
                        Link:{" "}
                        <a
                          className="text-[#2e8b57] underline"
                          href={b.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {b.meetingLink}
                        </a>
                      </p>
                    )}
                    {b.meetingLocation && (
                      <p className="text-sm">
                        Location: {b.meetingLocation}
                      </p>
                    )}
                    {b.meetingDetails && (
                      <p className="text-sm">
                        Notes: {b.meetingDetails}
                      </p>
                    )}
                  </div>
                )}
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
              <div className="self-stretch sm:self-auto mt-4 sm:mt-0 flex flex-col gap-2 items-end">
                <button
                  onClick={() =>
                    navigate(`/counselor/user/${b.student?._id}`)
                  }
                  className="text-[#2e8b57] font-semibold hover:underline"
                >
                  View Assessment →
                </button>
                {isUpcoming && (
                  <button
                    onClick={() => openEditor(b)}
                    className="px-3 py-1 rounded bg-[#2e8b57] text-white hover:bg-[#267349]"
                  >
                    {b.meetingLink ||
                    b.meetingLocation ||
                    b.meetingDetails
                      ? "Update Meeting Info"
                      : "Send Meeting Info"}
                  </button>
                )}
              </div>
            </div>
          );

          return (
            <div className="space-y-8 max-w-4xl mx-auto">
              {upcoming.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Upcoming Appointments
                  </h2>
                  {upcoming.map((b) => renderCard(b, true))}
                </div>
              )}

              {past.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Past Appointments
                  </h2>
                  {past.map((b) => renderCard(b, false))}
                </div>
              )}
            </div>
          );
        })()
      )}

      {/* Editor Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Send Meeting Info</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link (Zoom/Google Meet)</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location (for In-Person)</label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  placeholder="Counseling Center, Room 204"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes/Instructions</label>
                <textarea
                  value={meetingDetails}
                  onChange={(e) => setMeetingDetails(e.target.value)}
                  placeholder="Any prep, documents, or check-in steps"
                  className="w-full border rounded px-3 py-2 h-24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time (optional)</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button onClick={cancelEditor} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={() => saveMeetingInfo(editingId)} className="px-4 py-2 rounded bg-[#2e8b57] text-white hover:bg-[#267349]">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CounselorViewAllAppointments;
