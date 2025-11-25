import React from "react";
import { useNavigate } from "react-router-dom";

const Article3 = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">How to Stay Motivated When Overwhelmed</h1>

        <p className="mb-4">
          Feeling overwhelmed is normal—especially when juggling multiple responsibilities. Here are ways to regain motivation.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Break Tasks into Smaller Steps</h2>
        <p className="mb-4">
          Large tasks can feel scary. Break them into tiny actions and focus on one at a time.
        </p>

        <h2 className="text-2xl font-semibold mt-6">2. Set Realistic Goals</h2>
        <p className="mb-4">
          You don't need to be perfect. Set goals that feel achievable and celebrate every small win.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. Avoid Overloading Yourself</h2>
        <p className="mb-4">
          Saying “yes” to everything leads to burnout. Prioritize your tasks.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Take Breaks Without Guilt</h2>
        <p className="mb-4">
          Resting is part of productivity. A tired mind cannot stay motivated.
        </p>

        <p className="font-semibold mt-8">
          Motivational dips happen to everyone—be kind to yourself.
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
              onClick={() => navigate("/articles/2")}
              className="px-4 py-2 bg-[#98D7C2] rounded-md hover:shadow-2xl"
            >
              ← Previous
            </button>

            <button
              onClick={() => navigate("/articles/4")}
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

export default Article3;
