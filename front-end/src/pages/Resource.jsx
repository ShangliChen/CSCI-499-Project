// pages/Resource.jsx
import { BookOpen, FileText, Calendar } from 'lucide-react';
import { Gamepad2 } from 'lucide-react';
import { Link } from "react-router-dom";  // ✅ added

function Resource() {
  const resources = [
    {
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      title: "Self-Help Guides",
      description: "Access our library of resources on managing stress, anxiety, and other mental health concerns."
    },
    {
      icon: <Gamepad2 className="h-8 w-8 text-blue-500" />,
      title: "Relaxing Games",
      description: "Play our therapeutic games designed to reduce stress and improve mental wellbeing."
    },
    {
      icon: <FileText className="h-8 w-8 text-blue-500" />,
      title: "Health Assessment Tool",
      description: "Anonymous self-assessment tools to help you understand your mental health."
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-500" />,
      title: "Booking with a counselor",
      description: "View upcoming availability"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f0fff0] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Resources</h1>
        <p className="text-lg text-gray-600 mb-8 text-center max-w-2xl mx-auto">
          Explore our collection of mental health resources designed to support your wellbeing journey.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {resources.map((resource, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start mb-4">
                <div className="bg-[#e6ffee] p-2 rounded-lg mr-4">
                  {resource.icon}
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{resource.title}</h2>
              </div>
              <p className="text-gray-700 ml-14">{resource.description}</p>

              {/* ✅ If Health Assessment Tool → Link to quiz page */}
              {resource.title === "Health Assessment Tool" ? (
                <Link 
                  to="/resources/health-assessment" 
                  className="ml-14 mt-4 text-[#98FF98] font-medium hover:text-[#87e687] transition"
                >
                  Explore →
                </Link>
              ) : (
                <button className="ml-14 mt-4 text-[#98FF98] font-medium hover:text-[#87e687] transition">
                  Explore →
                </button>
              )}
            </div>
          ))}
        </div>
        
        <div className="bg-[#e6ffee] rounded-xl p-8 mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Immediate Help?</h2>
          <p className="text-gray-700 mb-6">
            If you're in crisis or need to speak with someone immediately, please contact these 24/7 resources:
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-[#98FF98] text-black px-5 py-2.5 rounded-lg font-medium hover:bg-[#87e687] transition">
              Crisis Hotline: 911
            </button>
            <button className="bg-white text-[#98FF98] px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition border border-gray-300">
              Emergency Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Resource;
