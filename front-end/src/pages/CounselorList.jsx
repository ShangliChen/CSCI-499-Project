import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const baseURL = API_BASE_URL;

const SPECIALIZATIONS = [
  "CBT",
  "Substance Abuse Counseling",
  "Mental Health Counseling",
  "School counseling",
  "Career Counseling",
  "Family Therapy",
  "Child Counseling",
  "Educational counseling",
  "Depression counseling",
];

const TARGET_STUDENTS = [
  "Child",
  "Teenagers",
  "College Students",
  "Working Professionals",
  "Parents",
];

const SESSION_TYPES = ["Online", "In-person", "Hybrid", "Group Sessions"];

const CounselorList = () => {
  const [counselors, setCounselors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [specFilter, setSpecFilter] = useState("");
  const [targetFilter, setTargetFilter] = useState("");
  const [sessionFilter, setSessionFilter] = useState("");

  const [request, setRequest] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.userId;

  // Fetch counselors
    const fetchCounselors = async () => {
      try {
        const res = await fetch(`${baseURL}/api/counselors`);
        const payload = await res.json();

        if (!payload.success) return setCounselors([]);

        const list = payload.counselors;

        // For each counselor → fetch capacity
        const withCapacity = await Promise.all(
          list.map(async (c) => {
            try {
              const capRes = await fetch(
                `${baseURL}/api/counselor-requests/capacity/${c._id}`
              );
              const capData = await capRes.json();

              return {
                ...c,
                capacity: capData.capacity,
                assignedCount: capData.assignedCount,
                isFull: capData.isFull,
              };
            } catch (err) {
              console.error("Capacity fetch failed", err);
              return { ...c, capacity: 5, assignedCount: 0, isFull: false };
            }
          })
        );

        // Sort alphabetically
        const sorted = [...withCapacity].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setCounselors(sorted);
        setFiltered(sorted);
      } catch (err) {
        console.error(err);
        setCounselors([]);
      } finally {
        setLoading(false);
      }
    };


  // Fetch current request for student
  const fetchCurrentRequest = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(
        `${baseURL}/api/counselor-requests/student/${studentId}`
      );
      const data = await res.json();
      if (data.success) setRequest(data.request);
      else setRequest(null);
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  };

  useEffect(() => {
    fetchCounselors();
    fetchCurrentRequest();

    // Poll every 5 sec
    const interval = setInterval(fetchCurrentRequest, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filters
  useEffect(() => {
    let result = [...counselors];

    if (searchTerm.trim()) {
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specFilter)
      result = result.filter((c) => c.specialization?.includes(specFilter));

    if (targetFilter)
      result = result.filter((c) => c.targetStudent?.includes(targetFilter));

    if (sessionFilter)
      result = result.filter((c) => c.sessionType?.includes(sessionFilter));

    setFiltered(result);
  }, [searchTerm, specFilter, targetFilter, sessionFilter, counselors]);

  // Send request
  const handleSendRequest = async (counselorId) => {
    if (!studentId) return alert("Please log in first.");
    try {
      const res = await fetch(`${baseURL}/api/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, counselorId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Request sent to ${data.counselorName}`);
        fetchCurrentRequest();
        await fetchCounselors();
      } else alert("Failed to send request.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // Cancel pending request
  const handleCancelRequest = async () => {
    if (!request) return;
    try {
      const res = await fetch(
        `${baseURL}/api/counselor-requests/${request._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Request cancelled successfully.");
        setRequest(null);
        await fetchCounselors();
      } else {
        alert("Failed to cancel request.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // REMOVE ASSIGNED COUNSELOR ------------------------------
  const handleRemoveCounselor = async () => {
    if (!request) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to remove your assigned counselor? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${baseURL}/api/counselor-requests/${request._id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        alert("Your counselor has been removed.");
        setRequest(null);
        fetchCounselors(); // Load full list again
      } else {
        alert("Failed to remove counselor.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  // --------------------- UI -----------------------

  if (loading) return <p>Loading counselors...</p>;

  // When request is pending
  if (request?.status === "pending") {
    return (
      <div className="min-h-screen bg-green-50 px-6 py-10">
        <div className="bg-white p-6 rounded-2xl shadow-md max-w-xl">
          <p className="text-lg">
            Your request to{" "}
            <strong className="text-green-700">
              {request.counselor?.name}
            </strong>{" "}
            is pending.
          </p>

          <button
            onClick={handleCancelRequest}
            className="mt-4 bg-[#ff7f7f] hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow"
          >
            Cancel Request
          </button>
        </div>
      </div>
    );
  }

  // When request is accepted (assigned counselor)
  if (request?.status === "accepted") {
    const c = request.counselor;

    return (
      <div className="min-h-screen bg-green-50 px-6 py-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Counselor</h2>

        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 w-full max-w-2xl">
          <h3 className="text-2xl font-semibold text-gray-900">{c.name}</h3>
          <p className="mt-2"><strong>Email:</strong> {c.email}</p>
          <p className="mt-1">
            <strong>Specialization:</strong>{" "}
            {c.specialization?.join(", ")}
          </p>
          <p className="mt-1">
            <strong>Session Type:</strong>{" "}
            {c.sessionType?.join(", ")}
          </p>
          <p className="mt-1">
            <strong>Target Student:</strong>{" "}
            {c.targetStudent?.join(", ")}
          </p>

          <button
            onClick={handleRemoveCounselor}
            className="mt-6 bg-[#ff7f7f] hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow"
          >
            Remove Counselor
          </button>
        </div>
      </div>
    );
  }

  // No request → show list
  return (
    <div className="min-h-screen bg-green-50 px-6 py-10">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Counselor List</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
        />

        <select
          value={specFilter}
          onChange={(e) => setSpecFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm bg-white"
        >
          <option value="">All Specializations</option>
          {SPECIALIZATIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm bg-white"
        >
          <option value="">All Target Students</option>
          {TARGET_STUDENTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={sessionFilter}
          onChange={(e) => setSessionFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg shadow-sm bg-white"
        >
          <option value="">All Session Types</option>
          {SESSION_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* No results */}
      {filtered.length === 0 && (
        <p className="text-gray-600 mt-6">No counselors found.</p>
      )}

      {/* Counselor Cards */}
      <div className="space-y-6">
        {filtered.map((c) => (
          <div
            key={c._id}
            className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 flex justify-between items-start"
          >
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                {c.name}
              </h3>
              <p className="text-gray-700 mt-1">
                <strong>Email:</strong> {c.email}
              </p>

              <p className="text-gray-700 mt-1">
                <strong>Specialization:</strong>{" "}
                {c.specialization?.join(", ") || "N/A"}
              </p>

              <p className="text-gray-700 mt-1">
                <strong>Session Type:</strong>{" "}
                {c.sessionType?.join(", ") || "N/A"}
              </p>

              <p className="text-gray-700 mt-1">
                <strong>Target Student:</strong>{" "}
                {c.targetStudent?.join(", ") || "N/A"}
              </p>
            </div>

            {/* Show Send button only if not full */}
            {!c.isFull && (
              <button
                onClick={() => handleSendRequest(c._id)}
                className="bg-[#b3e6b3] hover:bg-green-700 text-white px-6 py-2 rounded-xl shadow-md transition"
              >
                Send Request
              </button>
            )}

            {/* When full, show only the red text */}
            {c.isFull && (
              <p className="cursor-not-allowed text-[#ff7f7f] italic text-sm mt-1">
                Capacity full
              </p>
            )}


          </div>
        ))}
      </div>
    </div>
  );
};

export default CounselorList;
