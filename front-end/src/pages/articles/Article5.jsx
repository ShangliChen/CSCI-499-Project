import React from "react";
import { useNavigate } from "react-router-dom";

const Article5 = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">How Sleep Affects Your Mental Health</h1>

        <p className="mb-4">
          Sleep plays a vital role in mood regulation, memory, concentration, and emotional stability. Poor sleep can significantly affect mental health—especially for students.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Sleep Improves Memory</h2>
        <p className="mb-4">Good sleep helps your brain store and recall information more effectively—important for learning.</p>

        <h2 className="text-2xl font-semibold mt-6">2. Lack of Sleep Increases Stress</h2>
        <p className="mb-4">Sleep deprivation triggers cortisol (stress hormone), making you feel anxious and irritable.</p>

        <h2 className="text-2xl font-semibold mt-6">3. Healthy Sleep Tips</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Maintain a consistent sleep schedule</li>
          <li>Avoid screens before bed</li>
          <li>Keep your room dark and cool</li>
          <li>Avoid caffeine late in the day</li>
        </ul>

        <p className="font-semibold mt-8">
          Even small improvements in your sleep habits can greatly benefit your mental well-being.
        </p>

        {/* Navigation */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => navigate("/articles")}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            ← Back to All Articles
          </button>

          <div className="space-x-4">
            <button
              onClick={() => navigate("/articles/4")}
              className="px-4 py-2 bg-[#98D7C2] rounded-md hover:shadow-2xl"
            >
              ← Previous
            </button>

            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Article5;
