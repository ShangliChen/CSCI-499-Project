import React, { useEffect, useState } from "react";

const baseURL = "http://localhost:5000";

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

  const [request, setRequest] = useState(null); // Current student request
  const user = JSON.parse(localStorage.getItem("user"));
  const studentId = user?.userId;

  // Fetch all counselors
  const fetchCounselors = async () => {
    try {
      const res = await fetch(`${baseURL}/api/counselors`);
      const payload = await res.json();
      if (!payload.success) return setCounselors([]);
      const sorted = [...payload.counselors].sort((a, b) =>
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

  // Fetch current student request
  const fetchCurrentRequest = async () => {
    if (!studentId) return;
    try {
      const res = await fetch(`${baseURL}/api/counselor-requests/student/${studentId}`);
      const data = await res.json();
      if (data.success) setRequest(data.request);
      else setRequest(null);
    } catch (err) {
      console.error("Error fetching request:", err);
    }
  };

  useEffect(() => {
    fetchCounselors();

    // Poll current request every 5 seconds
    fetchCurrentRequest();
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

    if (specFilter) result = result.filter((c) => c.specialization?.includes(specFilter));
    if (targetFilter) result = result.filter((c) => c.targetStudent?.includes(targetFilter));
    if (sessionFilter) result = result.filter((c) => c.sessionType?.includes(sessionFilter));

    setFiltered(result);
  }, [searchTerm, specFilter, targetFilter, sessionFilter, counselors]);

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
      } else alert("Failed to send request.");
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  const handleCancelRequest = async () => {
    if (!request) return;
    try {
      const res = await fetch(`${baseURL}/api/counselor-requests/${request._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        alert("Request cancelled successfully.");
        setRequest(null);
      } else {
        alert("Failed to cancel request.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong.");
    }
  };

  if (loading) return <p>Loading counselors...</p>;

  // Pending request: show note + cancel button
  if (request?.status === "pending") {
    return (
      <div>
        <p>
          Your request to <strong>{request.counselor?.name}</strong> is pending.
        </p>
        <button
          onClick={handleCancelRequest}
          style={{
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            padding: "8px 12px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cancel Request
        </button>
      </div>
    );
  }

  // Accepted request: show only assigned counselor
  if (request?.status === "accepted") {
    const c = request.counselor;
    return (
      <div>
        <h2>Your Counselor</h2>
        <div
          style={{
            border: "1px solid #ccc",
            margin: "10px",
            padding: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3>{c.name}</h3>
            <p><strong>Email:</strong> {c.email}</p>
            <p><strong>Specialization:</strong> {c.specialization?.join(", ") || "N/A"}</p>
            <p><strong>Session Type:</strong> {c.sessionType?.join(", ") || "N/A"}</p>
            <p><strong>Target Student:</strong> {c.targetStudent?.join(", ") || "N/A"}</p>
          </div>
        </div>
      </div>
    );
  }

  // No request: show full list
  return (
    <div>
      <h1>Counselor List</h1>
      <input
        type="text"
        placeholder="Search by name or email"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ padding: "5px", marginBottom: "15px", width: "250px" }}
      />

      <br />

      <select value={specFilter} onChange={(e) => setSpecFilter(e.target.value)}>
        <option value="">All Specializations</option>
        {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        value={targetFilter}
        onChange={(e) => setTargetFilter(e.target.value)}
        style={{ marginLeft: "10px" }}
      >
        <option value="">All Target Students</option>
        {TARGET_STUDENTS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      <select
        value={sessionFilter}
        onChange={(e) => setSessionFilter(e.target.value)}
        style={{ marginLeft: "10px" }}
      >
        <option value="">All Session Types</option>
        {SESSION_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>

      {filtered.length === 0 && <p>No counselors found.</p>}

      {filtered.map((c) => (
        <div
          key={c._id}
          style={{
            border: "1px solid #ccc",
            margin: "10px",
            padding: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h3>{c.name}</h3>
            <p><strong>Email:</strong> {c.email}</p>
            <p><strong>Specialization:</strong> {c.specialization?.join(", ") || "N/A"}</p>
            <p><strong>Session Type:</strong> {c.sessionType?.join(", ") || "N/A"}</p>
            <p><strong>Target Student:</strong> {c.targetStudent?.join(", ") || "N/A"}</p>
          </div>

          <button
            style={{
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              height: "40px",
            }}
            onClick={() => handleSendRequest(c._id)}
          >
            Send Request
          </button>
        </div>
      ))}
    </div>
  );
};

export default CounselorList;
