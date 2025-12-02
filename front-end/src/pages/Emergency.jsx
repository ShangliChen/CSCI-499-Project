import { Link } from "react-router-dom";

function EmergencyResources() {
  const resources = [
    {
      img: "/images/911.png",
      title: "Emergency Services (911)",
      description:
        "If you or someone else is in immediate danger, call 911 for emergency assistance.",
      website: "https://www.911.gov",
      chat: null,
    },
    {
      img: "/images/988.png",
      title: "Suicide & Crisis Lifeline (988)",
      description:
        "If you're feeling depressed, anxious, or in emotional distress, trained counselors are available 24/7.",
      website: "https://988lifeline.org",
      chat: "https://988lifeline.org/chat/",
    },
    {
      img: "/images/crisis.png",
      title: "Crisis Text Line",
      description:
        "Text HOME to 741741 to connect with a trained crisis counselor anytime.",
      website: "https://www.crisistextline.org",
      chat: "https://www.crisistextline.org/chat/",
    },
    {
      img: "/images/samhsa.png",
      title: "SAMHSA Helpline",
      description:
        "Free, confidential mental health and substance use help available 24/7.",
      website: "https://www.samhsa.gov/find-help/national-helpline",
      chat: null,
    },
  ];

  return (
    <div
      className="min-h-screen py-16 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/resourcepage.png')" }}
    >
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-6 leading-tight">
          Emergency Help & Mental Health Hotlines
        </h1>

        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto mb-10">
          If you’re in crisis or need help immediately, these 24/7 services are available.
        </p>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {resources.map((item, index) => (
            <div
              key={index}
              className="bg-[#dfffea] rounded-2xl shadow-lg overflow-hidden"


            >
              {/* BIG TOP IMAGE */}
              <div className="w-full h-72 bg-[#dfffea] flex items-center justify-center">


                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-contain p-6"
                />
              </div>

              {/* CONTENT */}
              <div className="p-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>

                <p className="text-gray-700 text-base mt-3 leading-relaxed">
                  {item.description}
                </p>

                {/* Website Button */}
                <a
                  href={item.website}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full mt-4 px-4 py-2 bg-[#98D7C2] text-black font-semibold rounded-lg hover:bg-[#7bcfaf] transition"
                >
                  Visit Website
                </a>

                {/* Chat Online Button */}
                {item.chat && (
                  <a
                    href={item.chat}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full mt-3 px-4 py-2 bg-[#98D7C2] text-black font-semibold rounded-lg hover:bg-[#7bcfaf] transition"
                  >
                    Chat Online
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default EmergencyResources;
