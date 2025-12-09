import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const BookingPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const baseURL = API_BASE_URL;

  // --- Auth guard (unchanged)
  useEffect(() => {
    if (!user) {
      alert("Please log in as a student to access booking.");
      navigate("/login/student");
    } else if (user.role !== "student") {
      alert("Only students can book a counselor. Please log in with a student account.");
      navigate("/login/student");
    }
  }, [navigate, user]);

  // --- State (kept same structure)
  const [counselors, setCounselors] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const [answers, setAnswers] = useState({
    seekingFor: "",
    patientAge: "",
    appointmentType: "",
    takenTest: "",
    testScore: ""
  });

  // *******************************
  // 1) Fetch real counselors + availability
  // *******************************
  // 1) Fetch real counselors + availability (Updated to include profilePicture)
useEffect(() => {
  const fetchCounselors = async () => {
    try {
      const res = await fetch(`${baseURL}/api/counselors`);
      const payload = await res.json();

      if (!payload || payload.success === false) {
        console.error("Failed to load counselors");
        setCounselors([]);
        return;
      }

      // Handle both response shapes
      const rawCounselors = Array.isArray(payload.counselors) ? payload.counselors : [];
      const rawAvailability = Array.isArray(payload.availability) ? payload.availability : null;

      if (!rawAvailability) {
        // Shape A: counselors already have availability embedded
        const normalized = rawCounselors.map(c => ({
          _id: c._id,
          name: c.name,
          email: c.email,
          license: c.license,
          specialization: c.specialization,
          profilePicture: c.profilePicture || "", // ✅ Add this line
          availability: Array.isArray(c.availability) ? c.availability : []
        }));
        setCounselors(normalized);
      } else {
        // Shape B: merge availability into counselors by _id
        const byId = new Map();
        rawCounselors.forEach(c => {
          byId.set(String(c._id), {
            _id: c._id,
            name: c.name,
            email: c.email,
            license: c.license,
            specialization: c.specialization,
            profilePicture: c.profilePicture || "", // ✅ Add this line
            availability: []
          });
        });

        rawAvailability.forEach(a => {
          const counselorId =
            typeof a.counselor === "string" ? a.counselor : a.counselor?._id;
          if (!counselorId) return;

          // If this counselor wasn't in list, create a minimal one from availability
          if (!byId.has(String(counselorId))) {
            byId.set(String(counselorId), {
              _id: counselorId,
              name: typeof a.counselor === "object" && a.counselor?.name ? a.counselor.name : "Counselor",
              email: "N/A",
              license: "",
              specialization: "",
              profilePicture: "", // ✅ Add this line
              availability: []
            });
          }

          const entry = byId.get(String(counselorId));
          entry.availability.push({
            date: a.date,
            timeSlots: Array.isArray(a.timeSlots) ? a.timeSlots : []
          });
        });

        setCounselors(Array.from(byId.values()));
      }
    } catch (err) {
      console.error("Error fetching counselors:", err);
      setCounselors([]);
    }
  };

  fetchCounselors();
}, []);

  // *******************************
  // 2) Original calendar generator — kept as-is but we’ll gate clickable days by real availability
  // *******************************
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const generateCalendar = (monthDate = calendarMonth) => {
  const currentMonth = monthDate.getMonth();
  const currentYear = monthDate.getFullYear();
  const today = new Date();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const calendar = [];

    // Prev month padding
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      calendar.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
        isAvailable: false
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentYear, currentMonth, i);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      // We'll override availability below based on counselor availability
      calendar.push({
        date,
        isCurrentMonth: true,
        isAvailable: !isWeekend && date > today
      });
    }

    // Next month padding to fill 6 rows (42 cells)
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
      month: monthDate.toLocaleDateString("en-US", { month: "long" }),
      year: currentYear,
    };
  };
    // ✅ Determine month/year to show on calendar dynamically
  const displayedMonthDate = selectedDate
    ? new Date(selectedDate)
    : (selectedCounselor?.availability?.length > 0
        ? new Date(selectedCounselor.availability[0].date)
        : new Date()
      );


  const { calendar, month, year } = generateCalendar(calendarMonth);
  const handlePrevMonth = () => {
  setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
};

