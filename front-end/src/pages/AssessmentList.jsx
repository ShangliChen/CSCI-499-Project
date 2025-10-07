import React, { useEffect, useState } from "react";

const AssessmentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/students");
        const data = await res.json();
        setStudents(data);
      } catch (error) {
        console.error("Error fetching student assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#f5f5f0] p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        Student Assessment Records
      </h1>

      <div className="overflow-x-auto bg-white shadow-md rounded-xl p-6">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-[#98D7C2] text-left text-white">
              <th className="py-3 px-4 rounded-tl-lg">Name</th>
              <th className="py-3 px-4">School ID</th>
              <th className="py-3 px-4">Assessment Date</th>
              <th className="py-3 px-4 rounded-tr-lg">Score</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{student.name}</td>
                <td className="py-3 px-4">{student.school_id}</td>
                <td className="py-3 px-4">
                  {student.assessment_date
                    ? new Date(student.assessment_date).toLocaleDateString()
                    : "Not yet taken"}
                </td>
                <td className="py-3 px-4">
                  {student.assessment_score || "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssessmentList;
