import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AssessmentDetailsView() {
  const { userId } = useParams(); // Expecting /counselor/user/:userId
  const [assessments, setAssessments] = useState([]);
  const [student, setStudent] = useState(null);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/assessments/user/${userId}`);
        if (res.data.length > 0) {
          // Sort descending by date_taken for table (newest first)
          const sortedDescending = [...res.data].sort(
            (a, b) => new Date(b.date_taken) - new Date(a.date_taken)
          );
          setAssessments(sortedDescending);
          setStudent(sortedDescending[0].user); // same user assumption
        }
      } catch (err) {
        console.error("Error fetching assessments:", err);
      }
    };

    fetchAssessments();
  }, [userId]);

  // Load counselor notes for this student if counselor
  useEffect(() => {
    const loadNotes = async () => {
      if (!user || user.role !== 'counselor') return;
      try {
        const res = await axios.get(`http://localhost:5000/api/counselor/notes/${userId}?counselorId=${user.userId}`);
        if (res.data?.success) setNotes(res.data.data);
      } catch (err) {
        // no-op
      }
    };
    loadNotes();
  }, [user, userId]);

  if (!assessments.length) {
    return <p className="text-center mt-12 text-gray-500">Loading or no assessments found...</p>;
  }

  // For the graph, sort ascending by date (oldest first)
  const assessmentsAscending = [...assessments].sort(
    (a, b) => new Date(a.date_taken) - new Date(b.date_taken)
  );

  const chartData = {
    labels: assessmentsAscending.map((a) =>
      new Date(a.date_taken).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Overall Mental Health Index",
        data: assessmentsAscending.map((a) => a.overall_result),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-center mb-4 text-black">
        🧑‍🎓 {student?.name}'s Assessment History
      </h1>

      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <Line data={chartData} />
        <p className="text-center text-sm text-gray-500 mt-2">
          *Line graph shows progress over time based on overall mental health index.
        </p>
      </div>

      <div className="overflow-x-auto mb-10">
        <table className="min-w-full bg-white rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Anxiety</th>
              <th className="px-4 py-2">Depression</th>
              <th className="px-4 py-2">Stress</th>
              <th className="px-4 py-2">Well-being</th>
              <th className="px-4 py-2">MHI</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((a, i) => (
              <tr key={i} className="border-b text-sm">
                <td className="px-4 py-2">{new Date(a.date_taken).toLocaleDateString()}</td>
                <td className="px-4 py-2">{a.anxiety_assessment}</td>
                <td className="px-4 py-2">{a.depression_assessment}</td>
                <td className="px-4 py-2">{a.stress_assessment}</td>
                <td className="px-4 py-2">{a.wellbeing_assessment}</td>
                <td className="px-4 py-2">{a.overall_result.toFixed(1)}</td>
                <td className="px-4 py-2 font-semibold">
                  {a.overall_status === "Good" && <span className="text-green-600">{a.overall_status}</span>}
                  {a.overall_status === "Moderate" && <span className="text-yellow-600">{a.overall_status}</span>}
                  {a.overall_status === "Severe" && <span className="text-red-600">{a.overall_status}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Counselor notes visible to counselors only */}
      {user?.role === 'counselor' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Counselor Notes (visible to counselors)</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const content = newNote.trim();
              if (!content) return;
              try {
                const res = await axios.post("http://localhost:5000/api/counselor/notes", {
                  counselorId: user.userId,
                  studentId: userId,
                  content,
                });
                if (res.data?.success) {
                  setNewNote("");
                  setNotes((prev) => [res.data.data, ...prev]);
                }
              } catch (err) {
                // no-op
              }
            }}
            className="mb-4"
          >
            <textarea
              className="w-full border rounded p-3 min-h-[90px]"
              placeholder="Add a private note for counselors..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <button type="submit" className="mt-2 px-4 py-2 bg-gray-800 text-white rounded">Add Note</button>
          </form>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-500">No notes yet.</p>
          ) : (
            <ul className="space-y-3">
              {notes.map((n) => (
                <li key={n._id} className="border rounded p-3">
                  <div className="text-sm text-gray-700 whitespace-pre-line">{n.content}</div>
                  <div className="text-xs text-gray-400 mt-1">by {n.counselor?.name || 'Counselor'} • {new Date(n.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
