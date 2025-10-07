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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold text-green-900 mb-8">
        Health Assessment Selection
      </h1>

      <p className="text-gray-800 mb-12 text-center max-w-2xl text-xl leading-relaxed">
        Choose a mental health assessment to begin.  
        Each test measures different emotional states you may experience.
      </p>

      <div className="flex flex-col md:flex-row gap-10 w-full max-w-6xl justify-center">
        {tests.map((test, index) => (
          <div
            key={index}
            className="cursor-pointer bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center hover:scale-110 border-2 border-green-100 hover:border-green-200"
            onClick={() => navigate(test.route)}
          >
            <img src={test.img} alt={test.title} className="w-40 h-40 object-contain mb-6" />
            <span className="text-2xl font-bold text-gray-900">{test.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssessmentSelection;