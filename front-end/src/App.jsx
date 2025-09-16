import { Brain, CheckCircle } from 'lucide-react';
function App() {
  const navButtons = ['Home', 'About','Resource','Login'];
  const featuresLeft = [
    "Monthly mental health check-ins",
    "Safe student forums"
  ];
  const featuresRight = [
    "Easy appointment booking",
    "Counselor dashboards with insights"
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f0]">
      {/* Header Section */}
      <header className="bg-[#f5f5f0] py-3">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-2xl font-bold text-gray-900">MindConnect</span>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center space-x-3">
            {navButtons.map((button) => (
              <button 
                key={button}
                className="bg-white text-blue-500 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition border border-gray-300"
              >
                {button}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 bg-[#f5f5f0]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          {/* Text Content */}
          <div className="md:w-1/2 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Supporting Student <br /> Mental Health
            </h1>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              A safe space for students to connect <br />
              with counselors and track their <br />
              wellbeing.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
                Learn More
              </button>
              <button className="bg-white text-blue-500 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-100 transition border border-gray-300">
                Login
              </button>
            </div>
          </div>

          {/* Image Container */}
          <div className="md:w-1/2 flex justify-center p-4">
            <img 
              src="images/home-image.PNG"
              alt="Students connecting with MindConnect" 
              className="rounded-lg w-full h-auto object-contain max-h-96"
            />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-[#f5f5f0] py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-left">Why MindConnect?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div className="space-y-3 text-left">
              {featuresLeft.map((feature) => (
                <FeatureItem 
                  key={feature}
                  icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
                  text={feature}
                />
              ))}
            </div>
            <div className="space-y-3 text-left">
              {featuresRight.map((feature) => (
                <FeatureItem 
                  key={feature}
                  icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
                  text={feature}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-300 max-w-5xl mx-auto mt-3"></div>

      {/* Footer */}
      <footer className="py-3 bg-[#f5f5f0]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-1 md:mb-0">
              © 2025 MindConnect
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-blue-500 transition">Contact</a>
              <a href="#" className="text-gray-600 hover:text-blue-500 transition">Privacy Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <div className="flex items-center space-x-2">
      {icon}
      <span className="text-gray-700">{text}</span>
    </div>
  );
}

export default App;