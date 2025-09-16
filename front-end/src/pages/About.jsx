// pages/About.jsx
import { CheckCircle, Users, Heart, Shield, Target } from 'lucide-react';

function About() {

  


  return (
    <div className="min-h-screen bg-[#f5f5f0] py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About MindConnect</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Many students struggle with mental health challenges but hesitate to seek help directly. MindConnect motivates regular check-ins through our intuitive platform, 
                provides a safe space for expression, and connects students with professional 
                counselors before problems escalate.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-xl p-8 shadow-md mb-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/3 flex justify-center">
              <div className="bg-blue-100 p-6 rounded-full">
                <Target className="h-16 w-16 text-blue-500" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
              MindConnect was created to help students deal with mental health challenges in school. We believe all students should have access to good mental health support, no matter who they are or where they come from.
              </p>
              <p className="text-gray-700">
              Our platform connects students with mental health professionals, giving them a safe and easy way to get help without fear or judgment.
              </p>
            </div>
          </div>
        </div>

       
    

      </div>
    </div>
  );
}

export default About;