import { Link } from "react-router-dom";

function Resource() {
  const resources = [
    {
      img: "/images/selfguidelogo.png",
      title: "Self-Help Guides",
      description:
        "Access resources on managing stress, anxiety, and mental health concerns.",
      link: "/resources/self-help-guide",
    },
    {
      img: "/images/relaxinggamelogo.png",
      title: "Relaxing Games",
      description:
        "Play therapeutic games designed to reduce stress and improve wellbeing.",
      link: "/resources/relaxing-games",
    },
    {
      img: "/images/healthlogo.png",
      title: "Health Assessment Tool",
      description:
        "Anonymous tools to help you understand your mental health.",
      link: "/resources/assessment-selection",
    },
    {
      img: "/images/appointmentlogo.png",
      title: "Booking with a counselor",
      description:
        "View availability and schedule a session with a verified counselor.",
      link: "/resources/booking",
    },
  ];

  return (
    <div
      className="min-h-screen py-14 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/resourcepage.png')" }}
    >
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 text-center mb-3 leading-tight">
          Explore Resources to Support <br /> Your Mental Wellbeing
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-700 text-center max-w-xl mx-auto">
          Access guides, games, assessments, and counseling options—all in one place.
        </p>

        {/* Cards */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {resources.map((item, index) => (
            <div
              key={index}
              className="bg-[#dfffea] rounded-xl p-8 shadow-md text-center"
            >
              {/* Smaller Circle Logo */}
              <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 shadow">
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-full object-cover scale-110"
                />
              </div>

              <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>

              <p className="text-gray-700 text-base mt-2 leading-relaxed">
                {item.description}
              </p>

        <Link
          to={item.link}
          className="mt-4 inline-block bg-[#98D7C2] text-green-1200 px-5 py-2 rounded-full text-base font-semibold hover:bg-[#7bcfaf] transition"
        >
          Learn More
        </Link>

            </div>
          ))}
        </div>

        {/* Emergency Section */}
        <div className="mt-14 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            Need Immediate Help?
          </h2>

          <p className="text-gray-700 text-base mb-4">
            If you're in crisis, please contact these 24/7 resources:
          </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">

          <button
            onClick={() => {
              if (window.confirm("⚠️ Emergency Only — Do you want to call 911?")) {
                window.location.href = "tel:911";
              }
            }}
            className="bg-[#4CAF50] text-white px-6 py-2 rounded-full text-base font-semibold hover:bg-[#3e9c45] transition"
          >
            Crisis Hotline: 911
          </button>

        <Link
          to="/emergency"
          className="bg-white text-[#4CAF50] px-6 py-2 rounded-full text-base font-semibold border border-[#4CAF50] hover:bg-gray-100 transition inline-block"
        >
          Emergency Resources
        </Link>


        </div>

        </div>

      </div>
    </div>
  );
}

export default Resource;
