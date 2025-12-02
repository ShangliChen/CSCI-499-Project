import { Routes, Route, Link, useNavigate, useLocation, Navigate } from "react-router-dom";
import { Brain } from 'lucide-react';
import Home from './pages/Home';
import About from './pages/About';
import Resource from './pages/Resource';
import Forum from './pages/Forum';
import UserType from './UserType';
import Login from './login';
import Signup from './Signup';
import StudentDashboard from "./pages/StudentDashboard";
import CounselorDashboard from "./pages/CounselorDashboard";
import CounselorDocs from "./pages/CounselorDocs";
import StudentProfile from "./pages/StudentProfile";
import CounselorProfile from "./pages/CounselorProfile";
import AssessmentList from "./pages/AssessmentList";
import AssessmentSelection from "./pages/AssessmentSelection";
import StressAssessment from "./pages/StressAssessment";
import AnxietyAssessment from "./pages/AnxietyAssessment";
import DepressionAssessment from "./pages/DepressionAssessment";
import BookingPage from "./pages/BookingPage";
import SelfHelpGuide from './pages/SelfHelpGuide';
import AssessmentDetailsView from './pages/AssessmentDetailsView'; 
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminCounselorDetail from './pages/AdminCounselorDetail';
import ViewAllAppointments from "./pages/ViewAllAppointments";
import NotificationPage from "./pages/NotificationPage";
import CounselorViewAllAppointments from "./pages/CounselorViewAllAppointments";
import RelaxingGames from "./pages/RelaxingGames";
import ArticlesPage from "./pages/ArticlesPage";
import Article1 from "./pages/articles/Article1";
import Article2 from "./pages/articles/Article2";
import Article3 from "./pages/articles/Article3";
import Article4 from "./pages/articles/Article4";
import Article5 from "./pages/articles/Article5";
import CopingTechniques from "./pages/CopingTechniques";
import CounselorList from "./pages/CounselorList";
import Emergency from "./pages/Emergency";


