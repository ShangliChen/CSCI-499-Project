import React, { useState } from "react";

const k10Questions = [
  "In the past 4 weeks, about how often did you feel tired out for no good reason?",
  "In the past 4 weeks, about how often did you feel nervous?",
  "In the past 4 weeks, about how often did you feel so nervous that nothing could calm you down?",
  "In the past 4 weeks, about how often did you feel hopeless?",
  "In the past 4 weeks, about how often did you feel restless or fidgety?",
  "In the past 4 weeks, about how often did you feel so restless you could not sit still?",
  "In the past 4 weeks, about how often did you feel depressed?",
  "In the past 4 weeks, about how often did you feel that everything was an effort?",
  "In the past 4 weeks, about how often did you feel so sad that nothing could cheer you up?",
  "In the past 4 weeks, about how often did you feel worthless?"
];

const k10Options = [
  { text: "None of the time", value: 1, img: "/images/satisfy.png" },
  { text: "A little of the time", value: 2, img: "/images/good.png" },
  { text: "Some of the time", value: 3, img: "/images/neutral.png" },
  { text: "Most of the time", value: 4, img: "/images/bad.png" },
  { text: "All of the time", value: 5, img: "/images/unsatisfy.png" },
];

export default function HealthAssessment() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  const getButtonColor = (value) => {
    switch (value) {
      case 1:
        return "bg-green-400 border-green-500"; 
      case 2:
        return "bg-lime-300 border-lime-400";
      case 3:
        return "bg-yellow-300 border-yellow-400";
      case 4:
        return "bg-orange-400 border-orange-500";
      case 5:
        return "bg-red-500 border-red-600"; 
      default:
        return "bg-white border-gray-300";
    }
  };

  const calculateScore = (e) => {
    e.preventDefault();
    const values = { ...answers };

    if (values[1] === 1) values[2] = 1;
    if (values[4] === 1) values[5] = 1;

    const total = Object.values(values).reduce((a, b) => a + (b || 0), 0);

    let interpretation = "";
    if (total <= 19) interpretation = "Below stress level 🙂 (Likely to be well)";
    else if (total <= 24) interpretation = "Mild psychological distress 💡";
    else if (total <= 29) interpretation = "Moderate psychological distress ⚠️";
    else interpretation = "Severe psychological distress ❗ We recommend consulting a therapist.";

    setResult({ score: total, interpretation });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] py-8"> {/* Pearl white outer background */}
      <div className="container mx-auto px-4 max-w-3xl bg-[#26619C] p-6 rounded-xl shadow-md"> {/* Lapis Lazuli container */}
        
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Health Assessment Tool
        </h1>

        <form className="space-y-8">
          {k10Questions.map((q, i) => (
            <div key={i}>
              <p className="font-medium mb-3 text-white">{i + 1}. {q}</p>

              <div className="flex gap-4 flex-wrap justify-center">
                {k10Options.map((opt, j) => (
                  <div key={j} className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => handleChange(i, opt.value)}
                      className={`flex items-center justify-center w-16 h-16 rounded-full border-2 transition transform
                        ${answers[i] === opt.value 
                          ? getButtonColor(opt.value) + " scale-105 shadow-lg" 
                          : "bg-white border-gray-300 hover:scale-105 hover:shadow-md"}`}
                    >
                      <img src={opt.img} alt={opt.text} className="w-10 h-10" />
                    </button>
                    <span className="mt-1 text-xs text-white text-center">{opt.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="text-center mt-6">
            <button
              onClick={calculateScore}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-full shadow-lg hover:from-purple-500 hover:to-blue-500 transform hover:scale-105 transition-all duration-300"
            >
              Submit Assessment
            </button>
          </div>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="font-bold text-lg text-blue-700">Your Score: {result.score}</p>
            <p className="mt-2">{result.interpretation}</p>
          </div>
        )}

        <p className="mt-6 text-sm text-white text-center">
          Disclaimer: This tool is for informational purposes only and does not replace professional medical advice.
        </p>
      </div>
    </div>
  );
}
