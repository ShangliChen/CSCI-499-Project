import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const ViewAllAppointments = () => {
  const [bookings, setBookings] = useState([]);
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
    const fetchBookings = async () => {
      try {
        const res = await fetch(`${baseURL}/api/bookings/student/${user.userId}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          const filtered = data.data.filter((b) => b.status !== "canceled"); // ✅ Hide canceled

          setBookings(filtered);
        }
      } catch (error) {
        console.error("❌ Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [user.userId]);

  return (
    <div className="min-h-screen bg-[#f5f5f0] px-8 py-10 font-sans">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center">
        All Appointments
      </h1>

      {bookings.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          You currently have no appointment history.
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
                b.dateTime >= now
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
            <div key={b._id} className="bg-white rounded-xl shadow p-6">
              <p className="font-semibold text-gray-800">
                Counselor: {b.counselor?.name}
              </p>
              <p className="text-gray-700">
                🗓️ {formatDateTime(b.date, b.time)} – {b.endTime || "1 hour"}
              </p>
              <p className="text-gray-700">
                Type: {b.meetingType?.toUpperCase()}
              </p>

              {(b.meetingLink || b.meetingLocation || b.meetingDetails) && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    Meeting Details
                  </p>
                  {b.meetingLink && (
                    <p className="text-sm">
                      Link:{" "}
                      <a
                        href={b.meetingLink}
                        className="text-[#2e8b57] underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Join Session
                      </a>
                    </p>
                  )}
                  {b.meetingLocation && (
                    <p className="text-sm">Location: {b.meetingLocation}</p>
                  )}
                  {b.meetingDetails && (
                    <p className="text-sm">Notes: {b.meetingDetails}</p>
                  )}
                </div>
              )}

              {/* ✅ Cancel Button only for future confirmed appointments */}
              {isUpcoming && b.status === "confirmed" && (
                <button
                  className="mt-3 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-700"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Are you sure you want to cancel this appointment?"
                      )
                    ) {
                      await fetch(`${baseURL}/api/bookings/${b._id}/cancel`, {
                        method: "PUT",
                      });

                      // ✅ Immediately remove from UI
                      setBookings((prev) =>
                        prev.filter((item) => item._id !== b._id)
                      );
                    }
                  }}
                >
                  Cancel Appointment
                </button>
              )}
            </div>
          );

          return (
            <div className="space-y-8 max-w-3xl mx-auto">
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
    </div>
  );
};

export default ViewAllAppointments;