function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const user = JSON.parse(localStorage.getItem('user'));

  const handleDashboardClick = () => {
    if (user && user.role) {
      navigate(`/dashboard/${user.role}`);
    } else {
      navigate('/user-type');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const getNavClass = (path) => {
    return currentPath === path
      ? 'bg-[#98FF98] text-black border-[#98FF98]'
      : 'bg-white text-black border-gray-300 hover:bg-gray-100';
  };

  return (
  <div className="min-h-screen flex flex-col bg-[#F0FFF0]">
    {/* Header */}
    <header className="bg-[#f0fff0] py-3 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-8 flex items-center justify-between">

        {/* Logo */}
      <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
        <Brain className="h-7 w-7 text-[#4CAF50]" />
        <span className="text-3xl font-semibold text-gray-900">MindConnect</span>
      </Link>


        {/* Middle Tabs */}
        <nav className="flex items-center space-x-10">

          {/* Home */}
          <Link
            to="/"
            className={`
              text-gray-800 font-medium text-lg pb-2 
              transition-all duration-300
              ${currentPath === '/' 
                ? 'border-b-4 border-[#135D37]' 
                : 'border-b-4 border-transparent hover:border-[#135D37]'
              }
            `}
          >
            Home
          </Link>

          {/* About */}
          <Link
            to="/about"
            className={`
              text-gray-800 font-medium text-lg pb-2 
              transition-all duration-300
              ${currentPath === '/about' 
                ? 'border-b-4 border-[#135D37]' 
                : 'border-b-4 border-transparent hover:border-[#135D37]'
              }
            `}
          >
            About
          </Link>

          {/* Resource */}
          <Link
            to="/resource"
            className={`
              text-gray-800 font-medium text-lg pb-2 
              transition-all duration-300
              ${currentPath === '/resource' 
                ? 'border-b-4 border-[#135D37]' 
                : 'border-b-4 border-transparent hover:border-[#135D37]'
              }
            `}
          >
            Resource
          </Link>

          {/* Forum */}
          <Link
            to="/forum"
            className={`
              text-gray-800 font-medium text-lg pb-2 
              transition-all duration-300
              ${currentPath === '/forum' 
                ? 'border-b-4 border-[#135D37]' 
                : 'border-b-4 border-transparent hover:border-[#135D37]'
              }
            `}
          >
            Forum
          </Link>

          {/* Dashboard */}
          <button
            onClick={handleDashboardClick}
            className={`
              text-gray-800 font-medium text-lg pb-2 
              transition-all duration-300
              ${currentPath.startsWith('/dashboard') 
                ? 'border-b-4 border-[#135D37]' 
                : 'border-b-4 border-transparent hover:border-[#135D37]'
              }
            `}
          >
            Dashboard
          </button>

        </nav>




        {/* Right Side */}
        <div className="flex items-center space-x-6">

          {user ? (
            <button 
              onClick={handleLogout}
              className="text-gray-800 font-medium hover:text-black transition"
            >
              Logout
            </button>
          ) : (
            <Link 
              to="/user-type"
              className="text-gray-800 font-medium hover:text-black transition"
            >
              Login
            </Link>
          )}

          {/* Blue rounded button */}
          <Link
            to="/signup/student"
            className="
              relative overflow-hidden 
              px-6 py-2 text-lg font-medium rounded-full 
              border-2 border-[#98D7C2] text-black 
              transition-all duration-500 group
            "
          >
            {/* fill animation layer */}
            <span
              className="
                absolute inset-0 bg-[#98D7C2] 
                translate-x-[-100%] 
                group-hover:translate-x-0 
                transition-transform duration-500
              "
            ></span>

            {/* text stays visible above the fill */}
            <span className="relative z-10">Get Started</span>
          </Link>


        </div>

      </div>
    </header>



      {/* Main Content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/resource" element={<Resource />} />
          <Route path="/forum" element={<RequireAuth roles={["student", "counselor"]}><Forum /></RequireAuth>} />
          <Route path="/user-type" element={<UserType />} />
          <Route path="/login/:userType" element={<Login />} />
          <Route path="/signup/:userType" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/counselors/:id" element={<AdminCounselorDetail />} />
          <Route path="/counselor-docs" element={<CounselorDocs />} />
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/counselor" element={<CounselorDashboard />} />
          <Route path="/student/profile/:id" element={<StudentProfile />} />
          <Route path="/counselor/profile/:id" element={<CounselorProfile />} />
          <Route path="/counselor/assessments" element={<AssessmentList />} />
          <Route path="/resources/assessment-selection" element={<AssessmentSelection />} />
          <Route path="/resources/stress-assessment" element={<StressAssessment />} />
          <Route path="/resources/anxiety-assessment" element={<AnxietyAssessment />} />
          <Route path="/resources/depression-assessment" element={<DepressionAssessment />} />
          <Route path="/resources/booking" element={<BookingPage />} />
          <Route path="/resources/self-help-guide" element={<SelfHelpGuide />} />
          <Route path="/counselor/user/:userId" element={<AssessmentDetailsView />} />
          <Route path="/student/view-all-appointments" element={<ViewAllAppointments />} />
          <Route path="/counselor/notifications" element={<NotificationPage />} />

          <Route path="/student/view-all-appointments" element={<ViewAllAppointments />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/counselor/notifications" element={<NotificationPage />} />
          <Route path="/counselor/view-all-appointments"element={<CounselorViewAllAppointments />}/>
          <Route path="/resources/relaxing-games" element={<RelaxingGames />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/1" element={<Article1 />} />
          <Route path="/articles/2" element={<Article2 />} />
          <Route path="/articles/3" element={<Article3 />} />
          <Route path="/articles/4" element={<Article4 />} />
          <Route path="/articles/5" element={<Article5 />} />
          <Route path="/coping-techniques" element={<CopingTechniques />} />
          <Route path="/counselors" element={<CounselorList />} />
          <Route path="/emergency" element={<Emergency />} />


        </Routes>
      </main>
    </div>
  );
}

export default App;

// Simple in-app auth guard using localStorage user
function RequireAuth({ roles = [], children }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  // If not logged in or role not allowed, redirect to user-type (login chooser)
  if (!user || (roles.length && !roles.includes(user.role))) {
    return <Navigate to="/user-type" state={{ from: location.pathname }} replace />;
  }
  return children;
}
