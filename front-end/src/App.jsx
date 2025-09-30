import { Routes, Route, Link } from "react-router-dom";
import { Brain } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Resource from './pages/Resource';
import UserType from './UserType';
import Login from './login';
import Signup from './Signup';
import HealthAssessment from './pages/HealthAssessment';
import StudentDashboard from "./pages/StudentDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";


function App() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen flex flex-col bg-[#f0fff0]">
      {/* Header Section */}
      <header className="bg-[#f0fff0] py-3 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 cursor-pointer">
            <Brain className="h-8 w-8 text-[#98FF98]" />
            <span className="text-2xl font-bold text-gray-900">MindConnect</span>
          </Link>
          
          {/* Navigation buttons */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg font-medium transition border ${
                currentPath === '/' 
                  ? 'bg-[#98FF98] text-black border-[#98FF98]' 
                  : 'bg-white text-[#98FF98] border-gray-300 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg font-medium transition border ${
                currentPath === '/about' 
                  ? 'bg-[#98FF98] text-black border-[#98FF98]' 
                  : 'bg-white text-[#98FF98] border-gray-300 hover:bg-gray-100'
              }`}
            >
              About
            </Link>
            <Link
              to="/resource"
              className={`px-4 py-2 rounded-lg font-medium transition border ${
                currentPath === '/resource' 
                  ? 'bg-[#98FF98] text-black border-[#98FF98]' 
                  : 'bg-white text-[#98FF98] border-gray-300 hover:bg-gray-100'
              }`}
            >
              Resource
            </Link>
            <Link
              to="/user-type"
              className={`px-4 py-2 rounded-lg font-medium transition border ${
                currentPath === '/user-type' 
                  ? 'bg-[#98FF98] text-black border-[#98FF98]' 
                  : 'bg-white text-[#98FF98] border-gray-300 hover:bg-gray-100'
              }`}
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content with Routes */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resource" element={<Resource />} />
          <Route path="/user-type" element={<UserType />} />
          <Route path="/login/:userType" element={<Login />} />
          <Route path="/signup/:userType" element={<Signup />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/counselor" element={<CounselorDashboard />} />
          <Route path="/resources/health-assessment" element={<HealthAssessment />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
