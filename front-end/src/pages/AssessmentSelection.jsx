// src/pages/AssessmentSelection.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const AssessmentSelection = () => {
  const navigate = useNavigate();

  const tests = [
    { title: "Stress Assessment", route: "/resources/stress-assessment", img: "/images/stress.png" },
    { title: "Anxiety Assessment", route: "/resources/anxiety-assessment", img: "/images/anxiety.png" },
    { title: "Depression Assessment", route: "/resources/depression-assessment", img: "/images/depression.png" },
  ];

  return (
    <div className="min-h-screen bg-blue-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-8">
        Health Assessment Selection
      </h1>

      <p className="text-gray-700 mb-6 text-center max-w-md">
        Choose a mental health assessment to begin.  
        Each test measures different emotional states you may experience.
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-5xl justify-center">
        {tests.map((test, index) => (
          <div
            key={index}
            className="cursor-pointer bg-white rounded-xl shadow-md hover:shadow-lg transition p-4 flex flex-col items-center"
            onClick={() => navigate(test.route)}
          >
            <img src={test.img} alt={test.title} className="w-32 h-32 object-contain mb-4" />
            <span className="text-lg font-semibold text-gray-800">{test.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentSelection;
