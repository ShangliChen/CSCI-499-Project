import React from "react";
import { useNavigate } from "react-router-dom";

const Article4 = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Signs of Academic Burnout & How to Recover</h1>

        <p className="mb-4">
          Academic burnout happens when long-term stress and pressure push you beyond your limit. Recognizing it early helps prevent serious mental fatigue.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Feeling Constantly Exhausted</h2>
        <p className="mb-4">Physical and mental fatigue are early signs. Rest is not optional.</p>

        <h2 className="text-2xl font-semibold mt-6">2. Loss of Motivation</h2>
        <p className="mb-4">If even simple tasks feel impossible, you may be burned out.</p>

        <h2 className="text-2xl font-semibold mt-6">3. Difficulty Concentrating</h2>
        <p className="mb-4">Burnout affects cognitive functions, making studying harder.</p>

        <h2 className="text-2xl font-semibold mt-6">How to Recover</h2>
        <ul className="list-disc ml-6 mb-4">
          <li>Take breaks without guilt</li>
          <li>Reduce academic load if possible</li>
          <li>Prioritize sleep and nutrition</li>
          <li>Reach out to counselors or support systems</li>
        </ul>

        <p className="font-semibold mt-8">
          Burnout is not failure—it’s a signal to take care of your mental health.
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
              onClick={() => navigate("/articles/3")}
              className="px-4 py-2 bg-[#98D7C2] rounded-md hover:shadow-2xl"
            >
              ← Previous
            </button>

            <button
              onClick={() => navigate("/articles/5")}
              className="px-4 py-2 bg-[#98D7C2] rounded-md hover:shadow-2xl"
            >
              Next →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Article4;
