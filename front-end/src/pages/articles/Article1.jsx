import React from "react";
import { useNavigate } from "react-router-dom";

const Article1 = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      {/* MAIN CONTENT CARD */}
      <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-10">

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          How to Handle Exam Stress Effectively
        </h1>

        <p className="mb-4">
          Exams play a major role in academic life, but the pressure to perform
          can create stress. Learning to manage exam anxiety can significantly
          improve your mental well-being and performance.
        </p>

        <h2 className="text-2xl font-semibold mt-6">1. Start Studying Early</h2>
        <p className="mb-4">
          Studying ahead prevents last-minute panic. Break your subjects into
          smaller, manageable chunks.
        </p>

        <ul className="list-disc ml-6 mb-4">
          <li>Create a weekly study timetable</li>
          <li>Revise topics consistently</li>
          <li>Use spaced repetition</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6">2. Practice Relaxation Techniques</h2>
        <p className="mb-4">
          Quick breathing exercises or short meditation sessions can help calm
          your body and mind.
        </p>

        <h2 className="text-2xl font-semibold mt-6">3. Get Enough Sleep</h2>
        <p className="mb-4">
          Sleep is crucial for memory and focus. Avoid late-night cramming—it usually harms performance.
        </p>

        <h2 className="text-2xl font-semibold mt-6">4. Avoid Comparisons</h2>
        <p className="mb-4">
          Everyone studies differently. Focus on your own progress instead of comparing yourself with peers.
        </p>

        <p className="font-semibold mt-8">
          Reminder: Exams are temporary. Your well-being matters the most.
        </p>

        {/* NAVIGATION */}
        <div className="mt-10 flex items-center justify-between">
          <button
            onClick={() => navigate("/articles")}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            ← Back to All Articles
          </button>

          <div className="space-x-4">
            <button
              disabled
              className="px-4 py-2 bg-gray-100 text-gray-400 rounded-md cursor-not-allowed"
            >
              Previous
            </button>

            <button
              onClick={() => navigate("/articles/2")}
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

export default Article1;
