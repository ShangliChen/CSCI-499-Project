// src/pages/AnxietyAssessment.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

// === Reusable Assessment Component ===
function Assessment({ title, questions, options, interpretScore, onComplete, pdfLink }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (qIndex, value) => {
    setAnswers({ ...answers, [qIndex]: value });
  };

  const getButtonColor = (value) => {
    switch (value) {
      case 0:
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
    const total = Object.values(answers).reduce((a, b) => a + (b || 0), 0);
    const interpretation = interpretScore(total);
    const resultObj = { score: total, interpretation };
    setResult(resultObj);
    onComplete(title.toLowerCase(), total, interpretation.toLowerCase());
  };

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-lg shadow-lg mb-12 bg-white">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-600">{title}</h1>

      <form className="space-y-8">
        {questions.map((q, i) => (
          <div key={i}>
            <p className="font-bold mb-3 text-gray-600 text-lg">
              {i + 1}. {q}
            </p>
            <div className="flex gap-4 flex-wrap justify-center">
              {options.map((opt, j) => (
                <div key={j} className="flex flex-col items-center">
                  <button
                    type="button"
                    onClick={() => handleChange(i, opt.value)}
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition transform
                      ${
                        answers[i] === opt.value
                          ? getButtonColor(opt.value) + " scale-105 shadow-lg"
                          : "bg-white border-gray-300 hover:scale-105 hover:shadow-md"
                      }`}
                  >
                    <img src={opt.img} alt={opt.text} className="w-5 h-5" />
                  </button>
                  <span className="mt-1 text-xs font-semibold text-black text-center">
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
        <div
          className="mt-6 p-4 border border-green-300 rounded-lg text-center"
          style={{ backgroundColor: "#D5D5CC" }}
        >
          <p className="font-bold text-lg text-black">Your Score: {result.score}</p>
          <p className="mt-2 font-bold text-black">{result.interpretation}</p>
        </div>
      )}

      {pdfLink && (
        <div className="mt-6">
          <a
            href={pdfLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline font-medium hover:text-blue-700 transition text-xs"
          >
            View Full Assessment Guide (PDF)
          </a>
        </div>
      )}
    </div>
  );
}

// === Questionnaires and Interpretation ===
const gad7Questions = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];
const gad7Options = [
  { text: "Not at all", value: 0, img: "/images/satisfy.png" },
  { text: "Several days", value: 1, img: "/images/good.png" },
  { text: "More than half the days", value: 2, img: "/images/neutral.png" },
  { text: "Nearly every day", value: 3, img: "/images/bad.png" },
];
const interpretGAD7 = (score) => {
  if (score <= 4) return "Minimal anxiety";
  if (score <= 9) return "Mild anxiety";
  if (score <= 14) return "Moderate anxiety";
  return "Severe anxiety";
};

const k10Questions = [
  "Felt tired out for no good reason",
  "Felt nervous",
  "Felt so nervous nothing could calm you down",
  "Felt hopeless",
  "Felt restless or fidgety",
  "Felt so restless you couldn’t sit still",
  "Felt depressed",
  "Felt that everything was an effort",
  "Felt so sad nothing could cheer you up",
  "Felt worthless",
];
const k10Options = [
  { text: "None of the time", value: 1, img: "/images/satisfy.png" },
  { text: "A little of the time", value: 2, img: "/images/good.png" },
  { text: "Some of the time", value: 3, img: "/images/neutral.png" },
  { text: "Most of the time", value: 4, img: "/images/bad.png" },
  { text: "All of the time", value: 5, img: "/images/unsatisfy.png" },
];
const interpretK10 = (score) => {
  if (score <= 20) return "Low distress";
  if (score <= 29) return "Moderate distress";
  return "Severe distress";
};

const phq9Questions = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself",
  "Trouble concentrating",
  "Moving or speaking slowly or too fast",
  "Thoughts of being better off dead or hurting yourself",
];
const phq9Options = [
  { text: "Not at all", value: 0, img: "/images/satisfy.png" },
  { text: "Several days", value: 1, img: "/images/good.png" },
  { text: "More than half the days", value: 2, img: "/images/neutral.png" },
  { text: "Nearly every day", value: 3, img: "/images/bad.png" },
];
const interpretPHQ9 = (score) => {
  if (score <= 4) return "Minimal depression";
  if (score <= 9) return "Mild depression";
  if (score <= 14) return "Moderate depression";
  if (score <= 19) return "Moderately severe depression";
  return "Severe depression";
};

const who5Questions = [
  "I have felt cheerful and in good spirits",
  "I have felt calm and relaxed",
  "I have felt active and vigorous",
  "I woke up feeling fresh and rested",
  "My daily life has been filled with things that interest me",
];
const who5Options = [
  { text: "At no time", value: 0, img: "/images/unsatisfy.png" },
  { text: "Some of the time", value: 1, img: "/images/unsatisfy.png" },
  { text: "Less than half of the time", value: 2, img: "/images/bad.png" },
  { text: "More than half of the time", value: 3, img: "/images/neutral.png" },
  { text: "Most of the time", value: 4, img: "/images/good.png" },
  { text: "All of the time", value: 5, img: "/images/satisfy.png" },
];
const interpretWHO5 = (score) => {
  const total = score * 4;
  if (total >= 75) return "Excellent well-being";
  if (total >= 50) return "Moderate well-being";
  return "Low well-being. Severe Mental Health Concerns";
};

// === Summary Component ===
function Summary({ severityList, combinedIndex }) {
  const moderateConditions = severityList.filter(
    (s) => s.severity.includes("moderate") && !s.severity.includes("severe")
  );
  const severeConditions = severityList.filter(
    (s) => s.severity.includes("severe") || s.severity.includes("high")
  );

  const showPositiveMessage =
    moderateConditions.length === 0 &&
    severeConditions.length === 0 &&
    severityList.length === 4;

  // === 🔥 Save to Database once all assessments are complete ===
  const user = JSON.parse(localStorage.getItem("user"));

  const handleFinalSubmit = async () => {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Check if user data exists and has an _id
  if (!user || !user.userId) {
    alert("User not logged in. Please log in first.");
    return;
  }

  if (severityList.length !== 4 || combinedIndex === null) {
    alert("Please complete all assessments before submitting.");
    return;
  }

  const anxiety = severityList.find((r) => r.test.includes("anxiety"));
  const depression = severityList.find((r) => r.test.includes("depression"));
  const stress = severityList.find((r) => r.test.includes("stress"));
  const wellbeing = severityList.find((r) => r.test.includes("well-being"));

  const payload = {
    userId: user.userId,
    anxiety_assessment: anxiety?.score || 0,
    depression_assessment: depression?.score || 0,
    stress_assessment: stress?.score || 0,
    wellbeing_assessment: wellbeing?.score || 0,
    overall_result: combinedIndex,
    overall_status: severeConditions.length
      ? "Severe"
      : moderateConditions.length
      ? "Moderate"
      : "Good",
  };

  try {
    const res = await axios.post("http://localhost:5000/api/assessments/save", payload);
    alert("✅ Assessment submitted successfully!");
    console.log("✅ Saved:", res.data);
  } catch (err) {
    console.error("❌ Error submitting assessment:", err);
    alert("Failed to submit assessment.");
  }
};


  return (
    <div className="max-w-3xl mx-auto p-6 mt-12 mb-24 rounded-lg shadow-lg bg-gradient-to-b from-gray-50 to-gray-100">
      <h2 className="text-2xl font-bold mb-4 text-center text-black">Summary</h2>

      {combinedIndex !== null && (
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-black">
            🧠 Overall Mental Health Index (MHI): {combinedIndex.toFixed(1)} / 100
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            *This is an approximate wellness indicator combining all four
            assessments for reflection purposes only.*<br />
            <a
              href="/docs/Monthly_Mental_Health_Index_Report.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline mt-2 inline-block"
            >
              View PDF: How the summary result is calculated
            </a>
          </p>
        </div>
      )}

      {/* 🔘 NEW SUBMIT BUTTON */}
      <div className="text-center mt-6">
        <button
          onClick={handleFinalSubmit}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
        >
          Submit Final Assessment
        </button>
      </div>

      {/* Rest of Summary remains the same */}
      {severeConditions.length > 0 && (
        <div className="mb-6 text-red-700 font-semibold text-center">
          <p className="mb-4">
            🔴 Your results suggest you may be experiencing severe levels of distress.
          </p>
          <p className="mb-4">
            This may include symptoms like overwhelming sadness, persistent anxiety, loss of interest, or thoughts of hopelessness.
            You are not alone — and help is available.
          </p>
          <p className="mb-4">
            💬 It’s strongly recommended that you speak with a licensed mental health professional as soon as possible.
          </p>
          <div className="text-center">
            <Link
              to="/resources/booking"
              className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition inline-block text-center"
            >
              Booking Counselor Appointment
            </Link>
          </div>
          <div className="mt-8 text-sm text-red-800 text-center">
            <p className="font-semibold mb-2">
              🚨 If you're in crisis or thinking about harming yourself:
            </p>
            <p>
              Please reach out immediately to a local emergency service or mental health crisis line in your country.
              <br />
              <strong>United States:</strong> 988 Suicide & Crisis Lifeline – Call or text <strong>988</strong>
            </p>
          </div>
        </div>
      )}

      {moderateConditions.length > 0 && severeConditions.length === 0 && (
        <div className="mb-6 text-center text-black">
          <p className="mb-4">
            Your results suggest you may be experiencing moderate levels of{" "}
            {moderateConditions.map((c) => c.test).join(", ")}.
          </p>
          <p className="mb-4">
            You're not alone. Below are trusted resources that can support you.
          </p>
          <Link
            to="/resource"
            className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition inline-block text-center"
          >
            Resources
          </Link>
        </div>
      )}
      {showPositiveMessage && (
        <div className="text-center text-green-700 font-semibold">
          <p className="mb-4 text-lg">
            🟢 You're Doing Well. Keep Taking Care of Yourself!
          </p>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-gray-100 p-6 mt-12 mb-20 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4 text-black text-center">📚 Official Assessment Tools Used</h2>
        <p className="text-sm text-gray-800 mb-4">
          The mental health assessments in this tool are based on widely recognized and clinically validated psychological screening instruments:
        </p>

        <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
          <li>
            <strong>GAD-7 (Generalized Anxiety Disorder-7):</strong> Developed by Spitzer et al., 2006.
            <a href="https://www.phqscreeners.com/select-screener" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              View official resource
            </a>
          </li>
          <li>
            <strong>PHQ-9 (Patient Health Questionnaire-9):</strong> Developed by Kroenke, Spitzer & Williams, 2001.
            <a href="https://www.phqscreeners.com/select-screener" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              View official resource
            </a>
          </li>
          <li>
            <strong>K10 (Kessler Psychological Distress Scale):</strong> Developed by Ronald C. Kessler et al., 2002.
            <a href="https://www.hcp.med.harvard.edu/ncs/k6_scales.php" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              Learn more
            </a>
          </li>
          <li>
            <strong>WHO-5 Well-Being Index:</strong> Developed by the World Health Organization.
            <a href="https://www.psykiatri-regionh.dk/who-5/Pages/default.aspx" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
              WHO official page
            </a>
          </li>
        </ul>

        <p className="text-xs text-gray-600 mt-6">
          ⚠️ These tools are screening instruments and not intended to provide a clinical diagnosis. For personalized support, consult a licensed mental health professional.
        </p>
      </div>
    </div>
  );
}

// === Main Component ===
export default function CombinedAssessments() {
  const [severityList, setSeverityList] = useState([]);
  const [combinedIndex, setCombinedIndex] = useState(null);

  const handleAssessmentComplete = (test, score, severity) => {
    setSeverityList((prev) => {
      const updated = [...prev.filter((s) => s.test !== test), { test, score, severity }];
      if (updated.length === 4) {
        const newIndex = calculateCombinedIndex(updated);
        setCombinedIndex(newIndex);
      }
      return updated;
    });
  };

  const calculateCombinedIndex = (results) => {
    const gad = results.find((r) => r.test.includes("anxiety"))?.score || 0;
    const k10 = results.find((r) => r.test.includes("depression"))?.score || 0;
    const phq = results.find((r) => r.test.includes("stress"))?.score || 0;
    const who = results.find((r) => r.test.includes("well-being"))?.score || 0;

    const normalized =
      (gad / 21) * 25 +
      (k10 / 50) * 25 +
      (phq / 27) * 25 +
      ((100 - who * 4) / 100) * 25;

    return 100 - normalized;
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-b from-green-100 to-white">
      <Assessment
        title="Anxiety Assessment (GAD-7)"
        questions={gad7Questions}
        options={gad7Options}
        interpretScore={interpretGAD7}
        onComplete={handleAssessmentComplete}
        pdfLink="/docs/GAD-7_Anxiety-updated_0.pdf"
      />
      <Assessment
        title="Depression Assessment (K10)"
        questions={k10Questions}
        options={k10Options}
        interpretScore={interpretK10}
        onComplete={handleAssessmentComplete}
        pdfLink="/docs/kessler-psychological-distress-scale-k101.pdf"
      />
      <Assessment
        title="Stress Assessment (PHQ-9)"
        questions={phq9Questions}
        options={phq9Options}
        interpretScore={interpretPHQ9}
        onComplete={handleAssessmentComplete}
        pdfLink="/docs/patient-health-questionnaire.pdf"
      />
      <Assessment
        title="Well-being Assessment (WHO-5)"
        questions={who5Questions}
        options={who5Options}
        interpretScore={interpretWHO5}
        onComplete={handleAssessmentComplete}
        pdfLink="/docs/who5.pdf"
      />

      <Summary severityList={severityList} combinedIndex={combinedIndex} />
    </div>
  );
}
