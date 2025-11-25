// pages/About.jsx
function About() {
  return (
    <div className="min-h-screen bg-white">   {/* <-- PAGE IS NOW WHITE */}

      {/* Hero Section (Mint Green Only at Top) */}
      <div className="bg-[#ccf7c8] py-20">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center gap-10">

          {/* Left Text */}
          <div className="md:w-1/2">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              About MindConnect
            </h1>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="/images/nhs-video.jpg"
              alt="MindConnect Mission"
              className="rounded-xl shadow-lg object-cover w-full h-[300px] md:h-[350px]"
            />
          </div>

        </div>
      </div>

      {/* Mission Section (Pure White) */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-lg leading-relaxed mb-6 font-[Georgia] text-gray-700">
          <span className="float-left text-6xl font-bold leading-none mr-3 font-[Georgia] text-gray-900">
            M
          </span>
            Many students struggle with mental health challenges but hesitate to seek help directly. MindConnect 
            provides a safe space for regular check-ins, emotional expression, and access to professional counselors
            before problems escalate. goes with MindConnect was created to help students deal with mental health challenges
              in school. We believe all students deserve access to good mental health support, no matter who they are or where
              they come from
          </p>

          
        <p className="text-lg leading-relaxed font-[Georgia] text-gray-700">
            Our platform connects students with licensed counselors, giving them a safe and easy way 
            to get help without fear or judgment.
          </p>

        </div>
      </div>

    </div>
  );
}

export default About;
