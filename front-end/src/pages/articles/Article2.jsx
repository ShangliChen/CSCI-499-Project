import React from "react";
import { useNavigate } from "react-router-dom";

const Article2 = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Simple Self-Care Tips for Students</h1>

        <p className="mb-4">
          Self-care isn't a luxury—it's a necessity. Students often forget to
          take care of themselves while juggling studies, deadlines, and social responsibilities.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Take Breaks Regularly</h2>
        <p className="mb-4">
          Short breaks prevent burnout. Take a 5-minute break after every 25 minutes of studying.
        </p>

        <h2 className="text-2xl font-semibold mt-6">2. Eat Balanced Meals</h2>
        <p className="mb-4">
          Nutritious food fuels your brain. Try adding more fruits and vegetables to your meals.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. Move Your Body</h2>
        <p className="mb-4">
          You don't need intense workouts—simple stretching or a short walk is enough to boost your mood.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Practice Saying “No”</h2>
        <p className="mb-4">
          It is okay to protect your time and energy. Setting boundaries is an important act of self-care.
        </p>

        <p className="font-semibold mt-8">
          Self-care helps you become more productive, focused, and emotionally balanced.
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
              onClick={() => navigate("/articles/1")}
              className="px-4 py-2 bg-[#98D7C2] rounded-md hover:shadow-2xl"
            >
              ← Previous
            </button>

            <button
              onClick={() => navigate("/articles/3")}
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

export default Article2;
