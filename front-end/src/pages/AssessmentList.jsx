import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const AssessmentList = () => {
  const [students, setStudents] = useState([]);
  const [assignedStudents, setAssignedStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const counselorId = user?.userId;

        // Fetch all students
        const res1 = await fetch("http://localhost:5000/api/users/students");
        const allStudents = await res1.json();

        // Fetch assigned students
        const res2 = await fetch(
          `http://localhost:5000/api/counselor-requests/assigned/${counselorId}`
        );
        const assignedData = await res2.json();

        setStudents(allStudents);
        setAssignedStudents(assignedData.students || []);
      } catch (err) {
        console.error("Error loading students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  // Remove duplicates
  const otherStudents = students.filter(
    (s) => !assignedStudents.some((a) => a._id === s._id)
  );

  // Apply search filter
  const matchesSearch = (student) => {
      if (!student) return false;

      const name = student.name ? student.name.toLowerCase() : "";
      const school = student.school_id ? student.school_id.toLowerCase() : "";

      const term = searchTerm.toLowerCase();

      return name.includes(term) || school.includes(term);
    };


  const filteredAssigned = assignedStudents.filter(matchesSearch);
  const filteredOthers = otherStudents.filter(matchesSearch);

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Student Assessment Records
      </h1>

      {/* ⭐ Search Bar */}
      <input
        type="text"
        placeholder="Search by name or school ID..."
        className="w-full max-w-md p-3 mb-6 border rounded-lg shadow-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* ===================== */}
      {/* ⭐ 1. YOUR STUDENTS */}
      {/* ===================== */}
      <h2 className="text-xl font-semibold mb-3 text-green-700">
        Your Students
      </h2>

      <div className="overflow-x-auto bg-white shadow-md rounded-xl p-6 mb-10">
        {filteredAssigned.length === 0 ? (
          <p className="text-gray-500 italic">No students found.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-[#00786f] text-left text-white">
                <th className="py-3 px-4 rounded-tl-lg">Name</th>
                <th className="py-3 px-4">School ID</th>
                <th className="py-3 px-4">Assessment Date</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssigned.map((student) => (
                <tr
                  key={`assigned-${student._id}`}
                  className="border-b bg-green-50 hover:bg-green-100"
                >
                  <td className="py-3 px-4 font-semibold">{student.name}</td>
                  <td className="py-3 px-4">{student.school_id}</td>
                  <td className="py-3 px-4">
                    {student.assessment_date
                      ? new Date(student.assessment_date).toLocaleDateString()
                      : "Not yet taken"}
                  </td>
                  <td className="py-3 px-4">
                    {student.assessment_score
                      ? Math.round(student.assessment_score)
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/counselor/user/${student._id}`}
                      className="inline-block bg-[#b3e6b3] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-blue-700 transition"
                    >
                      See More
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===================== */}
      {/* ⭐ 2. OTHER STUDENTS */}
      {/* ===================== */}
      <h2 className="text-xl font-semibold mb-3 text-gray-700">
        Other Students
      </h2>

      <div className="overflow-x-auto bg-white shadow-md rounded-xl p-6">
        {filteredOthers.length === 0 ? (
          <p className="text-gray-500 italic">No students found.</p>
        ) : (
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-[#98D7C2] text-left text-white">
                <th className="py-3 px-4 rounded-tl-lg">Name</th>
                <th className="py-3 px-4">School ID</th>
                <th className="py-3 px-4">Assessment Date</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4 rounded-tr-lg">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOthers.map((student) => (
                <tr
                  key={`other-${student._id}`}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.school_id}</td>
                  <td className="py-3 px-4">
                    {student.assessment_date
                      ? new Date(student.assessment_date).toLocaleDateString()
                      : "Not yet taken"}
                  </td>
                  <td className="py-3 px-4">
                    {student.assessment_score
                      ? Math.round(student.assessment_score)
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/counselor/user/${student._id}`}
                      className="inline-block bg-[#98D7C2] text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-blue-700 transition"
                    >
                      See More
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AssessmentList;
