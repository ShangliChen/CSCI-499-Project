// pages/Login.jsx
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isStudent, setIsStudent] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple mock authentication (replace later with real backend call)
    if (email && password) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userType", isStudent ? "student" : "counselor");
      alert(`Welcome back, ${isStudent ? "student" : "counselor"}!`);
      navigate("/resources"); // Redirect back to resources or previous page
    } else {
      alert("Please enter both email and password.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f0fff0] py-8 flex items-center justify-center">
      <div className="container mx-auto px-4 max-w-md">
        <div className="bg-white rounded-xl p-8 shadow-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-[#e6ffee] p-3 rounded-full">
                <LogIn className="h-8 w-8 text-[#98FF98]" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in to access your MindConnect account</p>
          </div>

          {/* Login type toggle */}
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <button
              onClick={() => setIsStudent(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                isStudent ? 'bg-white shadow-sm text-[#98FF98]' : 'text-gray-600'
              }`}
            >
              Student Login
            </button>
            <button
              onClick={() => setIsStudent(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                !isStudent ? 'bg-white shadow-sm text-[#98FF98]' : 'text-gray-600'
              }`}
            >
              Counselor Login
            </button>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#98FF98] focus:border-[#98FF98]"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-[#98FF98] focus:border-[#98FF98]"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-[#98FF98] focus:ring-[#98FF98] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-[#98FF98] hover:text-[#87e687]">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-black bg-[#98FF98] hover:bg-[#87e687] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#98FF98]"
            >
              Sign in
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="#" className="text-[#98FF98] hover:text-[#87e687] font-medium">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
