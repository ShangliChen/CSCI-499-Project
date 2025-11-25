// pages/Home.jsx
import { CheckCircle } from 'lucide-react';

function Home() {
  const featuresLeft = [
    "Monthly mental health check-ins",
    "Safe student forums"
  ];
  const featuresRight = [
    "Easy appointment booking",
    "Counselor dashboards with insights"
  ];

  function FeatureItem({ icon, text }) {
    return (
      <div className="flex items-center space-x-2">
        {icon}
        <span className="text-gray-700">{text}</span>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-8 bg-[#f0fff0]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">

          {/* Left Text */}
          <div className="md:w-1/2 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              Supporting Student <br /> Mental Health
            </h1>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              A safe space for students to connect <br />
              with counselors and track their <br />
              wellbeing.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">

              {/* Learn More */}
              <a
                href="/about"
                className="px-6 py-2.5 bg-[#98D7C2] text-black rounded-full font-semibold
                transition-all duration-200 hover:bg-[#99EDC3]"
              >
                Learn More
              </a>

              {/* Login */}
              <a
                href="/user-type"
                className="px-6 py-2.5 rounded-full font-semibold border border-[#98D7C2]
                text-[#135D37] hover:bg-[#98D7C2] transition-all duration-200"
              >
                Login
              </a>
            </div>
            </div>

          {/* Image */}
          <div className="md:w-1/2 flex justify-center p-4">
            <img
              src="images/home-image.PNG"
              alt="Students connecting with MindConnect"
              className="rounded-lg w-full h-auto object-contain max-h-96"
            />
          </div>

        </div> {/* ← THIS DIV WAS MISSING BEFORE */}
      </section>

      {/* Features Section */}
      <section className="bg-[#f0fff0] py-6">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-4 text-left">Why MindConnect?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
            <div className="space-y-3 text-left">
              {featuresLeft.map(feature => (
                <FeatureItem
                  key={feature}
                  icon={<CheckCircle className="h-5 w-5 text-[#135D37]" />}
                  text={feature}
                />
              ))}
            </div>

            <div className="space-y-3 text-left">
              {featuresRight.map(feature => (
                <FeatureItem
                  key={feature}
                  icon={<CheckCircle className="h-5 w-5 text-[#135D37]" />}
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
      <footer className="py-3 bg-[#f0fff0]">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-1 md:mb-0">© 2025 MindConnect</div>

          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 hover:text-[#135D37] transition">Contact</a>
            <a href="#" className="text-gray-600 hover:text-[#135D37] transition">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
