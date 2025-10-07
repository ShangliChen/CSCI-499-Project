import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const BookingPage = () => {
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState({
    seekingFor: "",
    patientAge: "",
    appointmentType: "",
    takenTest: "",
    testScore: ""
  });

  const sampleCounselors = [
    {
      _id: 1, name: "Dr. Emily Carter", specialty: "Anxiety & Stress",
      bio: "Emily helps individuals regain control and peace through mindfulness and behavioral therapy.",
      tags: ["Anxiety", "Stress", "Mindfulness", "Adults"]
    },
    {
      _id: 2, name: "Dr. Jason Lee", specialty: "Depression & Mood Disorders",
      bio: "Jason focuses on emotional regulation and cognitive reframing for lasting mental wellness.",
      tags: ["Depression", "Mood Disorders", "Cognitive Therapy", "Adults"]
    },
    {
      _id: 3, name: "Dr. Sofia Ramirez", specialty: "Trauma Recovery",
      bio: "Sofia empowers her clients to heal and build resilience with compassionate therapy.",
      tags: ["Trauma", "PTSD", "Resilience", "Adults"]
    },
    {
      _id: 4, name: "Dr. Michael Chen", specialty: "Child & Teen Counseling",
      bio: "Michael specializes in adolescent mental health and family dynamics.",
      tags: ["Children", "Teens", "Adolescent", "Family"]
    },
    {
      _id: 5, name: "Dr. Sarah Johnson", specialty: "Family & Couples Therapy",
      bio: "Sarah works with families and couples to improve communication and strengthen relationships.",
      tags: ["Family", "Couples", "Relationships", "Communication"]
    }
  ];

  useEffect(() => {
    setCounselors(sampleCounselors);
  }, []);

  const handleAnswer = (question, value) => {
    setAnswers(prev => ({ ...prev, [question]: value }));
  };

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);
  const skipToResults = () => setCurrentStep(6);

  const handleBooking = () => {
    if (!selectedCounselor || !selectedDate) {
      setMessage("Please select a counselor and date.");
      return;
    }
    const formattedDate = new Date(selectedDate).toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });
    setMessage(`✅ Booking confirmed with ${selectedCounselor.name} on ${formattedDate}.`);
  };

  // Generate calendar data for current month
  const generateCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();
    
    const calendar = [];
    
    // Previous month's days
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      calendar.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isAvailable: false
      });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      calendar.push({
        date,
        isCurrentMonth: true,
        isAvailable: !isWeekend && date > today
      });
    }
    
    // Next month's days
    const totalCells = 42;
    const nextMonthDays = totalCells - calendar.length;
    for (let i = 1; i <= nextMonthDays; i++) {
      calendar.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
        isAvailable: false
      });
    }
    
    return {
      calendar,
      month: today.toLocaleDateString('en-US', { month: 'long' }),
      year: currentYear
    };
  };

  const { calendar, month, year } = generateCalendar();
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const filteredCounselors = counselors.filter(counselor => {
    if (answers.seekingFor === "adult") {
      return counselor.tags.some(tag => ["Adults"].includes(tag));
    }
    if (answers.seekingFor === "child") {
      return counselor.tags.some(tag => ["Children", "Teens", "Adolescent"].includes(tag));
    }
    if (answers.seekingFor === "couple") {
      return counselor.tags.some(tag => ["Couples", "Relationships"].includes(tag));
    }
    if (answers.seekingFor === "family") {
      return counselor.tags.some(tag => ["Family", "Group Therapy"].includes(tag));
    }
    return true;
  });

  const buttonStyles = (isSelected = false) => 
    `p-6 rounded-xl border text-left transition-all hover:shadow-sm group w-full ${
      isSelected 
        ? "border-gray-900 bg-gray-900 text-white" 
        : "border-gray-300 bg-[#d4f8d4] text-gray-900 hover:border-gray-400"
    }`;

  const smallButtonStyles = (isSelected = false) =>
    `p-4 rounded-lg border text-center transition-all hover:shadow-sm ${
      isSelected
        ? "border-gray-900 bg-gray-900 text-white"
        : "border-gray-300 bg-[#d4f8d4] text-gray-900 hover:border-gray-400"
    }`;

  const steps = {
    1: {
      title: "",
      content: (
        <div className="text-center animate-fadeIn">
          <img 
            src="/images/bookingIcon.png" 
            alt="Booking" 
            className="h-32 w-32 mx-auto mb-8"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div style={{display: 'none'}} className="text-gray-600 text-sm">
            Booking Icon
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Find Your Perfect Counselor
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Answer a few questions to help us match you with the right mental health professional for your specific needs.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={skipToResults} className="px-8 py-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all text-lg">
              Show All Counselors
            </button>
            <button onClick={nextStep} className="px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all flex items-center text-lg">
              Get Started
              <ArrowRight className="ml-3 h-6 w-6" />
            </button>
          </div>
        </div>
      )
    },
    2: {
      title: "Who are you seeking care for?",
      content: (
        <div className="space-y-4">
          {[
            { value: "adult", label: "Myself or another adult", description: "Individual therapy for adults 18 and older" },
            { value: "child", label: "A child or teenager", description: "Counseling for children, teens, or adolescents" },
            { value: "couple", label: "Myself and my partner", description: "Couples counseling and relationship therapy" },
            { value: "family", label: "My family or another group", description: "Family therapy or group counseling sessions" }
          ].map(option => (
            <button key={option.value} onClick={() => { handleAnswer("seekingFor", option.value); nextStep(); }} className={buttonStyles(answers.seekingFor === option.value)}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-2">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${answers.seekingFor === option.value ? "border-white bg-white" : "border-gray-400"}`}>
                  {answers.seekingFor === option.value && <div className="w-2 h-2 bg-gray-900 rounded-full" />}
                </div>
              </div>
            </button>
          ))}
        </div>
      )
    },
    3: {
      title: "How old is the patient?",
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {["under13", "13-17", "18-25", "26-40", "41-65", "65+"].map(age => (
            <button key={age} onClick={() => { handleAnswer("patientAge", age); nextStep(); }} className={buttonStyles(answers.patientAge === age)}>
              <div className="font-semibold text-lg text-center">{age.replace(/([a-z])([0-9])/, '$1-$2')}</div>
            </button>
          ))}
        </div>
      )
    },
    4: {
      title: "Preferred session type?",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { value: "video", label: "Video Session", description: "Meet online from the comfort of your home" },
            { value: "in-person", label: "In Person", description: "Face-to-face meetings in our office" },
            { value: "phone", label: "Phone Call", description: "Traditional phone call sessions" },
            { value: "flexible", label: "Flexible", description: "Open to any of the above options" }
          ].map(option => (
            <button key={option.value} onClick={() => { handleAnswer("appointmentType", option.value); nextStep(); }} className={buttonStyles(answers.appointmentType === option.value)}>
              <div className="font-semibold text-lg mb-2">{option.label}</div>
              <div className="text-sm text-gray-600">{option.description}</div>
            </button>
          ))}
        </div>
      )
    },
    5: {
      title: "Mental Health Assessment",
      content: (
        <div className="space-y-6">
          <p className="text-gray-600 text-lg text-center">Have you taken any anxiety, depression, or stress assessments recently?</p>
          <div className="flex gap-4 justify-center mb-8">
            {["yes", "no"].map(answer => (
              <button key={answer} onClick={() => answer === "no" ? (handleAnswer("takenTest", answer), nextStep()) : handleAnswer("takenTest", answer)} className={`px-12 py-4 rounded-lg border font-semibold text-lg ${answers.takenTest === answer ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-[#d4f8d4] text-gray-700"}`}>
                {answer.charAt(0).toUpperCase() + answer.slice(1)}
              </button>
            ))}
          </div>
          {answers.takenTest === "yes" && (
            <div className="bg-[#d4f8d4] p-6 rounded-xl animate-fadeIn">
              <label className="block text-gray-700 font-medium mb-4 text-center text-lg">What was your assessment score? (if known)</label>
              <input type="number" min="0" max="100" value={answers.testScore} onChange={(e) => handleAnswer("testScore", e.target.value)} placeholder="Enter score 0-50" className="w-full p-4 border border-gray-300 rounded-lg text-center text-lg focus:outline-none focus:border-gray-900 mb-4" />
              <button onClick={nextStep} className="w-full bg-gray-900 text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-all text-lg">
                Continue to Results
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </button>
            </div>
          )}
        </div>
      )
    },
    6: {
      title: "Recommended Counselors",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredCounselors.map((counselor) => (
              <div key={counselor._id} onClick={() => setSelectedCounselor(counselor)} className={`cursor-pointer p-6 rounded-xl border transition-all hover:shadow-sm group ${selectedCounselor?._id === counselor._id ? "border-gray-900 bg-gray-900 text-white" : "border-gray-300 bg-[#d4f8d4] hover:border-gray-400"}`}>
                <h2 className="text-xl font-bold text-center mb-2">{counselor.name}</h2>
                <p className={`text-center font-semibold text-lg mb-3 ${selectedCounselor?._id === counselor._id ? "text-gray-200" : "text-gray-600"}`}>
                  {counselor.specialty}
                </p>
                <p className={`text-center mb-4 leading-relaxed ${selectedCounselor?._id === counselor._id ? "text-gray-200" : "text-gray-600"}`}>
                  {counselor.bio}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {counselor.tags.map(tag => (
                    <span key={tag} className={`px-3 py-1 text-sm rounded-full font-medium ${selectedCounselor?._id === counselor._id ? "bg-white text-gray-900" : "bg-gray-100 text-gray-700"}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {selectedCounselor && (
            <div className="bg-white p-6 rounded-xl border border-gray-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Select Date & Time</h3>
              
              {/* Calendar Header */}
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-900">{month}</h4>
                <p className="text-lg text-gray-600">{year}</p>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-6">
                {calendar.map((day, index) => {
                  const dateString = day.date.toISOString().split('T')[0];
                  const isSelected = selectedDate === dateString;
                  const isToday = day.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <button
                      key={index}
                      onClick={() => day.isAvailable && setSelectedDate(dateString)}
                      disabled={!day.isAvailable}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        isSelected
                          ? "border-gray-900 bg-gray-900 text-white"
                          : day.isAvailable
                          ? "border-gray-300 bg-[#d4f8d4] text-gray-900 hover:border-gray-400"
                          : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                      } ${isToday ? "ring-2 ring-blue-500" : ""}`}
                    >
                      <div className={`text-sm font-medium ${isToday && !isSelected ? "text-blue-600" : ""}`}>
                        {day.date.getDate()}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Date Display */}
              {selectedDate && (
                <div className="bg-[#d4f8d4] border border-gray-300 p-4 rounded-lg text-center mb-6">
                  <p className="text-gray-700 font-medium">
                    Selected: {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}

              {/* Confirm Button */}
              <div className="text-center">
                <button 
                  onClick={handleBooking} 
                  disabled={!selectedDate}
                  className="bg-gray-900 text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Booking with {selectedCounselor.name}
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }
  };

  const currentStepData = steps[currentStep];

  return (
    <div className="min-h-screen bg-[#f0fff0] py-12 px-4">
      <div className="max-w-6xl mx-auto bg-[#f0fff0] p-8">
        {currentStep > 1 && currentStep < 6 && (
          <>
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-medium text-gray-600">Step {currentStep - 1} of 4</span>
                <span className="text-lg font-medium text-gray-600">{Math.round(((currentStep - 1) / 4) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-900 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / 4) * 100}%` }} />
              </div>
            </div>
            <button onClick={prevStep} className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-all group text-lg font-medium">
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </>
        )}

        <div className="animate-fadeIn max-w-2xl mx-auto">
          {currentStep !== 1 && currentStep !== 6 && <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">{currentStepData.title}</h1>}
          {currentStepData.content}
        </div>

        {message && (
          <div className="mt-10 bg-[#d4f8d4] border border-gray-300 p-6 rounded-xl text-center text-gray-800 animate-fadeIn">
            <span className="text-lg font-medium">{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;