// src/pages/AssessmentSelection.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AssessmentSelection = () => {
  const navigate = useNavigate();

  const [isLocked, setIsLocked] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  const userId = user?.userId;

  const tests = [
    { title: "Stress Assessment", img: "/images/stress.png" },
    { title: "Anxiety Assessment", img: "/images/anxiety.png" },
    { title: "Depression Assessment", img: "/images/depression.png" },
  ];

  // ✅ Check if this month's assessment is already completed
  useEffect(() => {
    if (!userId) return;

    const currentMonthKey = `${userId}-${new Date().getFullYear()}-${new Date().getMonth()}`;
    const storedMonth = localStorage.getItem("checkInCompletedMonth");

    if (storedMonth === currentMonthKey) {
      setIsLocked(true); // already done for this month
    } else {
      setIsLocked(false);
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold text-green-900 mb-8">
        Health Assessment Overview
      </h1>

      <p className="text-gray-800 mb-12 text-center max-w-2xl text-xl leading-relaxed">
        Our mental health assessments help you understand your emotional well-being in areas like{" "}
        stress, anxiety, and depression. Each test uses short, research-based questions to measure{" "}
        how you've been feeling recently. Your overall score reflects your current mental health{" "}
        status. Lower scores indicate more severe symptoms.
      </p>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl justify-center">
        {tests.map((test, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center border-2 border-green-100 hover:border-green-200 transition-all duration-300 hover:scale-105"
          >
            <img
              src={test.img}
              alt={test.title}
              className="w-40 h-40 object-contain mb-6"
            />
            <span className="text-2xl font-bold text-gray-900">{test.title}</span>
          </div>
        ))}
      </div>

      <div className="mt-16">
        {/* Show button only if user role is "student" */}
        {userRole === "student" ? (
          <button
            onClick={() => {
              if (!isLocked) navigate("/resources/anxiety-assessment");
            }}
            disabled={isLocked}
            className={`px-10 py-4 text-white font-semibold text-xl rounded-full shadow-lg transform transition-all duration-300 ${
              isLocked
                ? "bg-teal-600 cursor-not-allowed"
                : "bg-teal-600 hover:bg-teal-700 hover:scale-105"
            }`}
          >
            {isLocked ? "✅ Assessment Completed for this Month" : "Start Assessment →"}
          </button>
        ) : (
          <p className="text-center text-gray-600 italic">
            Only students can start an assessment.
          </p>
        )}
      </div>
    </div>
  );
};

export default AssessmentSelection;