const handleNextMonth = () => {
  setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
};
  const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  // *******************************
  // 3) Availability helpers (real data)
  // *******************************
      const availableDates = useMemo(() => {
        if (!selectedCounselor || !Array.isArray(selectedCounselor.availability)) return new Set();
        // Only dates in YYYY-MM-DD; store in a Set for quick lookup
        return new Set(selectedCounselor.availability.map(a => a.date));
      }, [selectedCounselor]);

      const [bookedTimes, setBookedTimes] = useState([]);

    useEffect(() => {
      const fetchBookedTimes = async () => {
        if (!selectedCounselor || !selectedDate) return;
        try {
          const res = await fetch(
            `${baseURL}/api/bookings/booked/${selectedCounselor._id}/${selectedDate}`
          );
          const data = await res.json();
          if (data.success && Array.isArray(data.bookedTimes)) {
          setBookedTimes(data.bookedTimes);
        } else {
          setBookedTimes([]); // ✅ Always fallback to empty array
        }
        } catch (err) {
          console.error("Error fetching booked times:", err);
        }
      };
      fetchBookedTimes();
    }, [selectedCounselor, selectedDate]);

  const availableTimes = useMemo(() => {
    if (!selectedCounselor || !selectedDate) return [];

    const daySlots =
      selectedCounselor.availability?.find(a => a.date === selectedDate)?.timeSlots || [];

    return daySlots.filter(slot => {
      return !bookedTimes.some(book => book.time === slot); // ✅ Prevent double booking
    });
  }, [selectedCounselor, selectedDate, bookedTimes]);


    // *******************************
    // 4) Original filters — keep behavior (tags not present on real data, so we keep all)
    // *******************************
    const filteredCounselors = useMemo(() => {
      return Array.isArray(counselors) ? counselors : [];
    }, [counselors]);

    // *******************************
    // 5) Handlers — kept your original logic
    // *******************************
    const handleAnswer = (question, value) => {
      setAnswers(prev => ({ ...prev, [question]: value }));
    };

    const nextStep = () => setCurrentStep(prev => prev + 1);
    const prevStep = () => setCurrentStep(prev => prev - 1);
    const skipToResults = () => setCurrentStep(5);

    const handleCounselorSelect = (counselor) => {
      setSelectedCounselor(counselor);
      setSelectedDate("");
      setSelectedTime("");
      setCurrentStep(6);
    };

  const handleBooking = async () => {
    if (!selectedCounselor || !selectedDate || !selectedTime) {
      return setMessage("⚠️ Please select counselor, date, and time.");
    }

    if (!answers.appointmentType) {
      return setMessage("⚠️ Please choose a session type (Video, In-Person, Phone...)");
    }

    try {
      const res = await fetch(`${baseURL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user.userId,
          counselorId: selectedCounselor._id,
          date: selectedDate,
          time: selectedTime,
          meetingType: answers.appointmentType,
          status: "confirmed",
          note: answers.note,
        }),
      });

    const data = await res.json();
      if (data.success) {
        setMessage(`🎉 You have successfully booked with ${selectedCounselor.name} on ${selectedDate} at ${selectedTime}.`);
        // Optional: auto redirect to dashboard after 3 seconds
        setTimeout(() => navigate("/student/dashboard"), 3000);
      } else {
        setMessage("⚠️ This slot is no longer available. Please choose another.");
      }

  } catch (error) {
    console.error("Booking error:", error);
    setMessage("❌ Server error occurred. Try again later.");
  }
};




  // *******************************
  // 6) Original button styles — unchanged
  // *******************************
  const buttonStyles = (isSelected = false) => 
    `p-6 rounded-xl border text-left transition-all hover:shadow-sm group w-full ${
      isSelected 
        ? "border-[#2e8b57] bg-[#2e8b57] text-white" 
        : "border-gray-300 bg-[#d4f8d4] text-gray-900 hover:border-gray-400"
    }`;

  const smallButtonStyles = (isSelected = false) =>
    `p-4 rounded-lg border text-center transition-all hover:shadow-sm ${
      isSelected
        ? "border-[#2e8b57] bg-[#2e8b57] text-white"
      : "border-gray-300 bg-[#d4f8d4] text-gray-900 hover:border-gray-400"
    }`;

  const timeButtonStyles = (isSelected = false) =>
    `p-3 rounded-lg border text-center transition-all ${
      isSelected
        ? "border-[#2e8b57] bg-[#2e8b57] text-white"
        : "border-gray-300 bg-[#d4f8d4] text-gray-900 hover:border-gray-400"
    }`;

  // *******************************
  // 7) Steps — preserved from your original structure (Only counselor/availability bits changed)
  // *******************************
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
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextSibling;
          if (fallback) fallback.style.display = 'block';
        }}
      />
      <div style={{display: 'none'}} className="text-gray-600 text-sm">
        Booking Icon
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Find Your Perfect Counselor
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        Answer a few quick questions so we can match you with the right mental health professional.
      </p>

      {/* ✅ Only one button now */}
      <button
        onClick={nextStep}
        className="px-8 py-4 bg-[#2e8b57] text-white rounded-lg font-semibold hover:bg-[#267349] transition-all flex items-center text-lg mx-auto"
      >
        Get Started
        <ArrowRight className="ml-3 h-6 w-6" />
      </button>
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
                  {answers.seekingFor === option.value && <div className="w-2 h-2 bg-[#2e8b57] rounded-full" />}
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
      title: "Recommended Counselors",
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredCounselors.map((c) => (
              <div
                key={c._id}
                onClick={() => handleCounselorSelect(c)}
                className={`cursor-pointer p-6 rounded-xl border shadow-md transition-all ${
                  selectedCounselor?._id === c._id
                    ? "border-[#2e8b57] bg-[#ccf2d9]"
                    : "border-gray-200 bg-[#d4f8d4] hover:border-gray-300"
                }`}
              >
                {/* Profile Image or Letter Avatar */}
                <div className="flex justify-center mb-4">
                  {c.profilePicture ? (
                    <img
                      src={`${baseURL}${c.profilePicture}`}
                      alt="Counselor"
                      className="w-20 h-20 rounded-lg object-cover bg-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-700">
                      {c.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name */}
                <h2 className="text-lg font-semibold text-center text-gray-900">
                  {c.name || "Unnamed Counselor"}
                </h2>

                {/* Specialization */}
                <p className="text-sm text-center text-gray-700 mb-4">
                  {Array.isArray(c.specializations) && c.specializations.length > 0
                    ? c.specializations.join(", ")
                    : typeof c.specialization === "string" && c.specialization.trim()
                    ? c.specialization
                    : "General Counselor"}
                </p>

                {/* Info Box */}
                <div className="bg-white rounded-lg p-4 shadow-sm text-sm text-gray-800">
                  <p className="mb-1"><strong>Email:</strong> {c.email || "N/A"}</p>
                  <p className="mb-1"><strong>License Number:</strong> {c.license || "N/A"}</p>
                  <p className="mb-1">
                    <strong>Specializations:</strong>{" "}
                    {Array.isArray(c.specializations) && c.specializations.length > 0
                      ? c.specializations.join(", ")
                      : "CBT, ACT, Trauma"}
                  </p>
5: {
  title: "Recommended Counselors",
  content: (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredCounselors.map((c) => (
          <div
            key={c._id}
            onClick={() => handleCounselorSelect(c)}
            className={`cursor-pointer p-6 rounded-xl border shadow-md transition-all ${
              selectedCounselor?._id === c._id
                ? "border-[#2e8b57] bg-[#ccf2d9]"
                : "border-gray-200 bg-[#d4f8d4] hover:border-gray-300"
            }`}
          >
            {/* Profile Image or Letter Avatar - UPDATED */}
            <div className="flex justify-center mb-4">
              {c.profilePicture ? (
                <img
                  src={`${baseURL}${c.profilePicture}`} // ✅ Use baseURL
                  alt={`${c.name}'s profile`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    const fallback = parent.querySelector('.fallback-avatar');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg font-bold text-gray-700 border-2 border-white shadow">
                  {c.name?.charAt(0).toUpperCase() || "C"}
                </div>
              )}
              {/* Hidden fallback avatar */}
              <div 
                className="fallback-avatar hidden w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-lg font-bold text-gray-700 border-2 border-white shadow"
              >
                {c.name?.charAt(0).toUpperCase() || "C"}
              </div>
            </div>

            {/* Name */}
            <h2 className="text-lg font-semibold text-center text-gray-900">
              {c.name || "Unnamed Counselor"}
            </h2>

            {/* Specialization */}
            <p className="text-sm text-center text-gray-700 mb-4">
              {Array.isArray(c.specializations) && c.specializations.length > 0
                ? c.specializations.join(", ")
                : typeof c.specialization === "string" && c.specialization.trim()
                ? c.specialization
                : "General Counselor"}
            </p>

            {/* Info Box */}
            <div className="bg-white rounded-lg p-4 shadow-sm text-sm text-gray-800">
              <p className="mb-1"><strong>Email:</strong> {c.email || "N/A"}</p>
              <p className="mb-1"><strong>License Number:</strong> {c.license || "N/A"}</p>
              <p className="mb-1">
                <strong>Specializations:</strong>{" "}
                {Array.isArray(c.specializations) && c.specializations.length > 0
                  ? c.specializations.join(", ")
                  : "CBT, ACT, Trauma"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
},


6: {
  title: "Schedule Your Appointment",
  content: (
    <div className="space-y-8">
      
      {/* ✅ Selected Counselor Info */}
      <div className="bg-[#d4f8d4] p-6 rounded-xl border border-gray-300">
        <h2 className="text-2xl font-bold text-center mb-1">
          Booking with {selectedCounselor?.name}
        </h2>
        {selectedCounselor?.specialization && (
          <p className="text-center text-gray-600">
            {selectedCounselor.specialization}
          </p>
        )}
      </div>

      {/* ✅ Calendar and Times */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ✅ Date Calendar */}
        <div className="bg-white p-6 rounded-xl border border-gray-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Select Date</h3>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={handlePrevMonth}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <h4 className="text-lg font-bold text-gray-900">{month}</h4>
            <p className="text-gray-600">{year}</p>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>


          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm text-gray-500">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendar.map((day, i) => {
              const dateStr = day.date.toISOString().split("T")[0];
              const isSelectable = day.isCurrentMonth && availableDates.has(dateStr);
              const selected = dateStr === selectedDate;
              
              return (
                <button
                  key={i}
                  disabled={!isSelectable}
                  onClick={() => isSelectable && setSelectedDate(dateStr)}
                  className={`p-2 rounded-lg text-sm transition ${
                    selected
                      ? "bg-[#2e8b57] text-white"
                      : isSelectable
                      ? "bg-[#d4f8d4] hover:bg-[#b6e6b6]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}>
                  {day.date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        {/* ✅ Time Slot Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-300">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Select Time</h3>

          {!selectedDate ? (
            <p className="text-center text-gray-500">
              Please select a date first
            </p>
          ) : availableTimes.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {availableTimes.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-lg border text-center transition ${
                    selectedTime === time
                      ? "bg-[#2e8b57] text-white"
                      : "bg-[#d4f8d4] hover:bg-[#b6e6b6]"
                  }`}>
                  {time}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No times available for this date
            </p>
          )}
        </div>

      </div>
      {/* ✅ Student Note Prompt */}
      <div className="bg-white p-6 rounded-xl border border-gray-300">
        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
          Add a Note (Optional)
        </h3>
        <textarea
          value={answers.note || ""}
          onChange={(e) => setAnswers((prev) => ({ ...prev, note: e.target.value }))}
          placeholder="Leave a short note to help your counselor understand your goals or concerns"
          className="w-full h-28 border border-gray-300 rounded-lg p-3 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#2e8b57] resize-none"
        />
      </div>


      {/* ✅ Booking Summary */}
      {(selectedDate || selectedTime) && (
        <div className="bg-[#d4f8d4] p-6 rounded-xl border border-gray-300 text-center">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Appointment Summary</h4>
          {selectedDate && <p><strong>Date:</strong> {selectedDate}</p>}
          {selectedTime && <p><strong>Time:</strong> {selectedTime}</p>}
        </div>
      )}

      {/* ✅ Confirm Button */}
      <div className="flex justify-center">
        <button
          className="px-8 py-4 bg-[#2e8b57] text-white font-semibold rounded-lg disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!selectedDate || !selectedTime}
          onClick={handleBooking}>
          Confirm Booking
        </button>
      </div>

    </div>
  )
},
  }

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
                <div className="bg-[#2e8b57] h-2 rounded-full transition-all duration-500" style={{ width: `${((currentStep - 1) / 4) * 100}%` }} />
              </div>
            </div>
            <button onClick={prevStep} className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-all group text-lg font-medium">
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
          </>
        )}

        {currentStep === 6 && (
          <button onClick={() => setCurrentStep(5)} className="flex items-center text-gray-600 hover:text-gray-800 mb-8 transition-all group text-lg font-medium">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Counselors
          </button>
        )}

        <div className="animate-fadeIn max-w-4xl mx-auto">
          {currentStep !== 1 && currentStep !== 6 && <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">{currentStepData.title}</h1>}
          {currentStepData.content}
        </div>
        {message && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-300">
              <h2 className="text-xl font-bold text-[#2e8b57] mb-4">Booking Confirmed ✅</h2>
              <p className="text-gray-800 mb-6">{message}</p>
              <button
              onClick={() => navigate("/student/dashboard")}
              className="bg-[#2e8b57] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#267349] transition-all"
            >
              Go to Dashboard
            </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingPage;
