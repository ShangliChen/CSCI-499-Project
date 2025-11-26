import React, { useState, useEffect, useRef } from "react";

// Exercise definitions
const exercises = [
  {
    id: 1,
    title: "Box Breathing",
    description:
      "Follow the circle: Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat 4 times.",
    type: "breathing",
  },
  {
    id: 2,
    title: "1-Minute Meditation",
    description: "Close your eyes and focus on your breath. Tick sound guides you.",
    type: "meditation",
    duration: 60, // seconds
  },
  {
    id: 3,
    title: "Grounding Exercise",
    description:
      "Notice 5 things you can see, 4 things you can touch, 3 things you can hear.",
    type: "read",
  },
  {
    id: 4,
    title: "Desk Stretch",
    description:
      "Roll shoulders, stretch arms, and gently twist your torso for 1–2 minutes.",
    type: "read",
  },
];

const breathingSteps = ["Inhale", "Hold", "Exhale", "Hold"];

const CopingTechniques = () => {
  const [activeExercise, setActiveExercise] = useState(null);

  // Breathing state
  const [stepIndex, setStepIndex] = useState(0);
  const [stepTime, setStepTime] = useState(4);
  const [rounds, setRounds] = useState(0);

  // Meditation state
  const [timeLeft, setTimeLeft] = useState(60);
  const [isMeditating, setIsMeditating] = useState(false);

  // Tick sound for meditation
  const playTick = () => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  };

  // Breathing timer
  useEffect(() => {
    if (!activeExercise || activeExercise.type !== "breathing" || rounds >= 4)
      return;

    const timer = setTimeout(() => {
      if (stepTime > 0) {
        setStepTime(stepTime - 1);
      } else {
        const nextStep = (stepIndex + 1) % 4;
        if (nextStep === 0) setRounds(rounds + 1);
        setStepIndex(nextStep);
        setStepTime(4);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [stepTime, stepIndex, activeExercise, rounds]);

  // Meditation timer
  useEffect(() => {
    if (!isMeditating || timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
      playTick();
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isMeditating]);

  // Start an exercise
  const startExercise = (exercise) => {
    setActiveExercise(exercise);

    if (exercise.type === "breathing") {
      setStepIndex(0);
      setStepTime(4);
      setRounds(0);
    }

    if (exercise.type === "meditation") {
      setTimeLeft(exercise.duration);
      setIsMeditating(true);
    }
  };

  // Reset active exercise
  const resetExercise = () => {
    setActiveExercise(null);
    setStepIndex(0);
    setStepTime(4);
    setRounds(0);
    setIsMeditating(false);
    setTimeLeft(60);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center px-6 py-12"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">
          Coping Techniques
        </h1>

        {/* Exercise selection */}
        {!activeExercise && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer"
                onClick={() => startExercise(exercise)}
              >
                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                  {exercise.title}
                </h2>
                <p className="text-gray-700">{exercise.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Active Exercise Display */}
        {activeExercise && (
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg max-w-md mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              {activeExercise.title}
            </h2>

            {/* Breathing Exercise */}
            {activeExercise.type === "breathing" && rounds < 4 && (
              <>
                <p className="text-gray-700 mb-6 text-lg font-medium">
                  {breathingSteps[stepIndex]} ({stepTime}s)
                </p>
                <div
                  className="mx-auto w-32 h-32 rounded-full bg-[#98FF98]/50 flex items-center justify-center text-xl font-bold text-gray-800 transition-transform duration-1000"
                  style={{
                    transform:
                      breathingSteps[stepIndex] === "Inhale"
                        ? "scale(1.2)"
                        : breathingSteps[stepIndex] === "Exhale"
                        ? "scale(0.8)"
                        : "scale(1)",
                  }}
                >
                  {breathingSteps[stepIndex]}
                </div>
                <p className="mt-4 text-gray-600">
                  Round {rounds + 1} of 4
                </p>
              </>
            )}

            {activeExercise.type === "breathing" && rounds === 4 && (
              <button
                onClick={resetExercise}
                className="px-4 py-2 mt-6 bg-[#98FF98] rounded-md hover:bg-[#7EE794]"
              >
                Done
              </button>
            )}

            {/* Meditation */}
            {activeExercise.type === "meditation" && (
              <div className="flex flex-col items-center mb-6">
                {timeLeft > 0 ? (
                  <>
                    <p className="text-gray-700 mb-6 text-lg">
                      Meditation in progress… Close your eyes and follow the tick sound.
                    </p>

                    {/* Circular timer */}
                    <div className="relative w-40 h-40 mx-auto">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {/* Background circle */}
                        <circle
                          className="text-gray-300"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="54"
                          cx="60"
                          cy="60"
                        />
                        {/* Progress circle */}
                        <circle
                          className="text-green-500"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="54"
                          cx="60"
                          cy="60"
                          strokeDasharray={2 * Math.PI * 54}
                          strokeDashoffset={((2 * Math.PI * 54) * (60 - timeLeft)) / 60}
                          strokeLinecap="round"
                        />
                      </svg>

                      {/* Timer text centered */}
                      <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">
                        {timeLeft}s
                      </div>
                    </div>


                  </>
                ) : (
                  <>
                    <p className="text-3xl text-gray-800 font-bold mb-4">Done!</p>
                    <button
                      onClick={resetExercise}
                      className="px-4 py-2 bg-[#98FF98] rounded-md hover:bg-[#7EE794]"
                    >
                      Go back
                    </button>
                  </>
                )}
              </div>
            )}


            {/* Read Exercises */}
            {activeExercise.type === "read" && (
              <div className="flex flex-col items-center">
                <p className="text-gray-700 mb-6 text-center">{activeExercise.description}</p>

                {/* Only show image for Desk Stretch */}
                {activeExercise.title === "Desk Stretch" && (
                  <img 
                    src="/images/desk-stretch.png" 
                    alt="Desk Stretch" 
                    className="w-full max-w-md rounded-lg mb-4" 
                  />
                )}

                <button
                  onClick={resetExercise}
                  className="px-4 py-2 bg-[#98FF98] rounded-md hover:bg-[#7EE794]"
                >
                  Back
                </button>
              </div>
            )}


          </div>
        )}
      </div>
    </div>
  );
};

export default CopingTechniques;
