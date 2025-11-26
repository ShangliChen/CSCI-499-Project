import React from "react";
import { useNavigate } from "react-router-dom";

const articlesData = [
  {
    id: 1,
    title: "How to Handle Exam Stress Effectively",
    description: "Learn strategies to manage anxiety and perform your best during exams.",
  },
  {
    id: 2,
    title: "Simple Self-Care Tips for Students",
    description: "Discover simple ways to take care of your mental and physical well-being.",
  },
  {
    id: 3,
    title: "How to Stay Motivated When Overwhelmed",
    description: "Tips for regaining focus and energy when everything feels too much.",
  },
  {
    id: 4,
    title: "Signs of Academic Burnout & How to Recover",
    description: "Recognize early signs of burnout and learn practical recovery methods.",
  },
  {
    id: 5,
    title: "How Sleep Affects Your Mental Health",
    description: "Understand the connection between sleep and mental wellness.",
  },
];

const Articles = () => {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Mental Health Articles
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {articlesData.map((article) => (
            <div
              key={article.id}
              className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer"
              onClick={() => navigate(`/articles/${article.id}`)}
            >
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                {article.title}
              </h2>
              <p className="text-gray-700 mb-6">{article.description}</p>
              <button
                className="px-4 py-2 bg-[#98D7C2] rounded-md hover:shadow-2xl"
              >
                Read More →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Articles;
