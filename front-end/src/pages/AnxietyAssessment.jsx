import React, { useState } from "react";

const anxietyQuestions = [
  "In the past 4 weeks, how often did you feel nervous, anxious, or on edge?",
  "How often did you feel restless or unable to relax?",
  "How often did you have difficulty controlling worry?",
  "How often did you feel panic or sudden fear?",
  "How often did you feel uneasy in social situations?",
  "How often did you feel your mind going blank due to worry?",
  "How often did you experience physical symptoms (sweating, palpitations)?",
  "How often did you feel tense in anticipation of events?",
  "How often did you avoid situations due to anxiety?",
  "How often did you feel anxious even without a clear reason?"
];

const options = [
  { text: "None of the time", value: 1, img: "/images/satisfy.png" },
  { text: "A little of the time", value: 2, img: "/images/good.png" },
  { text: "Some of the time", value: 3, img: "/images/neutral.png" },
  { text: "Most of the time", value: 4, img: "/images/bad.png" },
  { text: "All of the time", value: 5, img: "/images/unsatisfy.png" },
];

export default function AnxietyAssessment() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  const getButtonColor = (value) => {
    switch (value) {
      case 1: return "bg-green-400 border-green-500";
      case 2: return "bg-lime-300 border-lime-400";
      case 3: return "bg-yellow-300 border-yellow-400";
      case 4: return "bg-orange-400 border-orange-500";
      case 5: return "bg-red-500 border-red-600";
      default: return "bg-white border-gray-300";
    }
  };

  const calculateScore = (e) => {
    e.preventDefault();
    const total = Object.values(answers).reduce((a, b) => a + (b || 0), 0);

    let interpretation = "";
    if (total <= 8) interpretation = "Low anxiety 🙂";
    else if (total <= 15) interpretation = "Moderate anxiety ⚠️";
    else interpretation = "High anxiety ❗ Consider consulting a professional.";

    setResult({ score: total, interpretation });
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "#A8E6CF" }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          Anxiety Assessment
        </h1>

        <form className="space-y-8">
          {anxietyQuestions.map((q, i) => (
            <div key={i}>
              <p className="font-bold mb-3 text-black">
                {i + 1}. {q}
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                {options.map((opt, j) => (
                  <div key={j} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleChange(i, opt.value)}
                      className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition transform
                        ${
                          answers[i] === opt.value
                            ? getButtonColor(opt.value) + " scale-105 shadow-lg"
                            : "bg-white border-gray-300 hover:scale-105 hover:shadow-md"
                        }`}
                    >
                      <img src={opt.img} alt={opt.text} className="w-10 h-10" />
                    </button>
                    <span className="mt-1 text-xs font-bold text-black text-center">
                      {opt.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-6">
            <button
              onClick={calculateScore}
              className="px-8 py-3 bg-teal-500 text-white font-semibold rounded-full shadow-lg hover:bg-teal-600 transform hover:scale-105 transition-all duration-300"
            >
              Submit Assessment
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-white border border-green-300 rounded-lg text-center">
            <p className="font-bold text-lg text-black">
              Your Score: {result.score}
            </p>
            <p className="mt-2 font-bold text-black">{result.interpretation}</p>
          </div>
        )}

      </div>
    </div>
  );
}
