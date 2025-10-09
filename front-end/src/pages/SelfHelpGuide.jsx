import { useState } from "react";

function MindConnectResources() {
  const [activeTab, setActiveTab] = useState("Suggested Reading");

  const tabs = [
    "Suggested Reading",
    "Listen & Reflect",
    "Watch & Learn",
    "Try a Self-Help Course"
  ];

  const resources = {
    "Suggested Reading": [
      {
        title: "CCI Self-Help PDFs",
        description: "Evidence-based workbooks and resources from the Centre for Clinical Interventions.",
        link: "https://www.cci.health.wa.gov.au/Resources/Looking-After-Yourself",
        image: "/images/cci.jpg"
      },
      {
        title: "NHS Mental Health Guides",
        description: "Self-help leaflets on anxiety, depression, and stress from the NHS.",
        link: "https://www.nhs.uk/mental-health/",
        image: "/images/nhs.jpg"
      }
    ],
    "Listen & Reflect": [
      {
        title: "Smiling Mind",
        description: "Mindfulness and meditation app designed for all age groups.",
        link: "https://www.smilingmind.com.au/",
        image: "/images/smiling-mind.jpg"
      },
      {
        title: "Greater Good in Action (GGIA)",
        description: "Science-based practices for a meaningful life from UC Berkeley.",
        link: "https://ggia.berkeley.edu/",
        image: "/images/ggia.jpg"
      }
    ],
    "Watch & Learn": [
      {
        title: "NHS Mental Health Videos",
        description: "Watch videos on managing mental health from the NHS library.",
        link: "https://www.nhs.uk/mental-health/self-help/",
        image: "/images/nhs-video.jpg"
      },
      {
        title: "Guided Breathing Exercise",
        description: "Follow along with this calming guided breathing routine.",
        link: "https://www.youtube.com/watch?v=SEfs5TJZ6Nk",
        image: "/images/breathing.jpg"
      }
    ],
    "Try a Self-Help Course": [
      {
        title: "MoodGYM",
        description: "Interactive CBT training to prevent and manage depression and anxiety.",
        link: "https://moodgym.com.au/",
        image: "/images/moodgym.jpg"
      },
      {
        title: "This Way Up",
        description: "Online courses for mental health, including anxiety and depression.",
        link: "https://thiswayup.org.au/",
        image: "/images/thiswayup.jpg"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-[#f0fff0] px-4 py-10">
      {/* Banner */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Self-Help Guides</h1>
        <p className="text-lg text-gray-600 mb-4">
          Your guide to support & information
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              activeTab === tab
                ? "bg-[#98FF98] text-black"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources[activeTab].map((resource, index) => (
          <a
            key={index}
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white shadow-md overflow-hidden hover:shadow-lg transition"
          >
            <img
              src={resource.image}
              alt={resource.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {resource.title}
              </h3>
              <p className="text-gray-600 text-sm">{resource.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default MindConnectResources;
